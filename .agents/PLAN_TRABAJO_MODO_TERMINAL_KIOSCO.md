# Plan de trabajo por fases - Modo Terminal/Kiosco

## 1. Objetivo

Implementar progresivamente el flujo funcional del **Modo Terminal/Kiosco** en la rama:

```text
feature/modo-terminal-kiosco
```

El modo kiosco debe permitir que un trabajador se identifique mediante QR en un dispositivo compartido y pueda realizar acciones de fichaje sin afectar el flujo actual del **Modo Personal**.

## 2. Principios del plan

- No modificar la lógica actual del modo personal.
- No usar `AuthProvider.login()` para kiosco.
- No guardar el token kiosco en `AsyncStorage["token"]`.
- No reutilizar directamente `ButtonSigning.js` para kiosco.
- No reutilizar directamente `SignDay.js` para kiosco.
- No hacer cambios nativos ni instalar dependencias en estas fases iniciales.
- Mantener el token temporal del trabajador solo en memoria.
- Mantener una limpieza centralizada de la sesión temporal del trabajador.
- Respetar la regla actual: `ficharpausa` habilita **Pausar** y **Finalizar**.

---

# Fase 1 - Separar el flujo kiosco visual en un orquestador

## Objetivo

Extraer la lógica actual del modo kiosco desde `Login.js` hacia un componente contenedor/orquestador, sin cambiar el comportamiento visual actual.

El flujo seguirá simulado, pero mejor organizado.

## Archivos candidatos

```text
src/screens/auth/Login.js
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskTerminalView.js
src/components/kiosk/KioskActionsView.js
src/components/kiosk/KioskConfirmationView.js
src/components/common/ModeSwitch.js
```

## Trabajo esperado

Crear un componente nuevo:

```text
src/components/kiosk/KioskFlow.js
```

Este componente debe manejar:

```text
kioskStep
selectedKioskAction
worker simulado
acciones simuladas
onWorkerIdentified
onActionPress
onReturnToTerminal
onAnotherAction
```

`Login.js` debe quedar más limpio:

```text
Si mode === personal → renderiza formulario personal.
Si mode === kiosk → renderiza KioskFlow.
```

## Restricciones

No conectar endpoints todavía.

No tocar:

```text
AuthProvider.js
ApiProvider.js
ButtonSigning.js
ActionSigning.js
Signing.js
SignDay.js
app.json
eas.json
package.json
package-lock.json
```

## Validación

Probar manualmente:

```text
1. Abrir app.
2. Modo personal sigue igual.
3. Cambiar a modo kiosco.
4. Terminal QR simulada aparece.
5. Tocar QR simulado pasa a acciones.
6. Seleccionar acción pasa a confirmación.
7. Volver a terminal funciona.
8. Cambiar entre Personal/Kiosco limpia el estado kiosco.
```

## Resultado esperado

El flujo visual actual sigue funcionando, pero `Login.js` ya no concentra toda la lógica kiosco.

---

# Fase 2 - Crear servicio aislado para API de kiosco

## Objetivo

Crear una capa de comunicación exclusiva para kiosco, sin contaminar el token personal ni el interceptor global actual.

## Archivos candidatos

```text
src/services/kioskApi.js
src/components/kiosk/KioskFlow.js
```

## Trabajo esperado

Crear un servicio conceptual para llamadas kiosco:

```text
kioskApi.js
```

Debe permitir:

```text
GET kiosk_config
POST kiosk_validate_qr
GET company_info
GET user_info
GET user_turn
POST user_turn
GET kiosk_shift_status
POST kiosk_fichaje
```

Debe recibir:

```text
apiUrl
workerToken temporal cuando aplique
```

Debe usar la cabecera que corresponda al backend actual:

```text
Authorizationtoken: Bearer <token>
```

## Regla importante

El token kiosco no debe guardarse en:

```text
AsyncStorage["token"]
AuthProvider
ApiProvider
SecureStore
```

Debe vivir solo en memoria dentro de `KioskFlow` o un contexto propio de kiosco.

