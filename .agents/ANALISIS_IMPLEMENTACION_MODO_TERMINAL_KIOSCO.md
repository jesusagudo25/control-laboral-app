# Análisis de implementación — Modo Terminal/Kiosco

## 1. Resumen ejecutivo

La rama `feature/modo-terminal-kiosco` ya contiene una experiencia visual kiosco de tres pasos, pero todavía no existe un flujo funcional de kiosco. El selector Personal/Kiosco, la terminal QR, la lista de acciones y la confirmación están montados directamente en `Login.js`. Hoy un toque sobre la tarjeta que representa el lector QR avanza sin validar nada; se muestran un trabajador y dos acciones hardcodeados; seleccionar una acción abre una confirmación sin efectuar un fichaje; los contadores de 60 y 5 segundos son texto estático.

La integración debe mantenerse dentro del árbol de autenticación, separada de `AuthProvider` y del flujo `Signing` personal. El dato compartido legítimo es `apiUrl`. El token devuelto por `kiosk_validate_qr` debe ser una credencial temporal conservada solo en memoria y usada mediante un cliente HTTP de kiosco que no dependa del interceptor global que lee el token personal de AsyncStorage. La configuración y la identidad visual de la empresa pertenecen a la sesión del terminal; la identidad, turno, acciones, ubicación y datos de marcación pertenecen a la sesión efímera del trabajador.

El orden funcional recomendado es: validar `apiUrl`; cargar `kiosk_config`; validar QR; guardar token temporal; cargar `company_info` y `user_info`; resolver `user_turn` y, si corresponde, seleccionar horario; cargar `kiosk_shift_status`; preparar ubicación; mostrar acciones; recopilar motivo o firma cuando corresponda; ejecutar `kiosk_fichaje`; confirmar; limpiar la sesión del trabajador y volver a la terminal. Todos los caminos de cancelación, expiración, error terminal o cambio a modo personal deben usar una única rutina de limpieza.

Este análisis conserva expresamente la regla confirmada: si `Pausa.action === "ficharpausa"`, kiosco presenta **Iniciar pausa** (`ficharpausa`) y **Finalizar jornada** (`ficharsalida`). No se propone modificar `ButtonSigning.js`, `ActionSigning.js`, el login personal ni el flujo personal de firma.

> Fuente funcional: el archivo `Flujo_de_fichaje_-_Modo_Kiosko.pdf` no está presente en el repositorio ni en el adjunto recibido. Se tomó como contrato funcional la secuencia del PDF transcrita íntegramente en la solicitud.

## 2. Archivos revisados

| Archivo | Responsabilidad observada | Relación con kiosco |
|---|---|---|
| `src/screens/auth/Login.js` | Login personal, configuración de URL y montaje visual de kiosco | Orquestador simulado actual; principal candidato a extraer/dividir |
| `src/components/common/ModeSwitch.js` | Selector local Personal/Kiosco | Ya funcional; recibe `mode` y `onChange` |
| `src/components/kiosk/KioskTerminalView.js` | Pantalla de espera/lector | Solo presentación y callback simulado |
| `src/components/kiosk/KioskActionsView.js` | Trabajador, acciones y retorno | Presentacional; temporizador hardcodeado |
| `src/components/kiosk/KioskConfirmationView.js` | Confirmación y retorno | Presentacional; fecha local y temporizador hardcodeado |
| `src/context/ApiProvider.js` | Persiste `apiUrl`; mantiene `companyName`; carga `company_info` | `apiUrl` sí es compartible; la sesión del trabajador no debe vivir aquí |
| `src/context/AuthProvider.js` | Token/identidad personal, conexión y preferencias | No debe almacenar ni activar autenticación kiosco |
| `App.js` | Interceptor Axios global con token personal | Riesgo de contaminación de cabecera kiosco |
| `src/hooks/useApi.js` | Acceso a `ApiContext` | Reutilizable para obtener `apiUrl` |
| `src/hooks/useForm.js` | Estado de formulario simple | Reutilizable en componentes kiosco de pausa si conviene |
| `src/navigation/Navigate.js` | Separa `AuthStack` y `AppStack` por autenticación personal | Kiosco ya vive correctamente antes de autenticación, dentro de Login |
| `src/screens/home/signing/Signing.js` | `user_turn`, horarios múltiples y `user_buttons` personal | Referencia conceptual, no lugar de integración kiosco |
| `src/components/CardSelectTurn.js` | UI y POST de selección de horario | Referencia reutilizable por extracción/variante; no conviene acoplarla directamente |
| `src/components/CardSigning.js` | Presenta turno y monta acciones personales | Solo referencia |
| `src/components/ActionSigning.js` | Permiso y captura de geolocalización | Referencia para un hook/servicio compartible sin alterar el componente |
| `src/components/ButtonSigning.js` | Mapea y ejecuta acciones personales, pausa y navegación a firma | Referencia de reglas; explícitamente fuera de cambios |
| `src/screens/home/signing/SignDay.js` | Canvas y POST de firma personal | La captura visual puede inspirar una vista kiosco; no debe reutilizarse con su POST actual |
| `.agents/ANALISIS_FLUJO_FICHAJE_MODO_PERSONAL.md` | Análisis previo no versionado del flujo personal | Fuente auxiliar preservada sin cambios |

También se buscaron `kiosk`, `Kiosco`, `terminal`, `qr`, `user_turn`, `user_buttons`, los cuatro endpoints kiosco y los códigos de fichaje. No hay consumo actual de `kiosk_config`, `kiosk_validate_qr`, `kiosk_shift_status` ni `kiosk_fichaje`.

