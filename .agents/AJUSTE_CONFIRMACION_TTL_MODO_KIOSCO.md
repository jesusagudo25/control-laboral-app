# Ajuste de confirmación y TTL - Modo Terminal/Kiosko

## 1. Contexto

El modo Terminal/Kiosko ya cuenta con el flujo funcional principal:

```text
kiosk_config
→ lector QR real
→ kiosk_validate_qr
→ workerToken temporal
→ company_info
→ user_info
→ user_turn
→ selección de horario si aplica
→ kiosk_shift_status
→ geolocalización
→ kiosk_fichaje
→ confirmación
→ limpieza / retorno según temporizadores
```

Durante la prueba en Android real se detectó una inconsistencia de experiencia de usuario en la pantalla de confirmación.

Actualmente, después de registrar una acción correctamente, la pantalla de confirmación hace esto:

```text
Marcación registrada
→ contador de confirmation_timeout_seconds
→ vuelve al QR
```

Además, el botón:

```text
Realizar otra acción
```

también vuelve al QR y limpia la sesión del trabajador.

Esto no es lo esperado.

---

## 2. Problema detectado

Después de una marcación exitosa, existen tres conceptos distintos que no deben mezclarse:

```text
confirmation_timeout_seconds
idle_timeout_seconds
worker_session_ttl_seconds
```

El comportamiento actual está tratando la confirmación como si fuera cierre de sesión, pero la confirmación solo debe controlar cuánto tiempo se muestra el mensaje de éxito.

### Problema específico

Cuando el trabajador hace una acción, por ejemplo:

```text
Iniciar jornada
```

se muestra:

```text
Marcación registrada
```

Pero luego ocurre esto:

```text
1. Si pasan los 5 segundos de confirmación → vuelve al QR.
2. Si presiona Realizar otra acción → vuelve al QR.
```

El punto 2 definitivamente es incorrecto.

El punto 1 también debe ajustarse: al terminar la confirmación debe volver a la pantalla de acciones del mismo trabajador, no directamente al QR.

---

## 3. Definición correcta de temporizadores

### 3.1 `confirmation_timeout_seconds`

Debe representar únicamente el tiempo visible de la pantalla de confirmación.

Ejemplo:

```text
confirmation_timeout_seconds = 5
```

Significa:

```text
Mostrar “Marcación registrada” durante 5 segundos.
Luego volver a Acciones de jornada del mismo trabajador.
```

No debe cerrar sesión por sí solo.
No debe limpiar `workerToken`.
No debe regresar directamente al QR.

---

### 3.2 `idle_timeout_seconds`

Debe representar el tiempo máximo sin interacción mientras el trabajador tiene una sesión activa.

Aplica en pantallas como:

```text
Acciones de jornada
Selector de horario
Modal de pausa
Firma
```

Ejemplo:

```text
idle_timeout_seconds = 60
```

Significa:

```text
Si el trabajador queda 60 segundos sin interactuar,
se cierra la sesión temporal y se vuelve al QR.
```

Este temporizador sí debe cerrar sesión.

---

### 3.3 `worker_session_ttl_seconds`

Debe representar el tiempo máximo de vida de la sesión temporal del trabajador desde que escanea el QR.

Ejemplo:

```text
worker_session_ttl_seconds = 120
```

La intención es evitar que una sesión de trabajador quede viva indefinidamente en un dispositivo compartido.

Sin embargo, no debe convertirse en un corte brusco e incómodo si el trabajador está interactuando activamente.

---

## 4. Criterio recomendado para `worker_session_ttl_seconds`

El TTL tiene sentido como medida de seguridad, pero no debe sentirse como un cierre inesperado durante una acción legítima.

### Recomendación funcional

```text
worker_session_ttl_seconds no debe cortar de golpe una acción crítica en progreso.
```

Manejo recomendado:

```text
Si TTL vence en pantalla de acciones:
→ cerrar sesión y volver al QR.

Si TTL vence en pantalla de confirmación:
→ terminar confirmación y luego volver al QR.

Si TTL vence en pausa/firma/formulario:
→ mostrar mensaje controlado de sesión vencida
→ pedir volver al terminal o volver a escanear QR.
```

Para una primera versión estable, también se recomienda evaluar que el backend configure un TTL más razonable, por ejemplo:

```text
worker_session_ttl_seconds = 300
```

Esto evita cortes agresivos durante acciones humanas normales, especialmente si hay firma, pausa, selección de horario o demora del usuario.

---

## 5. Comportamiento esperado corregido

### 5.1 Después de `kiosk_fichaje success=true`

Debe ocurrir:

```text
Guardar fichajeResult
Mostrar pantalla de confirmación
Iniciar contador confirmation_timeout_seconds
```

No debe ocurrir:

```text
No limpiar workerToken
No limpiar userInfo
No volver al QR automáticamente por confirmación
No destruir la sesión del trabajador
```

---

### 5.2 Al terminar `confirmation_timeout_seconds`

Debe ocurrir:

```text
Salir de confirmación
Limpiar solo datos de la confirmación actual
Refrescar kiosk_shift_status
Volver a Acciones de jornada del mismo trabajador
Mantener idle_timeout_seconds activo
Mantener worker_session_ttl_seconds activo
```

Debe conservar:

```text
workerToken
userInfo
companyInfo
geoLocationPolicy
dateUserTurn
workerSessionDeadline
kioskConfig
apiUrl
```

Debe limpiar solo:

```text
fichajeResult
selectedAction
errores de envío si aplica
datos temporales de pausa/firma si aplica
estado local de confirmación
```

---

### 5.3 Botón “Realizar otra acción”

Debe hacer lo mismo que el fin del contador de confirmación.

Debe ocurrir:

```text
NO cerrar sesión
NO volver al QR
Mantener al mismo trabajador identificado
Refrescar kiosk_shift_status
Volver a Acciones de jornada
```

Esto permite que el backend devuelva el nuevo estado real.

Ejemplo:

```text
Trabajador hace Entrada
→ confirmación
→ Realizar otra acción
→ se llama kiosk_shift_status
→ backend puede devolver Pausa / Finalizar
```

---

### 5.4 Botón “Volver a la terminal”

Este sí debe cerrar la sesión temporal.

Debe ocurrir:

```text
resetWorkerSession("manual_return")
Limpiar workerToken
Limpiar datos temporales del trabajador
Volver al terminal QR
```

---

### 5.5 `idle_timeout_seconds`

Debe seguir cerrando sesión por inactividad.

```text
Si el trabajador queda inactivo en acciones/selector/pausa/firma
→ resetWorkerSession("idle_timeout")
→ volver al QR
```

---

### 5.6 `worker_session_ttl_seconds`

Debe seguir protegiendo la sesión temporal, pero con manejo controlado.

Regla mínima esperada:

```text
El TTL no se reinicia por interacción.
```

Regla recomendada:

```text
Si vence en acciones, cerrar sesión.
Si vence durante confirmación, no volver a acciones; volver al QR al terminar confirmación.
Si vence durante pausa/firma, mostrar sesión vencida y no permitir enviar con token expirado.
```

---

## 6. Flujo esperado final

### Flujo normal con otra acción

```text
Escanear QR
→ trabajador identificado
→ acciones
→ Iniciar jornada
→ kiosk_fichaje success=true
→ Marcación registrada durante 5 segundos
→ volver a Acciones de jornada del mismo trabajador
→ refrescar kiosk_shift_status
→ trabajador puede hacer otra acción
```

---

### Flujo con botón “Realizar otra acción”

```text
Marcación registrada
→ usuario presiona Realizar otra acción
→ NO vuelve al QR
→ NO limpia workerToken
→ refresca kiosk_shift_status
→ vuelve a Acciones de jornada
```

---

### Flujo con botón “Volver a la terminal”

```text
Marcación registrada
→ usuario presiona Volver a la terminal
→ resetWorkerSession("manual_return")
→ limpia sesión temporal
→ vuelve al QR
```

---

### Flujo por inactividad

```text
Trabajador identificado
→ pantalla de acciones
→ no interactúa por idle_timeout_seconds
→ resetWorkerSession("idle_timeout")
→ vuelve al QR
```

---

### Flujo por TTL

```text
Trabajador identificado
→ sesión supera worker_session_ttl_seconds
→ manejo controlado de sesión vencida
→ limpiar sesión y volver al QR cuando corresponda
```

---

## 7. Prompt para Codex