## Restricciones

No cambiar el interceptor global de `App.js`.

No cambiar el login personal.

No usar `AuthProvider.login()`.

## Validación

Confirmar con logs controlados, sin imprimir tokens completos:

```text
1. El servicio construye URLs correctamente.
2. El servicio no modifica AsyncStorage.
3. El servicio no cambia isAuthenticated.
4. El modo personal sigue autenticando igual.
```

## Resultado esperado

Existe una capa lista para conectar endpoints kiosco sin afectar modo personal.

---

# Fase 3 - Conectar `kiosk_config`

## Objetivo

Al entrar al modo kiosco, cargar la configuración del terminal.

## Endpoint

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=kiosk_config
```

## Respuesta esperada

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "idle_timeout_seconds": 60,
    "confirmation_timeout_seconds": 5,
    "worker_session_ttl_seconds": 120
  }
}
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskTerminalView.js
src/services/kioskApi.js
```

## Trabajo esperado

Agregar estados:

```text
kioskConfig
isKioskConfigLoading
kioskConfigError
```

Al activar modo kiosco:

```text
1. Validar que apiUrl exista.
2. Llamar kiosk_config.
3. Si enabled=true, mostrar terminal QR.
4. Si enabled=false, mostrar mensaje de kiosco no disponible.
5. Si hay error, mostrar mensaje y opción de reintentar.
```

## Restricciones

No avanzar todavía con QR real.

No registrar trabajador.

No cargar `user_info`.

## Validación

Casos mínimos:

```text
apiUrl vacío
apiUrl inválido
kiosk_config success=true enabled=true
kiosk_config success=true enabled=false
kiosk_config success=false
error HTTP / sin red
```

## Resultado esperado

El modo kiosco solo queda operativo si `kiosk_config` responde correctamente y está habilitado.

---

# Fase 4 - Conectar validación QR con `kiosk_validate_qr`

## Objetivo

Reemplazar la simulación de lectura QR por una validación funcional inicial.

## Endpoint

```http
POST {{URL_API}}/custom/fichajes/api/index.php
```

## Payload

```json
{
  "action": "kiosk_validate_qr",
  "qr_code": "valor_leido"
}
```

## Respuesta esperada

```json
{
  "success": true,
  "access_token": "token_temporal"
}
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskTerminalView.js
src/services/kioskApi.js
```

## Trabajo esperado

Agregar estados:

```text
qrValue
workerToken
isValidatingQr
qrError
workerSessionStartedAt
workerSessionDeadline
```

Por ahora, si no hay lector real, se puede mantener una entrada o acción de simulación controlada para probar:

```text
Simular QR → POST kiosk_validate_qr
```

## Regla de seguridad

El token recibido:

```text
workerToken
```

vive únicamente en memoria.

No se guarda en `AsyncStorage`.

No activa `AuthProvider`.

No navega al `AppStack`.

## Flujo

```text
Terminal QR
→ leer/simular QR
→ POST kiosk_validate_qr
→ si success y access_token existe
   → guardar token temporal
   → continuar carga de datos
→ si falla
   → mostrar error
   → seguir en terminal
```

## Validación

Casos:

```text
QR válido
QR inválido
respuesta success=false
respuesta success=true sin access_token
doble toque / doble lectura
error HTTP
cambio a modo personal durante validación
```

## Resultado esperado

El kiosco ya puede crear una sesión temporal de trabajador sin afectar sesión personal.

---

# Fase 5 - Cargar `company_info` y `user_info`

## Objetivo

Después de validar QR, cargar datos mínimos para pintar la experiencia kiosco.

## Endpoints

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=company_info
GET {{URL_API}}/custom/fichajes/api/index.php?action=user_info
```

## Uso de `company_info`

Mostrar:

```text
nombre de empresa
logo si aplica
```

## Uso de `user_info`

Consumir solo:

```text
firstname
lastname
geolocal
```

No usar para decidir acciones.

No usar `notifications`.

No usar `status` como fuente de botones.

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskActionsView.js
src/components/kiosk/KioskTerminalView.js
src/services/kioskApi.js
```