## 3. Estado actual del modo kiosco visual

### Montaje

- El selector Personal/Kiosco se renderiza en `Login.js`, antes del formulario personal o de las vistas kiosco.
- `ModeSwitch` cambia el estado local `mode`. Cada cambio restablece `kioskStep` a `terminal` y borra `selectedKioskAction`.
- La pantalla Terminal se monta en `Login.js` cuando `mode === "kiosk"` y `kioskStep === "terminal"`.
- Acciones se monta cuando `kioskStep === "actions"`.
- Confirmación se monta cuando `kioskStep === "confirmation"` y hay una acción seleccionada.
- No hay rutas React Navigation exclusivas de kiosco. Las tres vistas son ramas del render de `Login`, dentro de `AuthStack`.
- El selector y el engranaje desaparecen durante acciones y confirmación, pero permanecen visibles en la terminal.

### Props actuales

| Componente | Props | Uso real hoy |
|---|---|---|
| `ModeSwitch` | `mode`, `onChange` | Selección local de modo |
| `KioskTerminalView` | `onWorkerIdentified` | Un toque avanza directamente a acciones |
| `KioskActionsView` | `worker`, `availableActions`, `onActionPress`, `onReturnToTerminal` | Renderiza datos simulados y callbacks locales |
| `KioskConfirmationView` | `worker`, `action`, `onAnotherAction`, `onReturnToTerminal` | Renderiza confirmación simulada |

Las tres vistas son componentes presentacionales razonablemente aislados. Pueden evolucionar añadiendo props de carga/error/contador sin incorporarles reglas de autenticación o llamadas HTTP.

## 4. Flujo actual detectado en la rama

```text
[Login / modo personal por defecto]
        ↓ seleccionar Kiosco
[kioskStep = terminal]
        ↓ tocar tarjeta "Simular lectura de código QR"
[kioskStep = actions]
        ↓ elegir una de dos acciones hardcodeadas
[guardar objeto de acción en selectedKioskAction]
        ↓
[kioskStep = confirmation]
        ├─ "Realizar otra acción" → actions, conservando trabajador simulado
        └─ "Volver a la terminal" → borrar acción → terminal
```

No se valida `apiUrl`, no se consulta configuración, no se abre cámara/lector, no se crea sesión, no se obtiene empresa/usuario/turno, no se solicita ubicación y no se registra nada. La fecha del encabezado se calcula una vez durante cada render de `Login`; no existe reloj con intervalo.

## 5. Estados simulados/hardcodeados actuales

### Estados reales existentes

- `mode`: `personal` o `kiosk`.
- `kioskStep`: `terminal`, `actions` o `confirmation`.
- `selectedKioskAction`: objeto elegido o `null`.
- `apiUrl`: proviene de `ApiProvider` y se persiste en AsyncStorage.

### Datos simulados

- `SIMULATED_WORKER`: `Juan Pérez`, `Operario · ROMESUR`, `Jornada activa`.
- `KIOSK_ACTIONS`: únicamente “Iniciar pausa” y “Finalizar jornada”.
- Lectura QR: toda la tarjeta es un botón con la etiqueta “Simular lectura de código QR”.
- Acción: el callback solo cambia el paso; no hay POST.
- Confirmación: siempre es exitosa.
- Fecha/hora de confirmación: `new Date()` local al montar la vista, no respuesta del servidor.
- Inactividad: texto fijo “60 segundos” y badge `00:60`.
- Retorno de confirmación: texto fijo `00:05` y “Retorno automático simulado”.
- Logo: asset local `assets/logo_small.png`; no usa `company_info.data.logo`.
- El botón “Realizar otra acción” conserva la misma identidad simulada y vuelve a acciones, conducta que debe revisarse por seguridad frente al token de uso/TTL limitado.

### Estado futuro y ubicación recomendada

Se recomienda un orquestador/contexto específico de kiosco montado solo mientras el modo kiosco está activo. `Login.js` debería delegar a un contenedor como `KioskFlow` o a un `KioskSessionProvider`; las vistas siguen presentacionales.

| Estado | Alcance recomendado |
|---|---|
| `kioskConfig`, carga y error | Sesión del terminal; memoria del flujo kiosco |
| `companyInfo` | Sesión del terminal; no borrarlo al terminar un trabajador |
| `qrValue`, `workerToken`, validación/error QR | Sesión efímera del trabajador |
| `userInfo`, `geoLocation` | Sesión efímera del trabajador |
| `dateUserTurn`, múltiples, opciones, selección y guardado | Sesión efímera del trabajador |
| `kioskActions`, `kioskMotives`, carga/error de estado | Sesión efímera del trabajador |
| `location`, `locationError` | Sesión efímera del trabajador |
| `selectedAction`, motivo, descripción y firma | Sesión de interacción/acción |
| `kioskStep`, contador idle, contador confirmación | Orquestador de kiosco |
| envío, resultado y error de fichaje | Sesión de interacción/acción |

No se recomienda colocar estos estados en `AuthProvider`: activarían o contaminarían conceptos de usuario personal. `ApiProvider` debe continuar siendo dueño de `apiUrl`; como máximo puede seguir manteniendo datos duraderos de empresa, pero es más seguro que `companyInfo` completo de kiosco viva en el contenedor kiosco para evitar cambiar el contrato personal de `ApiContext` en una primera fase.