```text
Corrige únicamente el comportamiento posterior a la confirmación y revisa el manejo del TTL en modo kiosko.

Contexto:
Actualmente después de una marcación exitosa se muestra la pantalla "Marcación registrada" con:
- contador confirmation_timeout_seconds
- botón "Realizar otra acción"
- botón "Volver a la terminal"

Problema:
El contador de confirmación y el botón "Realizar otra acción" están regresando al QR y limpiando la sesión del trabajador.

Eso no es correcto.

Definición funcional correcta:

1. confirmation_timeout_seconds:
- Solo controla cuánto tiempo se muestra la pantalla de confirmación.
- NO debe cerrar sesión.
- NO debe volver al QR.
- Al terminar, debe volver a Acciones de jornada del mismo trabajador.
- Debe refrescar kiosk_shift_status para traer acciones actualizadas.

2. idle_timeout_seconds:
- Tiempo máximo sin interacción.
- Este sí cierra sesión.
- Si vence, ejecutar resetWorkerSession("idle_timeout") y volver al QR.

3. worker_session_ttl_seconds:
- Tiempo máximo absoluto de la sesión temporal desde que se escanea el QR.
- No debe reiniciarse por interacción.
- Revisar que no corte de forma brusca una acción crítica en progreso.
- Si vence en pantalla de acciones, puede cerrar sesión y volver al QR.
- Si vence en confirmación, al terminar la confirmación debe volver al QR, no a acciones.
- Si vence en pausa/firma/formulario, mostrar mensaje controlado de sesión vencida y evitar enviar con token expirado.

Comportamiento esperado:

Después de kiosk_fichaje success=true:
- Mostrar confirmación.
- Iniciar contador confirmation_timeout_seconds.
- Mantener workerToken.
- Mantener userInfo.
- Mantener companyInfo.
- Mantener geoLocationPolicy.
- Mantener dateUserTurn.
- Mantener workerSessionDeadline.

Al terminar confirmation_timeout_seconds:
- Limpiar solo datos de confirmación/acción actual:
  - fichajeResult
  - selectedAction
  - errores de envío si aplica
  - datos temporales de pausa/firma si aplica
- Refrescar kiosk_shift_status.
- Volver a Acciones de jornada del mismo trabajador.
- No volver al QR salvo que el TTL ya esté vencido.

Botón "Realizar otra acción":
- Debe hacer lo mismo que el fin del contador de confirmación.
- NO debe cerrar sesión.
- NO debe volver al QR.
- Debe refrescar kiosk_shift_status.
- Debe volver a Acciones de jornada del mismo trabajador.

Botón "Volver a la terminal":
- Este sí debe cerrar sesión.
- Ejecutar resetWorkerSession("manual_return").
- Limpiar workerToken y datos temporales del trabajador.
- Volver al QR.

Importante:
Después de volver desde confirmación a acciones, se debe llamar nuevamente a kiosk_shift_status.
No usar acciones antiguas en memoria sin refrescar.

Ejemplo esperado:
- Trabajador hace Entrada.
- Se muestra confirmación 5 segundos.
- Luego vuelve a acciones del mismo trabajador.
- Se llama kiosk_shift_status nuevamente.
- El backend devuelve las nuevas acciones disponibles, por ejemplo Pausa/Finalizar.

Alcance permitido:
- src/components/kiosk/KioskFlow.js
- src/components/kiosk/KioskConfirmationView.js
- src/components/kiosk/KioskActionsView.js solo si hace falta ajustar props o texto
- src/hooks/useKioskTimers.js solo si hace falta ajustar el manejo de TTL

No modificar:
- AuthProvider.js
- ApiProvider.js
- App.js
- ButtonSigning.js
- ActionSigning.js
- Signing.js
- SignDay.js
- CardSelectTurn.js
- src/services/kioskApi.js salvo ajuste mínimo estrictamente necesario
- package.json
- package-lock.json
- app.json
- ios/
- android/

No instalar dependencias.
No cambiar endpoints.
No cambiar kiosk_fichaje.
No modificar modo personal.
No tocar lógica del modo personal.

Validaciones:
- git status --short
- git diff --check
- ESLint/Prettier sobre archivos modificados
- npx expo start --dev-client --clear

Validación manual esperada:
1. Escanear QR.
2. Hacer Entrada.
3. Ver confirmación.
4. Esperar confirmation_timeout_seconds.
5. Confirmar que NO vuelve al QR.
6. Confirmar que vuelve a Acciones de jornada del mismo trabajador.
7. Confirmar que se refresca kiosk_shift_status.
8. Hacer otra acción.
9. Presionar "Realizar otra acción".
10. Confirmar que NO vuelve al QR.
11. Confirmar que vuelve a Acciones de jornada del mismo trabajador.
12. Presionar "Volver a la terminal".
13. Confirmar que ahí sí limpia sesión y vuelve al QR.
14. Dejar inactivo en acciones hasta idle_timeout_seconds.
15. Confirmar que ahí sí limpia sesión y vuelve al QR.
16. Validar que worker_session_ttl_seconds no se reinicia con interacción.
17. Validar que si TTL vence en confirmación, al salir de confirmación vuelve al QR.
18. Validar que si TTL vence en pausa/firma, se muestra mensaje controlado y no permite enviar con token expirado.
19. Confirmar que modo personal no cambió.

Entregable:
- Archivos modificados.
- Qué cambió en confirmation_timeout_seconds.
- Qué cambió en "Realizar otra acción".
- Qué conserva la sesión del trabajador.
- Qué limpia solamente la confirmación.
- Cómo se maneja worker_session_ttl_seconds.
- Confirmación de que idle_timeout_seconds sigue cerrando sesión.
- Confirmación de que no se tocaron endpoints ni modo personal.
- Validaciones ejecutadas.
```

---

## 8. Criterio de aceptación

Se considera correcto cuando:

```text
- confirmation_timeout_seconds vuelve a acciones, no al QR.
- Realizar otra acción vuelve a acciones, no al QR.
- Volver a la terminal sí vuelve al QR.
- idle_timeout_seconds sí cierra sesión por inactividad.
- worker_session_ttl_seconds no se reinicia por interacción.
- worker_session_ttl_seconds no corta bruscamente acciones críticas sin mensaje controlado.
- kiosk_shift_status se refresca al volver desde confirmación a acciones.
- workerToken se conserva solo cuando corresponde.
- workerToken se limpia solo cuando se cierra sesión.
- modo personal queda intacto.
```