## Trabajo esperado

Agregar estados:

```text
companyInfo
userInfo
geoLocationPolicy
isLoadingWorkerInfo
workerInfoError
```

Construir trabajador visible:

```text
firstname + lastname
```

## Restricciones

No reutilizar directamente `saveCompanyInfo()` si depende del flujo/interceptor personal.

No guardar datos del trabajador fuera del flujo kiosco.

## Validación

Casos:

```text
company_info correcto
company_info sin logo
company_info con logo inválido
user_info correcto
user_info sin firstname/lastname
user_info con geolocal null
user_info error 401/403
```

## Resultado esperado

Luego del QR, el kiosco identifica visualmente al trabajador y conoce si debe manejar geolocalización.

---

# Fase 6 - Reutilizar `user_turn` preliminar y selección de horario

## Objetivo

Replicar en kiosco el flujo preliminar del modo personal para horarios múltiples.

## Endpoint preliminar

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=user_turn
```

## Si hay múltiples horarios

Mostrar selector y enviar:

```http
POST {{URL_API}}/custom/fichajes/api/index.php
```

```json
{
  "action": "user_turn",
  "date": "2026-02-08",
  "idHorarioM": 17
}
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskTurnSelectorView.js
src/services/kioskApi.js
```

## Trabajo esperado

Agregar estados:

```text
dateUserTurn
isMultipleTurn
turnOptions
selectedTurn
isSavingTurn
turnError
```

Flujo:

```text
GET user_turn
→ guardar date
→ validar multiples
→ si multiples=true mostrar selector
→ usuario selecciona horario
→ POST user_turn { date, idHorarioM }
→ si success continuar a kiosk_shift_status
```

## Restricciones

No reutilizar directamente `CardSelectTurn.js` si navega a `Signing` o usa lógica personal.

No navegar a `Signing`.

No usar `logout()` personal.

## Validación

Casos:

```text
sin múltiples horarios
con múltiples horarios
horarios como array
horarios como objeto
sin horarios válidos
selección vacía
POST user_turn success=true
POST user_turn success=false
token vencido
```

## Resultado esperado

Antes de mostrar acciones kiosco, el usuario ya tiene resuelto su turno si el backend lo requiere.

---

# Fase 7 - Conectar `kiosk_shift_status`

## Objetivo

Cargar las acciones disponibles para el trabajador en kiosco.

## Endpoint

```http
GET {{URL_API}}/custom/fichajes/api/index.php?action=kiosk_shift_status
```

## Respuesta esperada base

```json
{
  "success": true,
  "data": {
    "Entrada": {
      "action": "ficharentrada"
    },
    "date": "2026-09-01"
  }
}
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskActionsView.js
src/services/kioskApi.js
src/utils/kioskActions.js
```

## Trabajo esperado

Crear un normalizador de acciones kiosco.

Mapeo requerido:

```text
Entrada.action = ficharentrada
→ mostrar Iniciar

Pausa.action = ficharpausa
→ mostrar Iniciar pausa
→ mostrar Finalizar jornada

Reanudacion.action = ficharreanudacion
→ mostrar Reanudar

Firma.action = ficharfirma
→ mostrar Firmar
```

Regla confirmada:

```text
Si viene Pausa.action = ficharpausa,
mostrar dos botones:
- Iniciar pausa
- Finalizar jornada
```

Cada botón manda después:

```text
Iniciar pausa      → ficharpausa
Finalizar jornada  → ficharsalida
```

## Estados

```text
kioskActions
kioskMotives
kioskWorkDate
isLoadingShiftStatus
shiftStatusError
```

## Restricciones

No cambiar `ButtonSigning.js`.

No cambiar el mapeo del modo personal.

No inferir acciones desde `user_info.status`.

## Validación

Casos:

```text
solo Entrada
Pausa con motivos
Pausa sin motivos
Reanudacion
Firma
sin acciones
acción desconocida
date ausente
success=false
```

## Resultado esperado

La pantalla `KioskActionsView` deja de usar acciones hardcodeadas y pinta acciones reales desde `kiosk_shift_status`.

---

# Fase 8 - Geolocalización para kiosco

## Objetivo

Preparar `lat` y `long` para el fichaje kiosco según la política recibida desde `user_info.geolocal`.

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/hooks/useKioskLocation.js
src/services/kioskApi.js
```

