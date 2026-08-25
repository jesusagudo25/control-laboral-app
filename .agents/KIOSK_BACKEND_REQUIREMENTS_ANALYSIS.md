# Requisitos backend - Modo Terminal/Kiosco

Fecha del analisis: 2026-08-24  
Alcance: analisis del frontend actual; no se implementaron servicios ni endpoints.

## 1. Resumen ejecutivo

La aplicacion consume un modulo API de Dolibarr con Axios mediante un unico punto de entrada:

```text
{apiUrl}/custom/fichajes/api/index.php
```

Las operaciones se seleccionan con `action`: en la query para los `GET` y en el JSON para `POST`/`PATCH`. El fichaje personal ya delega en backend tanto las acciones disponibles (`user_buttons`) como el registro (`user_fichaje`). Esa logica de negocio debe reutilizarse internamente para kiosco.

Los endpoints personales actuales no son reutilizables directamente desde la pantalla kiosco: el kiosco aparece antes del login y, por tanto, no tiene el token de un trabajador. Permitir que `user_fichaje` reciba simplemente un `workerId` ampliaria indebidamente sus permisos. Backend debe autenticar el terminal y emitir, tras validar el QR, una sesion de trabajador breve y limitada a fichaje.

Recomendacion minima: incorporar al mismo `index.php` las acciones `kiosk_config`, `kiosk_validate_qr`, `kiosk_shift_status` y `kiosk_fichaje`, manteniendo el envelope actual (`success`, `msg`, `data`) y agregando codigos de error estables.

## 2. API actual detectada

### Archivos relevantes

| Archivo | Funcion actual |
| --- | --- |
| `App.js` | Interceptor global de Axios; lee `token` de AsyncStorage y envia `Authorizationtoken: Bearer <token>`. |
| `src/context/ApiProvider.js` | Carga/guarda `apiUrl` en AsyncStorage y consulta `company_info`. |
| `src/screens/auth/Login.js` | Configura la URL desde el engranaje, autentica al usuario y contiene el flujo kiosco simulado. |
| `src/context/AuthProvider.js` | Guarda el access token y controla la sesion personal. |
| `src/screens/home/Home.js` | Consulta `user_info`; aporta nombre, geolocalizacion, estado y notificaciones. |
| `src/screens/home/signing/Signing.js` | Consulta turno (`user_turn`) y acciones permitidas (`user_buttons`). |
| `src/components/ButtonSigning.js` | Registra entrada, pausa, reanudacion y salida mediante `user_fichaje`. |
| `src/screens/home/signing/SignDay.js` | Registra salida con firma mediante `user_fichaje`. |
| `src/components/CardSelectTurn.js` | Selecciona horario mediante `user_turn`. |
| `src/screens/request/*`, `src/screens/document/*` | Referencias adicionales del patron `action`, `success`, `msg`, `data`. |

### URL base y requests

- `apiUrl` no viene de variables de entorno: el usuario la introduce en el engranaje del login.
- Se valida como URL HTTP/HTTPS, se normaliza con `trim().toLowerCase()` y se persiste bajo la clave `apiUrl` de AsyncStorage.
- No existe una instancia central de Axios, `baseURL`, timeout comun ni capa de servicios. Las llamadas se realizan directamente desde pantallas/componentes.
- Patron actual:
  - `GET .../index.php?action=<accion>&...`
  - `POST .../index.php` con `{ "action": "<accion>", ... }`
  - Tambien se usan `PATCH` y `DELETE` sobre el mismo punto de entrada.

### Autenticacion

- Login: `POST index.php` con `action: "auth"`, `grant_type: "client_credentials"`, `client_id` y `client_secret`.
- Respuesta esperada: `access_token` en la raiz.
- El token se guarda en AsyncStorage como `token`.
- El interceptor agrega una cabecera no estandar llamada exactamente `Authorizationtoken`, cuyo valor es `Bearer <token>`.
- No se observa refresh token ni renovacion automatica.
- El modo kiosco actual se ejecuta en el login, antes de una sesion personal; requiere credencial propia del terminal o un mecanismo backend equivalente.

### Responses y errores

