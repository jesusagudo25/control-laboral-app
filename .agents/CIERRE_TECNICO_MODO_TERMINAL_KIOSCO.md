# Cierre técnico - Modo Terminal/Kiosco

## 1. Estado general

El flujo funcional del Modo Terminal/Kiosco quedó implementado de forma progresiva en la rama:

```text
feature/modo-terminal-kiosco
```

El objetivo del modo kiosco es permitir que un trabajador se identifique mediante QR en un dispositivo compartido y pueda realizar acciones de fichaje sin afectar el flujo actual del Modo Personal.

Estado actual del flujo:

```text
kiosk_config
→ kiosk_validate_qr
→ workerToken temporal
→ company_info
→ user_info
→ user_turn preliminar
→ selección de horario si aplica
→ kiosk_shift_status
→ geolocalización
→ kiosk_fichaje real
→ confirmación real
→ limpieza temporal
→ idle timeout / TTL de seguridad
→ regreso a QR
```

## 2. Principios respetados

- No se modificó la lógica actual del Modo Personal.
- No se reutilizó `AuthProvider.login()` para kiosco.
- No se guardó el token kiosco en `AsyncStorage["token"]`.
- El `workerToken` vive únicamente en memoria dentro del flujo kiosco.
- No se modificó el interceptor global de Axios.
- Se usó una capa API aislada para kiosco.
- No se modificaron archivos nativos.
- No se instalaron dependencias durante las fases funcionales.
- Se respetó la regla actual del modo personal: `ficharpausa` habilita **Pausar** y **Finalizar jornada**.

## 3. Fases implementadas

### Fase 1 - Separación del flujo visual

Se extrajo la lógica visual del modo kiosco desde `Login.js` hacia un orquestador propio:

```text
src/components/kiosk/KioskFlow.js
```

Resultado:

- `Login.js` quedó más limpio.
- El modo personal se mantiene separado.
- El flujo kiosco quedó preparado para crecer sin contaminar autenticación personal.

### Fase 2 - Servicio aislado de API kiosco

Se creó:

```text
src/services/kioskApi.js
```

Funciones preparadas:

- `getKioskConfig`
- `validateKioskQr`
- `getCompanyInfo`
- `getUserInfo`
- `getUserTurn`
- `selectUserTurn`
- `getKioskShiftStatus`
- `submitKioskFichaje`

Características:

- Recibe `apiUrl` explícitamente.
- Recibe `workerToken` cuando aplica.
- Usa la cabecera:

```text
Authorizationtoken: Bearer <workerToken>
```

- Usa instancia aislada de Axios.
- No usa `AsyncStorage`, `AuthProvider`, `ApiProvider` ni `SecureStore`.

### Fase 3 - Conexión de `kiosk_config`

Se conectó:

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=kiosk_config
```

Se validan:

- `apiUrl`
- `success`
- `enabled`
- `idle_timeout_seconds`
- `confirmation_timeout_seconds`
- `worker_session_ttl_seconds`

Resultado:

- Si `enabled=true`, el terminal QR queda disponible.
- Si `enabled=false`, se muestra mensaje de modo kiosco no disponible.
- Los errores HTTP o respuestas inválidas muestran mensaje controlado y opción de reintento.

### Fase 4 - Validación QR con `kiosk_validate_qr`

Se conectó:

```http
POST {{URL_API}}/custom/fichajes/api/index.php
```

Payload:

```json
{
  "action": "kiosk_validate_qr",
  "qr_code": "valor_leido"
}
```

Resultado esperado:

```json
{
  "success": true,
  "access_token": "token_temporal"
}
```

Resultado implementado:

- El QR se valida contra backend.
- El `workerToken` queda solo en memoria.
- Se evita doble lectura.
- Se registran tiempos de sesión del trabajador.
- Respuestas inválidas o token ausente dejan al usuario en terminal.

### Fase 5 - Carga de `company_info` y `user_info`

Después del QR válido se cargan:

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=company_info
GET {{URL_API}}/custom/fichajes/api/index.php?action=user_info
```

Uso de `company_info`:

- Nombre de empresa.
- Logo si aplica.

Uso de `user_info`:

- `firstname`
- `lastname`
- `geolocal`

No se usa:

- `notifications`
- `status` para decidir acciones.
- datos personales para persistencia.

### Fase 6 - `user_turn` preliminar y selección de horario