## 6. Endpoints a integrar

| Orden | Endpoint/acción | Autorización | Resultado usado |
|---:|---|---|---|
| 1 | `GET ?action=kiosk_config` | Por confirmar: normalmente terminal/no trabajador | `enabled`, idle, confirmación y TTL |
| 2 | `POST { action: "kiosk_validate_qr", qr_code }` | Por confirmar: terminal/no trabajador | `access_token` temporal |
| 3 | `GET ?action=company_info` | Token temporal según flujo confirmado | Nombre y logo |
| 4 | `GET ?action=user_info` | Token temporal | `firstname`, `lastname`, `geolocal` |
| 5 | `GET ?action=user_turn` | Token temporal | `multiples`, `date`, `horarios` |
| 6 | `POST { action: "user_turn", date, idHorarioM }` | Token temporal | Confirmación de horario |
| 7 | `GET ?action=kiosk_shift_status` | Token temporal | Acciones, motivos y fecha laboral |
| 8 | `POST { action: "kiosk_fichaje", ... }` | Token temporal | Éxito/rechazo de marcación |

Todas las respuestas deben validarse defensivamente: presencia de `data`, tipos de configuración, `success`, token no vacío, fecha y códigos de acción reconocidos. El backend sigue siendo la autoridad y debe revalidar la transición en `kiosk_fichaje` aunque el botón proviniera de `kiosk_shift_status`.

## 7. Propuesta de ubicación de cada llamada

| Llamada | Momento | Ubicación propuesta |
|---|---|---|
| `kiosk_config` | Al cambiar a kiosco y cuando cambie `apiUrl` | Orquestador `KioskFlow` mediante servicio `kioskApi` |
| `kiosk_validate_qr` | Al entregar el lector un QR completo, con bloqueo anti-doble lectura | Handler del orquestador; la vista/lector solo emite el valor |
| `company_info` | Tras token válido; puede ejecutarse en paralelo con `user_info` | Servicio de kiosco; resultado terminal-level |
| `user_info` | Tras token válido | Servicio de kiosco; resultado worker-level |
| GET `user_turn` | Tras token válido; en paralelo con empresa/usuario si el contrato lo permite | Servicio/orquestador de kiosco |
| POST `user_turn` | Confirmación de selección de horario | Handler del orquestador o componente selector kiosco que reciba callback |
| `kiosk_shift_status` | Tras resolver que no hay múltiples o después de guardar horario | Servicio/orquestador de kiosco |
| Geolocalización | Después de `user_info`, según `geolocal`, antes de habilitar acciones | Hook reutilizable o específico, no `ActionSigning` directamente |
| `kiosk_fichaje` | Tras validar datos extra de la acción | Handler único del orquestador; nunca dentro de la tarjeta visual genérica |

Conviene centralizar URL, cabeceras, cancelación y normalización de errores en un archivo nuevo candidato, por ejemplo `src/services/kioskApi.js`. Así se evita duplicar Axios en tres vistas y se mantiene intacto el flujo personal.

### Configuración inicial

- Debe llamarse al activar modo kiosco, no al arrancar el modo personal.
- Antes del GET se valida que `apiUrl` exista y sea HTTP(S). Si falta, se conserva el engranaje y se muestra una instrucción de configuración; no se presenta un lector operativo.
- Guardar configuración en memoria es suficiente. `apiUrl` ya se persiste; no conviene persistir tiempos indefinidamente y operar con una configuración potencialmente obsoleta.
- `enabled === false`: mostrar “Modo kiosco no disponible” y deshabilitar lectura QR. Debe seguir permitiéndose cambiar a Personal y editar URL.
- Error de conexión: estado diferenciable de `enabled=false`, con botón de reintento. No asumir valores del backend silenciosamente salvo que producto defina defaults explícitos.
- Refresco: al entrar, al cambiar `apiUrl`, al reintentar manualmente y opcionalmente al volver al foreground o con una cadencia amplia mientras esté en terminal. No refrescar durante una sesión activa porque podría alterar temporizadores a mitad del trabajador.
- `idle_timeout_seconds`: tiempo máximo de inactividad desde que existe sesión de trabajador; se usa en turnos, acciones, pausa y firma.
- `confirmation_timeout_seconds`: duración de confirmación antes de limpiar y volver.
- `worker_session_ttl_seconds`: límite absoluto desde emisión/recepción del token. No debe reiniciarse con interacción; el tiempo efectivo debe ser `min(idle restante, TTL restante)`. Idealmente el backend devuelve además expiración absoluta.

## 8. Manejo del token temporal kiosco

### Hallazgo y riesgo

`AuthProvider.login()` guarda el token personal en `AsyncStorage["token"]`. El interceptor global de `App.js` lee esa clave en cada request y asigna `config.headers.Authorizationtoken = Bearer <token>`. Guardar allí el token QR pisaría la sesión personal y usar `login()` marcaría `isAuthenticated=true`, enviando la aplicación al `AppStack`. Incluso una cabecera explícita de kiosco puede ser reemplazada por el interceptor global si hay un token personal residual.

### Diseño recomendado