- Respuesta funcional predominante: `{ success, msg, data }`.
- Las lecturas suelen consumir `response.data.data`; las escrituras verifican `response.data.success` y muestran `response.data.msg` cuando falla.
- El manejo no esta centralizado: algunas pantallas tratan HTTP 500 y cierran sesion; otras muestran mensajes genericos; no hay tratamiento comun de timeout, red, 401/403 ni codigos de dominio.
- Para kiosco conviene conservar `success/msg/data`, pero agregar `error.code` estable y usar estados HTTP coherentes. La UI no debe depender de comparar textos.

## 3. Endpoints existentes reutilizables

| Operacion actual | Contrato observado | Reutilizacion recomendada |
| --- | --- | --- |
| `GET action=user_info` | `data.firstname`, `lastname`, `geolocal`, `status`, `notifications` | Reutilizar internamente la obtencion del trabajador/estado, sin exponer notificaciones ni otros datos personales al kiosco. |
| `GET action=user_turn` | Fecha, horario, marcas, tiempo trabajado, multiples horarios | Reutilizar internamente las reglas de jornada/turno. No devolver al kiosco toda la estructura si no la necesita. |
| `GET action=user_buttons` | Objetos `Firma`, `Entrada`, `Salida`, `Pausa`, `Reanudacion`; cada uno aporta `action`; pausa aporta `motivos` | Es la referencia directa para acciones permitidas. Backend debe producir la lista kiosco desde la misma regla. |
| `POST action=user_fichaje` | Campos: `fichaje`, `description`, `motivo_pausa`, `long`, `lat`, `date`; firma opcional | Reutilizar la logica de registro y validacion, no el endpoint personal sin adaptar identidad/autorizacion. |
| `POST action=user_turn` | `date`, `idHorarioM` | Puede ser necesario si un trabajador tiene multiples horarios; el flujo kiosco debe definir como resolverlo. |

Codigos reales de accion detectados:

```text
ficharentrada
ficharpausa
ficharreanudacion
ficharsalida
ficharfirma
```

No se detectaron endpoints de configuracion kiosco, QR, autenticacion de terminal ni fichaje por trabajador identificado. Tampoco hay integracion real de camara/QR. La pantalla usa un trabajador y dos acciones locales simuladas.

## 4. Endpoints nuevos sugeridos

Las rutas siguientes respetan el estilo actual. Si backend decide versionar o crear rutas REST, debe mantener contratos equivalentes.

### 4.1 Obtener configuracion

**Metodo:** `GET`  
**Ruta:** `/custom/fichajes/api/index.php?action=kiosk_config`  
**Objetivo:** Obtener configuracion efectiva para el terminal/empresa.  
**Autorizacion:** Credencial de terminal; no token de trabajador.  
**Request:** Cabecera/identidad de terminal acordada; `device_id` solo si backend lo considera confiable.  
**Response (`data`):** `enabled`, `idle_timeout_seconds`, `confirmation_timeout_seconds`, `worker_session_ttl_seconds`; opcionalmente textos parametrizados.  
**Errores:** `KIOSK_DISABLED`, `TERMINAL_UNAUTHORIZED`, `KIOSK_CONFIG_UNAVAILABLE`.  
**Notas:** Definir limites backend para evitar valores nulos, negativos o excesivos. No fijar el timeout como unica fuente en frontend.

### 4.2 Validar QR e identificar trabajador

**Metodo:** `POST`  
**Ruta:** `/custom/fichajes/api/index.php`  
**Objetivo:** Validar un QR opaco, identificar datos minimos y crear una sesion efimera de fichaje.  
**Request:**

```json
{
  "action": "kiosk_validate_qr",
  "qr_code": "valor-opaco-leido",
  "device_id": "terminal-001"
}
```

**Response (`data`):**

```json
{
  "worker_session_token": "token-efimero-opaco",
  "expires_at": "2026-08-24T23:32:00Z",
  "worker": {
    "display_name": "Juan Perez",
    "position": "Operario",
    "department": "ROMESUR"
  },
  "shift": {
    "status": "ACTIVE",
    "status_label": "Jornada activa",
    "business_date": "2026-08-24"
  },
  "available_actions": []
}
```

**Errores:** `QR_INVALID`, `QR_EXPIRED`, `WORKER_NOT_FOUND`, `WORKER_INACTIVE`, `CLOCKING_NOT_ALLOWED`, `TERMINAL_UNAUTHORIZED`.  
**Notas:** No devolver identificadores o datos sensibles si no son necesarios. El token efimero debe quedar ligado a trabajador, terminal, empresa, TTL y alcance de fichaje; idealmente debe ser de un solo uso o rotarse al registrar.