Se reutilizó el contrato actual:

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=user_turn
```

Si existen múltiples horarios, se muestra una vista propia:

```text
src/components/kiosk/KioskTurnSelectorView.js
```

Al seleccionar horario se envía:

```json
{
  "action": "user_turn",
  "date": "<dateUserTurn>",
  "idHorarioM": "<selectedTurn.id>"
}
```

Resultado:

- El turno queda resuelto antes de mostrar acciones.
- No se reutilizó `CardSelectTurn.js` del modo personal.
- No se navega a `Signing`.

### Fase 7 - Conexión de `kiosk_shift_status`

Se conectó:

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=kiosk_shift_status
```

Se creó normalizador aislado:

```text
src/utils/kioskActions.js
```

Mapeo implementado:

```text
Entrada.action = ficharentrada
→ Iniciar

Pausa.action = ficharpausa
→ Iniciar pausa
→ Finalizar jornada

Reanudacion.action = ficharreanudacion
→ Reanudar

Firma.action = ficharfirma
→ Firmar
```

Regla importante:

```text
Finalizar jornada se prepara como ficharsalida cuando viene Pausa.action = ficharpausa.
```

Esto copia el comportamiento confirmado del Modo Personal.

### Fase 8 - Geolocalización kiosco

Se creó:

```text
src/hooks/useKioskLocation.js
```

Reglas:

- Si `user_info.geolocal === "1"` o `"2"`, solicita permiso y obtiene ubicación con `expo-location`.
- Si `geolocal` viene `null` u otro valor, usa coordenadas contractuales `0,0`.
- Si falla GPS o permiso, se muestra error controlado sin romper la sesión.
- La ubicación vive solo en memoria.

### Fase 9 - Registro real con `kiosk_fichaje`

Se conectó:

```http
POST {{URL_API}}/custom/fichajes/api/index.php
```

Payload base:

```json
{
  "action": "kiosk_fichaje",
  "date": "<kioskWorkDate o dateUserTurn>",
  "fichaje": "<accion seleccionada>",
  "description": "<descripcion si aplica>",
  "motivo_pausa": "<motivo si aplica>",
  "long": "<location.longitude>",
  "lat": "<location.latitude>",
  "signature": "<firma si aplica>"
}
```

Mapeo final:

- Iniciar → `ficharentrada`
- Iniciar pausa → `ficharpausa`
- Reanudar → `ficharreanudacion`
- Finalizar jornada → `ficharsalida`
- Firmar → `ficharfirma`

Componentes propios creados:

```text
src/components/kiosk/KioskPauseModal.js
src/components/kiosk/KioskSignatureView.js
```

Resultado:

- Pausa exige motivo cuando existen motivos.
- Firma exige firma antes de enviar.
- Se evita doble envío.
- No se reutilizó `SignDay.js`.
- No se modificó `ActionSigning.js`.

### Fase 10 - Confirmación y limpieza temporal

Se centralizó:

```text
resetWorkerSession(reason)
```

Limpia:

- QR
- token temporal
- datos del trabajador
- política de geolocalización
- turno
- acciones
- motivos
- ubicación
- acción seleccionada
- resultado
- errores/loaders
- referencias activas

Conserva:

- `apiUrl`
- `kioskConfig`
- `companyInfo`
- modo seleccionado
- estado del Modo Personal

Resultado:

- Tras `kiosk_fichaje success=true`, se muestra confirmación.
- Usa `confirmation_timeout_seconds`.
- Al vencer el contador, limpia sesión y vuelve al QR.
- Un segundo trabajador no ve datos del anterior.

### Fase 11 - Idle timeout y TTL absoluto

Se creó:

```text
src/hooks/useKioskTimers.js
```

Reglas:

- `idle_timeout_seconds` controla inactividad.
- `worker_session_ttl_seconds` controla duración absoluta de sesión.
- El idle se reinicia con interacción.
- El TTL no se reinicia nunca con interacción.
- Si idle vence: `resetWorkerSession("idle_timeout")`.
- Si TTL vence: `resetWorkerSession("worker_session_ttl")`.

Interacciones que reinician idle:

- Seleccionar/confirmar horario.
- Presionar acción.
- Reintentar.
- Elegir motivo de pausa.
- Escribir descripción.
- Dibujar/guardar firma.

### Fase 12 - Validación integral estática

Validación satisfactoria para:

- Flujo kiosco completo.
- QR válido/inválido.
- Carga de empresa/trabajador.
- Turnos simples y múltiples.
- Acciones reales.
- Pausa con motivo.
- Firma obligatoria.
- Geolocalización.
- Fichaje real.
- Confirmación y limpieza.
- Idle timeout.
- TTL absoluto.
- Aislamiento del token.
- Cliente Axios independiente.
- Modo Personal intacto por hash.

Pendiente:

- Prueba manual real en Android físico.
- Validación con backend real.
- Validación de permisos GPS en dispositivo.
- Validación de dos trabajadores consecutivos.
- Validación visual de expiraciones.
- Validación de lectura QR real si se reemplaza el campo simulado.