- Mantener `workerToken` en `useState`/`useRef` de `KioskFlow` o en `KioskSessionContext`, nunca en AsyncStorage, SecureStore, `AuthProvider` o `ApiProvider`.
- Crear una instancia Axios de kiosco aislada (`axios.create`) cuya capa de request lea el token desde una referencia en memoria o recibir el token explícitamente por llamada.
- Confirmar con backend el nombre exacto de cabecera. La aplicación actual usa la cabecera no estándar `Authorizationtoken`; no debe asumirse que kiosco usa `Authorization` sin contrato.
- Asegurar que el cliente kiosco no herede/mute el default global del token personal. Una instancia separada permite controlar esto, pero debe probarse el comportamiento de interceptores de Axios de esta versión.
- No registrar el token ni el QR en consola, analytics, crash reports o mensajes de error.
- Aplicar bloqueo de lectura mientras `isValidatingQr` sea verdadero y deduplicación breve del mismo valor para impedir sesiones/requests dobles.

El token temporal debe acompañar `company_info`, `user_info`, GET/POST `user_turn`, `kiosk_shift_status` y `kiosk_fichaje`, según el flujo confirmado. `kiosk_config` y `kiosk_validate_qr` requieren aclarar si usan una credencial del terminal distinta; no deben recibir accidentalmente el token personal.

### QR inválido

Ante `success=false`, token ausente, 400/401/403 o payload inválido: borrar `qrValue` y cualquier estado parcial, mantener/retornar a Terminal, mostrar un error breve y rearmar el lector cuando el mensaje termine. No debe crearse un trabajador ni avanzar a acciones. Los errores de transporte pueden permitir reintentar la validación con el QR aún en memoria por pocos segundos, pero al cancelar o agotar timeout se borra.

## 9. Manejo de `company_info` y `user_info`

### Empresa

`ApiProvider.saveCompanyInfo()` ya consume `company_info`, pero solo guarda `data.name`, maneja errores internamente, no retorna la promesa útil al llamador y depende del interceptor global. Usarlo directamente en kiosco impediría controlar token, logo, carga y errores. Reutilizar el endpoint y, si se desea más adelante, extraer una función pura compartida; no reutilizar esa acción de contexto tal como está.

En kiosco se recomienda guardar `{ name, logo }` en estado de terminal. Se carga tras validar el primer trabajador conforme al flujo pedido, aunque si el backend permite `company_info` sin token puede precargarse junto con `kiosk_config` para mejorar la terminal; esto es una duda contractual. La limpieza del trabajador no borra empresa ni configuración. Si el logo remoto falla se usa el asset local como fallback.

### Usuario

- Construir nombre visible con `[firstname, lastname].filter(Boolean).join(" ").trim()` y fallback neutro si ambos faltan.
- Interpretar `geolocal` con la misma semántica confirmada del backend. El modo personal solicita ubicación cuando vale string `"1"` o `"2"`; kiosco no debe asumir tipos ni significados sin confirmar.
- Ignorar `status`, `notifications`, `avatar` e `id` para decisiones del flujo solicitado. En particular, no usar `status` para construir acciones: la fuente de acciones es `kiosk_shift_status`.
- No lanzar carga de notificaciones.
- Si `user_info` falla, no mostrar acciones con identidad incompleta. 401/403/token expirado es terminal: limpiar sesión y volver. Error transitorio puede ofrecer un reintento acotado siempre que TTL siga vigente.
- Guardar `userInfo` y `geoLocation` solo en la sesión efímera y borrarlos en toda finalización.

## 10. Manejo de `user_turn` preliminar y horarios múltiples

El modo personal ya sigue la secuencia correcta en `Signing.js`: limpia estado, hace GET `user_turn`, conserva `data.date`, detecta `data.multiples` y muestra `data.horarios`; si no hay múltiples continúa a cargar estado/acciones. `CardSelectTurn` normaliza objeto o array y hace POST con `action`, `date` e `idHorarioM`.

Para kiosco debe reutilizarse el contrato y, preferiblemente, extraerse después lógica pura de normalización/formato. No debe montarse `Signing` ni navegar al flujo autenticado personal. `CardSelectTurn` actual tampoco es directamente reutilizable sin cambios porque hace su propio POST con Axios global, usa `logout()` personal, navega a `Signing` y presenta estilos/textos personales. La opción de menor riesgo es una variante `KioskTurnSelectorView` presentacional que reciba opciones, selección, loading, error y `onConfirm`.

Secuencia:

1. GET `user_turn` con token temporal.
2. Guardar `data.date` en `dateUserTurn`.
3. Interpretar estrictamente `data.multiples === true` (o normalizar el tipo documentado).
4. Si es verdadero, normalizar `data.horarios`, cambiar a paso `turn-selection` y esperar selección.
5. POST `{ action: "user_turn", date: dateUserTurn, idHorarioM: selectedTurnId }`.
6. Con `success=true`, limpiar opciones/selección y llamar `kiosk_shift_status` (opcionalmente reconsultar GET `user_turn` si backend lo exige para confirmar resolución).
7. Con rechazo de negocio, mantener selector y permitir corregir. Con token expirado, limpiar y volver a Terminal.

Debe confirmarse el tipo real de `idHorarioM`. El componente personal usa claves de objeto o índices convertidos a string cuando recibe array; kiosco no debe inventar un índice si el backend puede devolver un ID explícito.

## 11. Manejo de `kiosk_shift_status`

Consumirlo únicamente después de resolver el turno. La respuesta es equivalente conceptualmente a `user_buttons`, pero kiosco debe normalizarla a un modelo UI propio, sin importar `ButtonSigning`.

Campos reconocidos:

- `data.Entrada.action`
- `data.Pausa.action` y `data.Pausa.motivos`
- `data.Reanudacion.action`
- `data.Firma.action`
- `data.Salida.action`, si el backend lo devuelve, aunque el contrato de mapeo suministrado enfatiza la salida derivada de Pausa
- `data.date`

La fecha operativa de `kiosk_shift_status.data.date` debe ser la fuente preferente para `kiosk_fichaje`. Compararla con `dateUserTurn`; si ambas existen y difieren, no elegir silenciosamente: bloquear el envío, refrescar el estado o mostrar error de sincronización. Nunca usar la fecha/hora local de la tablet como fecha laboral.

### Motivos

El modo personal espera `Pausa.motivos` como objeto y lo transforma en `{ id: key, label }`. Kiosco debe admitir el formato contractual confirmado y validar elementos. Ejemplo de normalización conceptual:

```text
objeto { "2": { label: "Descanso" } }
→ [{ id: "2", label: "Descanso" }]
```

No usar `Object.keys` sin comprobar que `motivos` sea un objeto. Si existe `ficharpausa` pero no hay motivos válidos, la pausa debe mostrarse deshabilitada o generar un error de estado; no permitir un POST que incumple la regla de motivo obligatorio. “Finalizar jornada” sigue disponible conforme a la regla confirmada.

### Sin acciones

Una respuesta exitosa sin acciones reconocidas debe mostrar un estado explícito (“No hay acciones disponibles”) con retorno a terminal y, si producto lo desea, reintento. No agregar un código ficticio `none` al array visible ni deducir acciones por `user_info.status`.

## 12. Mapeo de acciones a botones

| Fuente backend | Botón kiosco | `fichaje` enviado | Datos extra |
|---|---|---|---|
| `Entrada.action === "ficharentrada"` | Iniciar | `ficharentrada` | Ninguno adicional |
| `Pausa.action === "ficharpausa"` | Iniciar pausa | `ficharpausa` | Motivo obligatorio; descripción opcional |
| La misma `Pausa.action === "ficharpausa"` | Finalizar jornada | `ficharsalida` | Ninguno adicional |
| `Reanudacion.action === "ficharreanudacion"` | Reanudar | `ficharreanudacion` | Ninguno adicional |
| `Firma.action === "ficharfirma"` | Firmar | `ficharfirma` | Firma obligatoria |
| `Salida.action === "ficharsalida"`, si se confirma su uso | Finalizar jornada | `ficharsalida` | Ninguno adicional |

El normalizador debe usar IDs estables por código y propósito, por ejemplo `pause` y `finish`, porque Pausa produce dos tarjetas. Debe deduplicar “Finalizar jornada” si el backend enviara simultáneamente `Pausa=ficharpausa` y `Salida=ficharsalida`.

`ButtonSigning.js` ya implementa la asimetría Pausa → Pausar + Finalizar, pero también contiene POST, modales, navegación y estado personal. No se toca ni se importa. Se replica únicamente la regla de mapeo en un helper kiosco testeable.

## 13. Manejo de `kiosk_fichaje`

Debe existir un único handler `submitKioskFichaje` en el orquestador/servicio. La tarjeta solo entrega una acción normalizada.

Payload base:

```json
{
  "action": "kiosk_fichaje",
  "date": "<kiosk_shift_status.data.date>",
  "fichaje": "<código de la acción>",
  "description": "",
  "motivo_pausa": "",
  "long": "<longitud o valor contractual>",
  "lat": "<latitud o valor contractual>",
  "signature": "<solo cuando aplique>"
}
```

- `date`: preferentemente de `kiosk_shift_status`; `user_turn.data.date` es respaldo/verificación, no fecha del dispositivo.
- `fichaje`: solo uno de los códigos permitidos y derivado del modelo normalizado, nunca texto arbitrario de UI.
- `lat`/`long`: de la captura asociada a esta sesión. Confirmar si backend espera string, número, `0`, `null` u omisión cuando geolocalización no aplica.
- `motivo_pausa`: únicamente para `ficharpausa`, validado contra los motivos cargados. Puede ser string si esa es la clave recibida.
- `description`: opcional para pausa según regla confirmada; normalizar/recortar y respetar límite del backend. Para otras acciones enviar vacío u omitir según contrato.
- `signature`: data URI/base64 solo para `ficharfirma`; omitir en otras acciones para reducir payload y evitar datos residuales.

Bloquear botones mientras se envía, proteger contra doble toque y mantener un identificador local de intento si backend ofrece idempotencia. Con `success=true`, capturar los datos de confirmación necesarios, cambiar a confirmación y evitar nuevas solicitudes con la misma acción. Con `success=false`, mostrar `msg` seguro. Si el rechazo indica estado laboral obsoleto, refrescar `kiosk_shift_status`; si indica token expirado/QR inválido, limpiar y volver. En error HTTP/transporte, distinguir “resultado desconocido” de “rechazo”: reintentar ciegamente puede duplicar un fichaje; hace falta idempotencia o consulta de estado antes de reenvío.

## 14. Manejo de pausa

Al elegir “Iniciar pausa”, abrir un paso/modal kiosco propio. El motivo es obligatorio y la descripción opcional. El selector consume `kioskMotives`; el botón confirmar permanece deshabilitado hasta elegir un motivo válido. Al cancelar se limpian motivo y descripción y se vuelve a acciones, reiniciando la actividad sin destruir la sesión mientras TTL lo permita.

“Finalizar jornada” aparece simultáneamente cuando `Pausa.action` es `ficharpausa`, pero envía `ficharsalida` y no hereda el motivo seleccionado. Este comportamiento debe cubrirse con prueba unitaria del normalizador y prueba de integración del payload.