## Trabajo esperado

Crear o aislar lógica de ubicación para kiosco.

Reglas base, según modo personal:

```text
Si geolocalización aplica → obtener ubicación.
Si no aplica → usar valores contractuales actuales, por ejemplo 0,0.
```

## Estados

```text
location
locationError
isLoadingLocation
```

## Restricciones

No modificar `ActionSigning.js`.

No cambiar permisos nativos.

No instalar dependencias.

## Validación

Casos:

```text
geolocal requiere ubicación
geolocal no requiere ubicación
permiso concedido
permiso denegado
GPS apagado/no disponible
lat/long correctos en payload
```

## Resultado esperado

Antes de ejecutar `kiosk_fichaje`, el flujo kiosco sabe qué coordenadas enviar.

---

# Fase 9 - Conectar `kiosk_fichaje`

## Objetivo

Registrar realmente la acción seleccionada por el trabajador.

## Endpoint

```http
POST {{URL_API}}/custom/fichajes/api/index.php
```

## Payload base

```json
{
  "action": "kiosk_fichaje",
  "date": "2026-06-10",
  "fichaje": "ficharsalida",
  "description": "Entrando",
  "motivo_pausa": "2",
  "long": "-80.9444355",
  "lat": "8.1607184",
  "signature": "data:image/png;base64,-..."
}
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskActionsView.js
src/components/kiosk/KioskPauseModal.js
src/components/kiosk/KioskSignatureView.js
src/components/kiosk/KioskConfirmationView.js
src/services/kioskApi.js
```

## Trabajo esperado

Crear un único handler:

```text
submitKioskFichaje
```

Este handler arma el payload según la acción seleccionada.

## Acciones

```text
Iniciar         → ficharentrada
Iniciar pausa   → ficharpausa
Reanudar        → ficharreanudacion
Finalizar       → ficharsalida
Firmar          → ficharfirma
```

## Datos extra

```text
ficharpausa:
- motivo_pausa obligatorio
- description opcional

ficharfirma:
- signature obligatoria

otras acciones:
- sin formulario adicional
```

## Validación

Casos:

```text
entrada success
pausa sin motivo
pausa con motivo
reanudación success
salida success
firma sin firma
firma con firma
success=false
HTTP 500
token expirado
doble toque
```

## Resultado esperado

El kiosco puede registrar una marcación real y pasar a confirmación.

---

# Fase 10 - Confirmación y limpieza temporal

## Objetivo