## 4. Archivos principales del modo kiosco

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskTerminalView.js
src/components/kiosk/KioskActionsView.js
src/components/kiosk/KioskTurnSelectorView.js
src/components/kiosk/KioskConfirmationView.js
src/components/kiosk/KioskPauseModal.js
src/components/kiosk/KioskSignatureView.js
src/hooks/useKioskLocation.js
src/hooks/useKioskTimers.js
src/services/kioskApi.js
src/utils/kioskActions.js
```

## 5. Archivos personales protegidos

Durante las fases se evitó modificar:

```text
AuthProvider.js
ApiProvider.js
App.js
ButtonSigning.js
ActionSigning.js
Signing.js
SignDay.js
CardSelectTurn.js
```

## 6. Punto delicado: QR simulado antes del build interno

Actualmente el flujo utiliza una entrada controlada para simular o introducir el valor QR.

Para un build interno en Android real, este campo no debe quedar visible como experiencia final si el objetivo es validar el flujo real de kiosco.

Recomendación técnica:

- Mantener el campo de QR manual solo para desarrollo.
- Ocultarlo en builds internos/preview/producción.
- Implementar lectura real de QR antes del build interno funcional.
- Si todavía no se implementa lectura QR real, el build interno solo debe considerarse build técnico de API, no prueba completa de experiencia kiosco.

Opciones aceptables:

### Opción A - Recomendada para probar flujo completo real

Implementar lector QR real antes del build interno.

Resultado:

```text
Android real
→ cámara
→ escaneo QR
→ kiosk_validate_qr
→ flujo completo kiosco
```

Esta es la opción correcta si el objetivo es validar la experiencia real.

### Opción B - Permitida solo para QA técnico

Mantener input manual solo bajo bandera de desarrollo:

```text
__DEV__ === true
```

o mediante una bandera explícita:

```text
enableKioskDebugQr === true
```

Resultado:

- En desarrollo se puede escribir QR manualmente.
- En build interno no aparece el campo manual.
- Si no hay lector real, no se puede validar E2E real desde Android.

## 7. Recomendación antes del build interno

Antes de generar build interno para Android real, ejecutar una fase corta de endurecimiento:

```text
Fase 13 - Preparar lectura QR real y ocultar entrada manual
```

Objetivo:

- Revisar si el proyecto ya tiene dependencia disponible para lectura QR/cámara.
- Implementar lector QR real si es posible.
- Ocultar o eliminar el input manual en builds no-dev.
- Mantener un modo debug controlado solo para desarrollo.
- No tocar modo personal.

## 8. Validaciones mínimas para Android real

Después de preparar QR real:

```text
1. Instalar build interno en Android físico.
2. Configurar apiUrl real.
3. Entrar a modo kiosco.
4. Validar kiosk_config.
5. Escanear QR válido.
6. Validar QR inválido.
7. Cargar empresa y trabajador.
8. Validar turno simple.
9. Validar turno múltiple.
10. Validar acciones reales.
11. Registrar entrada.
12. Registrar pausa con motivo.
13. Registrar reanudación.
14. Registrar salida.
15. Validar firma si aplica.
16. Validar GPS permitido.
17. Validar GPS denegado.
18. Validar confirmación automática.
19. Validar idle timeout.
20. Validar TTL absoluto.
21. Validar dos trabajadores seguidos.
22. Confirmar que el trabajador anterior no queda visible.
23. Validar Modo Personal completo.
```

## 9. Comandos técnicos antes del build

```bash
git status --short
git diff --check
npx expo install --check
npx expo-doctor
npx expo start --dev-client --clear
```

Si `expo install --check` o `expo-doctor` reportan patches pendientes, corregirlos en una fase técnica separada antes del build.

## 10. Build interno Android

Cuando la validación previa esté limpia:

```bash
eas build -p android --profile preview
```

Si el perfil interno usa otro nombre en `eas.json`, usar el perfil correspondiente.

Para producción o release formal:

```bash
eas build -p android --profile production
```

## 11. Conclusión

El modo Terminal/Kiosco quedó funcionalmente estructurado, conectado y aislado del Modo Personal.

El flujo ya contiene:

- configuración remota,
- validación QR,
- token temporal,
- carga de trabajador,
- carga de empresa,
- resolución de turnos,
- acciones reales,
- geolocalización,
- fichaje real,
- confirmación,
- limpieza de sesión,
- seguridad por inactividad y TTL.

El siguiente paso no debe ser agregar más lógica de fichaje, sino preparar la experiencia real de QR para Android físico y ejecutar prueba interna conectada.