## 15. Manejo de firma

`SignDay.js` mezcla canvas, navegación personal y POST `user_fichaje`; no debe usarse directamente. Además existe una discrepancia actual: `ButtonSigning` navega con la prop `date`, mientras `SignDay` lee `dateUserTurn`, por lo que copiar ese flujo puede enviar fecha indefinida.

Crear una vista/modal de firma kiosco que solo devuelva la cadena de firma al orquestador. Puede reutilizar la dependencia ya instalada `react-native-signature-canvas`, sin instalar nada y, si se refactoriza más adelante, extraer un componente de canvas puramente visual compartido. Debe:

- impedir envío vacío;
- permitir limpiar/cancelar;
- limpiar la firma inmediatamente tras envío, cancelación, timeout o error terminal;
- evitar mostrar/registrar el base64;
- confirmar formato y límite de tamaño del backend;
- enviar siempre la fecha canónica con un único nombre interno (`workDate`).

## 16. Manejo de confirmación

La confirmación solo se monta después de `kiosk_fichaje.success === true`. Sus valores deben provenir de la sesión/resultado: nombre del trabajador, etiqueta de acción y fecha/hora confirmada por backend si la ofrece. Si backend no devuelve timestamp, puede mostrarse la hora local claramente como presentación, pero no como evidencia contractual.

Al entrar:

1. detener el contador de inactividad;
2. iniciar `confirmation_timeout_seconds`;
3. impedir nuevos POST;
4. al llegar a cero, ejecutar limpieza central y volver a Terminal.

“Volver a la terminal” ejecuta el mismo cierre inmediatamente. El actual botón “Realizar otra acción” es problemático: prolonga exposición de datos y puede reutilizar un token pensado para una marcación o ya consumido. Debe eliminarse, hacer un nuevo escaneo, o habilitarse solo si backend confirma token multiuso y TTL restante, refrescando antes `kiosk_shift_status`. La opción segura por defecto es volver a Terminal y exigir nuevo QR.

## 17. Manejo del contador de inactividad

El contador vive en `KioskFlow`/`KioskSessionProvider`, no dentro de `KioskActionsView`, porque cubre selección de turno, acciones, pausa y firma. La vista recibe `idleSeconds` para mostrarlo. Usar una marca de tiempo límite (`deadline`) y calcular restante, no decrementar ingenuamente un número: React Native puede pausar intervalos en background.

Eventos que reinician inactividad:

- toque/selección válida dentro de la sesión;
- selección de horario;
- apertura/interacción con pausa o firma;
- cambios de motivo/descripción;
- reintento explícito recuperable.

No reinician el TTL absoluto: respuestas de red, renderizados automáticos o ticks del contador. El escaneo inicia la fase de validación y, al obtener token, debe fijarse también el límite absoluto del trabajador. Al volver desde background se recalculan ambos límites y se limpia inmediatamente si alguno venció.

No iniciar el idle del trabajador en la terminal vacía. Puede existir un mecanismo separado para refrescar configuración, pero no es sesión personal.

## 18. Limpieza de datos temporales

Implementar una única función conceptual `resetWorkerSession(reason)` idempotente. Debe cancelar requests/lectores/timers activos y limpiar:

- QR y token temporal;
- identidad y política `geolocal` del trabajador;
- fecha/turno/opciones/selección;
- acciones y motivos;
- ubicación y errores;
- acción seleccionada, motivo, descripción y firma;
- loaders, errores/resultados de fichaje;
- deadlines y contadores;
- paso, regresándolo a `terminal`.

No debe limpiar:

- `apiUrl` persistida;
- `kioskConfig` válida de la terminal;
- `companyInfo`/logo de terminal;
- preferencia y credenciales recordadas del modo personal;
- token personal de AsyncStorage;
- estado global personal.

| Evento | Conducta |
|---|---|
| Fichaje exitoso | Mostrar confirmación; al timeout o botón, limpiar todo lo efímero |
| QR inválido | Limpiar QR/parciales; terminal lista para otro escaneo |
| Rechazo recuperable previo al POST | Conservar sesión y permitir corregir/reintentar si quedan idle/TTL |
| 401/403, token vencido, respuesta incoherente | Limpieza inmediata y terminal |
| Error de transporte de `kiosk_fichaje` | No rePOST automático; reconciliar o informar antes de limpiar según contrato |
| Cancelación / volver | Limpieza inmediata y terminal |
| Idle o TTL | Limpieza inmediata y terminal; mensaje genérico sin datos personales |
| Cambio a modo Personal | Limpieza antes de renderizar formulario personal |
| Cambio de `apiUrl` | Cancelar sesión, limpiar configuración/empresa kiosco y recargar config |
| App a background | No borrar automáticamente si producto no lo exige, pero al volver recalcular y expirar |