### 4.3 Consultar estado y acciones actuales

**Metodo:** `GET` (o `POST` si el token no debe viajar en query)  
**Ruta:** `/custom/fichajes/api/index.php?action=kiosk_shift_status`  
**Objetivo:** Revalidar estado y acciones antes de mostrarlas o después de una marcacion.  
**Request:** `worker_session_token` en una cabecera acordada, más identidad de terminal. No usar `workerId` como unica autorizacion.  
**Response (`data`):** `shift.status`, `shift.status_label`, `business_date`, restricciones y `available_actions`.  
**Errores:** `WORKER_SESSION_EXPIRED`, `NO_ACTIONS_AVAILABLE`, `TERMINAL_UNAUTHORIZED`, `WORKER_INACTIVE`.  
**Notas:** Puede omitirse como llamada inicial si `kiosk_validate_qr` ya devuelve estado/acciones, pero debe existir una forma de revalidar para evitar decisiones con estado obsoleto.

Formato recomendado de cada accion:

```json
{
  "code": "ficharpausa",
  "label": "Iniciar pausa",
  "description": "Registra una pausa temporal en tu jornada.",
  "requires_pause_reason": true,
  "requires_description": false,
  "requires_location": false,
  "requires_signature": false,
  "pause_reasons": []
}
```

### 4.4 Registrar marcacion kiosco

**Metodo:** `POST`  
**Ruta:** `/custom/fichajes/api/index.php`  
**Objetivo:** Registrar una accion permitida usando la sesion efimera del trabajador.  
**Request:**

```json
{
  "action": "kiosk_fichaje",
  "worker_session_token": "token-efimero-opaco",
  "fichaje": "ficharpausa",
  "device_id": "terminal-001",
  "source": "KIOSK",
  "motivo_pausa": null,
  "description": null,
  "client_request_id": "uuid-unico"
}
```

**Response (`data`):**

```json
{
  "record_id": "98765",
  "worker": {
    "display_name": "Juan Perez"
  },
  "action": {
    "code": "ficharpausa",
    "label": "Pausa iniciada"
  },
  "registered_at": "2026-08-24T23:31:00Z",
  "message": "Marcacion registrada correctamente.",
  "can_perform_another_action": false,
  "available_actions": []
}
```

**Errores:** `WORKER_SESSION_EXPIRED`, `ACTION_NOT_ALLOWED`, `DUPLICATE_REQUEST`, `PAUSE_REASON_REQUIRED`, `SHIFT_NOT_FOUND`, `TERMINAL_UNAUTHORIZED`, `KIOSK_DISABLED`.  
**Notas:** La fecha/hora autoritativa debe generarla backend. `client_request_id` permite idempotencia ante reintentos o doble toque. Backend debe auditar terminal, origen, trabajador, accion, instante y resultado. La ubicacion o firma solo deben pedirse si la regla existente tambien aplica al kiosco.

## 5. Contrato minimo recomendado

### Envelope compatible

Exito:

```json
{
  "success": true,
  "msg": "Operacion completada.",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "msg": "Mensaje seguro para mostrar.",
  "data": null,
  "error": {
    "code": "ACTION_NOT_ALLOWED",
    "retryable": false
  }
}
```

### Estados HTTP sugeridos

- `400`: payload o QR mal formado.
- `401`: credencial/sesion ausente o expirada.
- `403`: terminal, trabajador o accion no autorizados; kiosco deshabilitado.
- `404`: trabajador/jornada no encontrados, sin revelar informacion adicional.
- `409`: estado cambio, accion ya no permitida o solicitud duplicada.
- `422`: regla de negocio incumplida (por ejemplo, motivo requerido).
- `429`: demasiados intentos/escaneos.
- `500`: error interno.
- `503`: configuracion o servicio temporalmente no disponible.

### Reglas obligatorias