Después de un fichaje exitoso, mostrar confirmación y limpiar los datos temporales del trabajador.

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/components/kiosk/KioskConfirmationView.js
```

## Trabajo esperado

Agregar o completar:

```text
fichajeResult
confirmationSeconds
resetWorkerSession(reason)
```

Flujo:

```text
kiosk_fichaje success=true
→ mostrar confirmación
→ esperar confirmation_timeout_seconds
→ limpiar sesión temporal
→ volver a terminal QR
```

## `resetWorkerSession` debe limpiar

```text
qrValue
workerToken
userInfo
geoLocationPolicy
dateUserTurn
turnOptions
selectedTurn
kioskActions
kioskMotives
location
selectedAction
pauseMotive
pauseDescription
signature
fichajeResult
errores/loaders del trabajador
contadores de sesión
```

## No debe limpiar

```text
apiUrl
kioskConfig
companyInfo
modo seleccionado
credenciales personales recordadas
token personal
```

## Validación

Casos:

```text
confirmación automática
botón volver a terminal
fichaje exitoso de dos trabajadores seguidos
datos del trabajador anterior no quedan visibles
```

## Resultado esperado

La sesión del trabajador queda cerrada correctamente después de cada marcación.

---

# Fase 11 - Contador de inactividad y TTL

## Objetivo

Implementar seguridad de sesión para dispositivo compartido.

## Variables desde `kiosk_config`

```text
idle_timeout_seconds
confirmation_timeout_seconds
worker_session_ttl_seconds
```

## Archivos candidatos

```text
src/components/kiosk/KioskFlow.js
src/hooks/useKioskTimers.js
src/components/kiosk/KioskActionsView.js
src/components/kiosk/KioskTurnSelectorView.js
src/components/kiosk/KioskPauseModal.js
src/components/kiosk/KioskSignatureView.js
```

## Trabajo esperado

Implementar:

```text
contador visible de inactividad
deadline absoluto de sesión del trabajador
reinicio del idle con interacción
limpieza automática al llegar a cero
```

## Reglas

```text
El idle se reinicia con interacción del usuario.
El TTL absoluto no se reinicia.
Si idle vence → limpiar sesión y volver a terminal.
Si TTL vence → limpiar sesión y volver a terminal.
En confirmación usar confirmation_timeout_seconds.
```

## Validación

Casos:

```text
inactividad en acciones
inactividad en selección de horario
inactividad en pausa
inactividad en firma
confirmación expira sola
background/foreground si aplica
```

## Resultado esperado

El kiosco no deja sesiones abiertas en el dispositivo compartido.

---

# Fase 12 - Validación integral y regresión modo personal

## Objetivo

Validar el flujo completo y asegurar que el modo personal no fue afectado.

## Validación kiosco

```text
1. Entrar a modo kiosco.
2. Cargar kiosk_config.
3. Leer QR válido.
4. Cargar company_info.
5. Cargar user_info.
6. Cargar user_turn.
7. Resolver horario si aplica.
8. Cargar kiosk_shift_status.
9. Mostrar acciones.
10. Ejecutar cada acción posible.
11. Confirmar.
12. Limpiar sesión.
13. Repetir con otro trabajador.
```

## Validación modo personal

```text
1. Login personal.
2. Home.
3. Registro de asistencia.
4. Entrada.
5. Pausa.
6. Reanudación.
7. Salida.
8. Firma si aplica.
9. Solicitudes.
10. Documentos.
```

## Validación técnica

```bash
git status --short
git diff --check
npx expo install --check
npx expo-doctor
npx expo start --dev-client --clear
```

## Resultado esperado

Modo kiosco funcional y modo personal sin regresión.

---

# Orden recomendado de ejecución

```text
Fase 1  → Separar KioskFlow
Fase 2  → Servicio API kiosco
Fase 3  → kiosk_config
Fase 4  → kiosk_validate_qr
Fase 5  → company_info + user_info
Fase 6  → user_turn preliminar
Fase 7  → kiosk_shift_status
Fase 8  → geolocalización
Fase 9  → kiosk_fichaje
Fase 10 → confirmación + limpieza
Fase 11 → inactividad + TTL
Fase 12 → validación integral
```

# Commits sugeridos

```text
feat(kiosk): extract kiosk flow container
feat(kiosk): add isolated kiosk api service
feat(kiosk): load kiosk configuration
feat(kiosk): validate worker qr token
feat(kiosk): load worker and company data
feat(kiosk): handle multiple turn selection
feat(kiosk): load shift actions
feat(kiosk): prepare location for kiosk punches
feat(kiosk): submit kiosk punches
feat(kiosk): add confirmation cleanup flow
feat(kiosk): add inactivity timers
test(kiosk): validate kiosk flow and personal mode regression
```

# Criterio de avance

No avanzar a la siguiente fase si la anterior no cumple:

```text
- modo personal intacto,
- sin cambios nativos innecesarios,
- sin token kiosco persistido,
- sin errores visuales graves,
- flujo kiosco validado manualmente,
- git diff revisado.
```