## 19. Riesgos de afectar modo personal

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Pisar `AsyncStorage["token"]` | Autenticación personal rota o trabajador incorrecto | Token kiosco solo en memoria y cliente aislado |
| Usar `AuthProvider.login/logout` | Cambio de stack, borrado masivo de storage y URL | No usar AuthProvider para kiosco |
| Interceptor global sobre cabecera kiosco | Autorización con token personal residual | Instancia/adapter kiosco probado y cabecera explícita |
| Reutilizar `saveCompanyInfo()` | Sin logo, errores ocultos, token equivocado | Servicio kiosco o función pura extraída |
| Reutilizar `CardSelectTurn` directamente | POST/global logout/navegación a Signing | Variante presentacional kiosco |
| Reutilizar `ButtonSigning` | Envía `user_fichaje`, mezcla UI y navegación personal | Normalizador/handler kiosco nuevos |
| Reutilizar `SignDay` | Envía endpoint personal y posible fecha undefined | Canvas kiosco desacoplado |
| Cambios amplios en `Login.js` | Regresión del login personal | Extraer `KioskFlow`, mantener rama personal y tests manuales |
| Persistir datos del trabajador | Exposición en dispositivo compartido | Memoria únicamente y reset central |
| Temporizadores basados solo en intervalos | Sesión sobreviviendo background/suspensión | Deadlines absolutos y AppState |
| Reintento de POST sin idempotencia | Marcación duplicada | Clave idempotente o reconciliación de estado |
| Fechas divergentes | Fichaje en jornada incorrecta | Fecha backend canónica y validación de discrepancia |
| QR/cámara sin dependencia actual | Bloqueo de implementación | Definir lector antes de fase QR; no instalar sin decisión explícita |

La mayor protección es que el kiosco permanezca en el árbol no autenticado y que las abstracciones compartidas sean puras (normalización/ubicación/canvas), no componentes personales que hacen POST o navegación.

## 20. Dudas técnicas pendientes

1. ¿Cuál es el mecanismo inicial de lectura QR? El proyecto no muestra hoy un lector real ni se autorizó instalar dependencias. ¿Se integrará cámara, lector hardware como teclado, deep link o entrada manual de prueba?
2. ¿Qué cabecera exacta autentica el token kiosco: `Authorizationtoken`, `Authorization` u otra? ¿Debe incluir `Bearer`?
3. ¿`kiosk_config` y `kiosk_validate_qr` requieren credencial/identificador permanente del terminal?
4. ¿El token es de un solo uso, de una marcación o multiacción? ¿Backend lo invalida con éxito?
5. ¿El TTL empieza al validar QR o viene como expiración absoluta? ¿Cómo se compensa diferencia de reloj?
6. ¿Qué esquema uniforme tienen los errores y qué códigos distinguen QR inválido, token vencido, acción obsoleta y kiosco deshabilitado?
7. ¿`company_info` exige token del trabajador? Si no, conviene cargarlo al activar kiosco.
8. ¿Valores y semántica exacta de `user_info.data.geolocal`? ¿Qué debe enviarse cuando no se exige ubicación?
9. ¿Qué hacer si el permiso se deniega o GPS falla: bloquear todas las acciones, permitir `(0,0)` o política según valor?
10. ¿Forma exacta de `user_turn.data.horarios` e ID real cuando es array?
11. Después del POST `user_turn`, ¿se llama directamente a `kiosk_shift_status` o se revalida GET `user_turn`?
12. ¿`kiosk_shift_status` puede devolver `Salida` además de la salida derivada de `Pausa`? ¿Cómo deduplicar oficialmente?
13. ¿Forma exacta de `Pausa.motivos` y tipo esperado de `motivo_pausa`?
14. ¿Qué devuelve `kiosk_fichaje` en éxito (timestamp, acción, nombre, ID de operación) para confirmación/reconciliación?
15. ¿Existe soporte de idempotencia o consulta posterior para un timeout de transporte durante el POST?
16. ¿Formato/tamaño máximo de `signature` y `description`?
17. ¿Se conserva “Realizar otra acción” o todo éxito exige nuevo QR? La seguridad favorece nuevo escaneo.
18. ¿Debe `kiosk_config` refrescarse por polling, foreground, manualmente o solo al entrar?
19. ¿Qué UX se espera si `idle_timeout_seconds` es mayor que `worker_session_ttl_seconds`, cero o inválido?
20. ¿El backend invalida explícitamente la sesión al cancelar/timeout? No se proporcionó endpoint de revocación; borrar el token local no lo invalida en servidor.

## 21. Plan sugerido de implementación por fases

### Fase 1: separar estado real del estado simulado

- **Archivos candidatos:** `Login.js`; nuevo `src/components/kiosk/KioskFlow.js`; vistas kiosco; helpers de normalización y tests si la infraestructura existe.
- **Trabajo:** retirar constantes simuladas del camino operativo, definir máquina de pasos y `resetWorkerSession`, mantener mocks solo detrás de una bandera de desarrollo si se necesitan.
- **Riesgo:** regresión visual o del formulario personal por el tamaño actual de `Login.js`.
- **No tocar:** handlers `handleLogin/authenticateUser`, `ButtonSigning`, `ActionSigning`, `Signing`, `SignDay` y configuración nativa.
- **Validación:** alternar Personal/Kiosco repetidamente; comprobar que el formulario, recordarme, engranaje y login personal siguen iguales; retorno siempre borra estado kiosco.

### Fase 2: conectar `kiosk_config`

- **Archivos candidatos:** `KioskFlow`; nuevo `src/services/kioskApi.js`; `KioskTerminalView` para loading/error/disabled.
- **Trabajo:** validar URL, cargar config al activar kiosco, estados de error/reintento y memoria terminal-level.
- **Riesgo:** interceptor personal o loops al cambiar URL.
- **No tocar:** persistencia existente de token personal, `app.json`, `eas.json`, paquetes, `ios/`, `android/`.
- **Validación:** sin URL, URL inválida, offline, 500, payload inválido, `enabled=false/true`, cambio de URL y reentrada.