- Backend es la fuente de verdad de estado, acciones, fecha/hora y confirmacion.
- Nunca autorizar un fichaje solo por un `workerId` enviado por el cliente.
- El QR debe ser opaco o firmado; no debe contener datos personales en claro como mecanismo de autorizacion.
- Separar la credencial persistente del terminal de la sesion efimera del trabajador.
- Limitar intentos y evitar que diferencias de mensajes permitan enumerar trabajadores.
- Revalidar la accion en el momento de registrar, aunque antes estuviera listada.
- Responder siempre con codigos de dominio estables; `msg` es presentacion, no logica.
- Usar timestamps ISO 8601 con zona (`Z` u offset) y devolver aparte la fecha laboral si puede diferir del dia calendario.
- Aplicar idempotencia al registro y conservar auditoria del origen `KIOSK`.
- No registrar o devolver el QR, tokens, credenciales ni datos personales innecesarios en logs.

## 6. Dudas que backend debe resolver

1. ¿El QR sera un token opaco/firmado, quien lo genera y cual es su vigencia o politica de revocacion?
2. ¿El QR sera reutilizable o de un solo uso? ¿Como se evita compartir una captura?
3. ¿Como se aprovisiona y autentica el terminal: credencial, PIN de administrador, certificado u otro mecanismo?
4. ¿`device_id` lo asigna backend? Un identificador generado libremente por la app no prueba identidad.
5. ¿El kiosco puede operar antes de un login personal con la misma `apiUrl` configurada actualmente?
6. ¿Se conservara la cabecera `Authorizationtoken` o se definira una cabecera distinta para terminal/sesion kiosco?
7. ¿Las nuevas operaciones deben conservar `index.php?action=...` o el modulo incorporara una API versionada?
8. ¿`user_turn`, `user_buttons` y `user_fichaje` pueden reutilizarse internamente cambiando el sujeto autenticado?
9. ¿Que estados canonicos de jornada existen realmente y como se mapean a las acciones actuales?
10. ¿Que debe suceder si no hay jornada, ya finalizo, existen horarios multiples o falta seleccionar horario?
11. ¿Pausa exige siempre `motivo_pausa` y descripcion? ¿Como obtiene el kiosco los motivos vigentes?
12. ¿Geolocalizacion y firma son obligatorias para alguna accion realizada desde un terminal fijo?
13. ¿Se permite realizar otra accion sin volver a escanear? Si se permite, ¿durante cuanto tiempo?
14. ¿Cuales son los valores minimo, maximo y por defecto de los timeouts de inactividad y confirmacion?
15. ¿Que datos exactos del trabajador pueden mostrarse en un dispositivo compartido?
16. ¿Como se manejaran concurrencia y doble marcacion entre app personal y kiosco?
17. ¿Que retencion y campos exige la auditoria de marcaciones kiosco?
18. ¿Que texto debe mostrar confirmacion y debe venir localizado desde backend?

## 7. Criterios de aceptacion para habilitar la integracion frontend

- Existen credenciales/flujo de alta para un terminal y se documentan sus cabeceras.
- Configuracion devuelve `enabled` y timeouts validos.
- Validacion QR devuelve sesion efimera, identidad minima, estado y acciones.
- Acciones usan los codigos reales del fichaje personal o incluyen un mapeo oficial.
- Registro revalida estado, es idempotente y devuelve confirmacion completa.
- Estan documentados envelopes, codigos de dominio y estados HTTP para todos los errores listados.
- Se cubren trabajador inactivo, QR invalido/expirado, terminal no autorizado, sin acciones, conflicto de estado, timeout y error de red/servidor.
- Backend confirma el tratamiento de multiples horarios, pausas, ubicacion y firma.

## 8. Riesgos y limites del analisis

- **Alto:** el kiosco carece hoy de modelo de autenticacion propio; es el principal bloqueo de seguridad.
- **Alto:** reutilizar `user_fichaje` aceptando un identificador arbitrario permitiria suplantacion si no existe una autorizacion adicional.
- **Medio:** el manejo de errores actual es inconsistente y no ofrece codigos de dominio; el contrato kiosco debe definirlos antes de implementar UI.
- **Medio:** no hay timeout comun de Axios ni estrategia explicita de reintentos/idempotencia.
- **Medio:** horarios multiples, motivo de pausa, geolocalizacion y firma pueden impedir que el flujo visual actual cubra todas las reglas reales.
- Este repositorio solo permite inferir el contrato consumido por frontend. No se reviso el codigo del modulo backend Dolibarr ni su esquema de datos, por lo que backend debe confirmar nombres, estados y reglas internas.