### Fase 3: conectar `kiosk_validate_qr`

- **Archivos candidatos:** `KioskFlow`, `KioskTerminalView`, servicio kiosco y componente/adaptador de lector decidido.
- **Trabajo:** integrar evento QR, deduplicación, POST, token solo en memoria, TTL y errores.
- **Riesgo:** doble lectura, fuga de QR/token, dependencia de cámara no definida.
- **No tocar:** `AuthProvider.login`, AsyncStorage `token`, login personal.
- **Validación:** QR válido/inválido, sin token en respuesta, doble escaneo, timeout, cambio de modo durante request y verificación de que AsyncStorage no cambia.

### Fase 4: reutilizar `company_info` y `user_info`

- **Archivos candidatos:** servicio/orquestador kiosco; props de terminal/acciones.
- **Trabajo:** cargas con token temporal, nombre, geolocal y branding; separar datos terminal/worker.
- **Riesgo:** usar accidentalmente el método/interceptor personal o conservar PII tras retorno.
- **No tocar:** estado `userName`, `geoLocation`, notificaciones y `companyName` personales salvo refactor puro probado.
- **Validación:** campos ausentes, logo roto, error individual/paralelo, token vencido y limpieza conservando empresa/config.

### Fase 5: reutilizar `user_turn` preliminar

- **Archivos candidatos:** servicio kiosco; nueva `KioskTurnSelectorView`; helper puro de horarios inspirado en `CardSelectTurn`.
- **Trabajo:** GET, fecha, múltiples, selector, POST y continuación.
- **Riesgo:** IDs incorrectos, fecha divergente y navegación accidental a Signing.
- **No tocar:** comportamiento de `CardSelectTurn` personal.
- **Validación:** cero/uno/múltiples horarios, objeto/array según contrato, selección requerida, success=false, 401, doble confirmación y fecha enviada.

### Fase 6: conectar `kiosk_shift_status`

- **Archivos candidatos:** servicio, normalizador de acciones, `KioskActionsView`, componente de pausa.
- **Trabajo:** cargar fecha/acciones/motivos y mapear botones, incluida Pausa → Pausar + Finalizar.
- **Riesgo:** acciones desconocidas, motivos malformados, duplicación de salida.
- **No tocar:** `ButtonSigning.js` ni `ActionSigning.js`.
- **Validación:** fixtures para Entrada, Pausa, Reanudación, Firma, sin acciones, acción desconocida y combinación Pausa/Salida; afirmar payload codes esperados.

### Fase 7: geolocalización y `kiosk_fichaje`

- **Archivos candidatos:** hook/servicio de ubicación kiosco, orquestador, componente de pausa, vista de firma kiosco y confirmación.
- **Trabajo:** permisos, payload canónico, validación de datos extra, POST único, loaders, clasificación de errores y confirmación real.
- **Riesgo:** fichaje duplicado, permiso denegado, payload base64 grande, fecha incorrecta.
- **No tocar:** endpoint `user_fichaje`, flujo personal de `SignDay` o sus mensajes/navegación.
- **Validación:** cada uno de los cinco códigos; pausa con/sin motivo; firma vacía/válida; coordenadas; success true/false; 400/401/500/offline/timeout; doble toque e idempotencia.

### Fase 8: implementar limpieza y timeouts

- **Archivos candidatos:** `KioskFlow`/contexto; vistas de acciones/confirmación; integración AppState.
- **Trabajo:** deadlines idle/TTL/confirmación, eventos de actividad, cancelación de requests y reset idempotente.
- **Riesgo:** timers huérfanos, cierres sobre estado viejo, PII visible en background.
- **No tocar:** temporización/app state personal salvo extracción compatible.
- **Validación:** fake timers si están disponibles; background/foreground; timeout en cada paso; cancelar, cambiar modo, cambiar URL, botón volver y confirmación automática.

### Fase 9: validar flujo completo y regresión

- **Archivos candidatos:** pruebas/documentación, sin cambios funcionales nuevos.
- **Trabajo:** matriz end-to-end con backend de pruebas y revisión de seguridad/privacidad.
- **Riesgo:** diferencias de contratos reales frente a ejemplos.
- **No tocar:** producción ni configuración nativa.
- **Validación:** flujo feliz con/sin múltiples; todas las acciones; expiración; carreras; dos trabajadores consecutivos; comprobar ausencia de datos del anterior; login/fichaje/firma personal completos sin regresión.

## Criterios de cierre antes de implementar

- Contratos de cabecera, TTL, errores, geolocalización, horarios, motivos, firma e idempotencia confirmados.
- Tecnología de lector QR definida sin introducir dependencias de forma implícita.
- Separación explícita entre estado del terminal y sesión del trabajador.
- Pruebas del normalizador que fijan `ficharpausa → Iniciar pausa + Finalizar jornada`.
- Prueba de que ninguna llamada kiosco lee o escribe el token personal.
- Todos los caminos de salida convergen en una limpieza idempotente.

---

### Validación documental

- Archivo generado: `.agents/ANALISIS_IMPLEMENTACION_MODO_TERMINAL_KIOSCO.md`.
- No se modificó código fuente.
- No se modificó configuración.
- No se instalaron dependencias.
- La propuesta mantiene aislado el modo personal actual.
- La propuesta respeta expresamente `ficharpausa` → **Iniciar pausa** (`ficharpausa`) + **Finalizar jornada** (`ficharsalida`).
