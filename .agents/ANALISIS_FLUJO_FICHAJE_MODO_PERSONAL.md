# Análisis del flujo de fichaje — Modo personal

## 1. Resumen ejecutivo

El modo personal autentica al trabajador mediante `POST action=auth`, guarda el `access_token` en `AsyncStorage` y un interceptor global de Axios añade ese token a las peticiones posteriores mediante el header no estándar `Authorizationtoken: Bearer <token>`.

Después del login se navega a Home. Home solicita `user_info` (y, en paralelo, envía el token push con `user_token`). `user_info` alimenta el nombre, el indicador de geolocalización, el estado de jornada y el contador de notificaciones. La empresa mostrada en fichaje no procede de `user_info`: se obtiene con `company_info`, llamado durante el login y guardado únicamente en memoria en `ApiProvider`.

Al abrir Registro de Asistencia (`Signing`) se consulta primero `user_turn`. Esa primera respuesta decide entre selección de múltiples horarios y jornada normal. Para una jornada normal, el frontend vuelve a llamar `user_turn` y lanza `user_buttons`; ambas solicitudes se inician sin esperarse entre sí. `user_turn` aporta fecha, horario, marcas y tiempo trabajado. `user_buttons` es la fuente de verdad de las acciones disponibles y de los motivos de pausa.

Todas las marcaciones usan `POST` al mismo `index.php` con `action: "user_fichaje"`. Entrada, pausa, reanudación y salida comparten el payload base; firma añade `signature`. Tras una operación exitosa se navega nuevamente a `Signing`, lo que dispara otra carga preliminar de `user_turn` y, cuando no hay horarios múltiples, otra consulta de `user_turn` más `user_buttons`.

Conclusión para kiosco: el backend debe seguir siendo la fuente de verdad del estado y de las acciones permitidas. `kiosk_shift_status` debería consolidar el papel de `user_turn` + `user_buttons`, y `kiosk_fichaje` debería conservar las mismas reglas de negocio que `user_fichaje`, evitando duplicarlas en la tablet.

## 2. Archivos revisados

Archivos solicitados:

- `src/context/ApiProvider.js`
- `src/context/AuthProvider.js`
- `src/screens/auth/Login.js`
- `src/screens/home/Home.js`
- `src/screens/home/signing/Signing.js`
- `src/components/ButtonSigning.js`
- `src/screens/home/signing/SignDay.js`
- `src/components/CardSelectTurn.js`

Archivos adicionales necesarios para cerrar el flujo:

- `App.js`: interceptor global de autenticación.
- `src/components/CardSigning.js`: composición de la tarjeta de jornada.
- `src/components/ActionSigning.js`: permiso y captura de geolocalización.
- `src/hooks/useForm.js`: estado del payload de marcación.
- `src/navigation/Navigate.js`: rutas `Inicio`, `Signing` y `SignDay`.

También se hizo una búsqueda global en `src` de los endpoints, códigos y campos indicados. No se encontró otro endpoint específico del fichaje personal fuera de los descritos aquí.

## 3. Endpoints detectados

| Orden/contexto | Método | Endpoint/action | Finalidad |
|---|---|---|---|
| Login | POST | `index.php`, `action=auth` | Obtener `access_token`. |
| Login, tras autenticar | GET | `?action=company_info` | Obtener nombre de empresa. |
| Home al ganar foco | GET | `?action=user_info` | Identidad, estado de jornada, geolocalización y notificaciones. |
| Home al ganar foco | PATCH | `index.php`, `action=user_token` | Registrar token push; ocurre en paralelo con `user_info`. |
| Abrir/refrescar Signing | GET | `?action=user_turn` | Detección preliminar de múltiples horarios y fecha. |
| Jornada no múltiple | GET | `?action=user_turn` | Obtener horario/marcas/tiempo para renderizar. Es una segunda petición. |
| Jornada no múltiple | GET | `?action=user_buttons` | Obtener acciones permitidas y motivos de pausa. |
| Elegir horario | POST | `index.php`, `action=user_turn` | Asociar `idHorarioM` a la fecha laboral. |
| Marcar | POST | `index.php`, `action=user_fichaje` | Entrada, pausa, reanudación, salida o salida con firma. |
| Logout | DELETE | `?action=auth` | Cerrar sesión en backend; luego limpia almacenamiento local. |

`fetch_month_data` y `fetch_day_details` pertenecen al calendario, no al flujo de marcación operativo.

## 4. Flujo actual del modo personal

1. El usuario configura/recupera `apiUrl` y envía usuario y contraseña.
2. Login hace `POST auth` y espera `response.data.access_token`.
3. `AuthProvider.login` guarda el token, opcionalmente las credenciales recordadas, y marca la sesión autenticada.
4. Login espera `company_info`, reinicia el formulario y navega a `Home`.
5. Home, al ganar foco, reinicia sus estados visuales y lanza `user_info` y `user_token` en paralelo.
6. `user_info.data.status` decide la tarjeta: `Sin iniciar`, `En proceso` o `Finalizado`.
7. Al abrir `Signing`, `getUserTurnPreliminary` limpia el estado y llama `user_turn`.
8. Si `data.multiples` es verdadero, muestra `CardSelectTurn` con `data.horarios`; no pide botones todavía.
9. Si no es múltiple, inicia una segunda consulta `user_turn` y una consulta `user_buttons` sin orden garantizado entre ellas.
10. Cuando hay datos de jornada, nombre y acciones, muestra `CardSigning`; mientras tanto muestra `SkeletonSigning`.
11. `ActionSigning` obtiene ubicación o usa `(0,0)`, según `geoLocation`.
12. `ButtonSigning` renderiza acciones según los códigos recibidos y registra la elección con `POST user_fichaje`.
13. Un éxito navega a `Signing` con `message/type`; el foco y el efecto asociado vuelven a consultar el estado.

## 5. Detalle de `user_info`

### Dónde y cuándo

`Home.js` lo llama dentro de `useFocusEffect`: después del login al entrar a Home y cada vez que Home recupera foco. No se llama directamente desde Login ni desde Signing.

### Campos comprobados por consumo del frontend

La app lee:

- `response.data.data.firstname`
- `response.data.data.lastname`
- `response.data.data.geolocal`
- `response.data.data.status`
- `response.data.data.notifications`

Usos:

- `firstname + lastname`: nombre global y saludo.
- `geolocal`: controla si debe pedirse ubicación antes de mostrar botones.
- `status`: controla la tarjeta de Home (`Sin iniciar`, `En proceso`, `Finalizado`).
- `notifications`: contador del icono de notificaciones.

No se puede afirmar desde el cliente que la respuesta incluya otros campos. La empresa no se toma de aquí, sino de `company_info`. Sí influye en fichaje indirectamente mediante `geolocal` y mediante la navegación que ofrece `status`; no determina los botones concretos.

### Error

Solo hay tratamiento visible para error HTTP con `error.response.status === 500`: alerta con `error.response.data.msg` o texto genérico y `logout()`. Otros errores quedan sin mensaje.

## 6. Detalle de `user_turn`

### Solicitud

La consulta normal es `GET ?action=user_turn`, sin fecha enviada por el cliente. La fecha laboral procede de `response.data.data.date`, no del reloj local. El reloj local solo se usa como fallback visual mientras la fecha no existe.

### Respuesta esperada por el código

| Campo | Uso |
|---|---|
| `data.multiples` | Decide si debe seleccionarse horario. |
| `data.horarios` | Opciones de horario múltiple. Puede ser array u objeto. |
| `data.date` | Fecha laboral; selección del día y payload posterior. |
| `data.id` | `-1` significa turno libre. |
| `data.titulo` | Título de horario, fallback `N/A`. |
| `data.horario[day]` | Tramos programados del día (`in`, `out`). |
| `data.marks[day]` | Marcas reales mostradas cuando ya existen. |
| `data.marks.length` | Primer intento de contar marcas; si no existe, usa `Object.keys(marks).length`. |
| `data.time.tiempo_trabajado` | Total trabajado cuando existen marcas. |

El día (`monday`, `tuesday`, etc.) se deriva con Day.js a partir de `data.date`.

### Estados de jornada

- Sin marcas y turno programado: muestra los tramos de `horario`, calcula duración por resta local y totaliza.
- Con marcas: muestra `marks[day]` y usa `time.tiempo_trabajado`.
- Turno libre (`id == -1`) sin marcas: simula un tramo `--:-- a --:--`, total `00:00`.
- Horarios múltiples: presenta selector y no consulta botones hasta seleccionar.
- Ausencia o forma inesperada de datos: normalmente permanece el skeleton; no existe una vista explícita de “sin turno”.

### Carga y orden real

`getUserTurnPreliminary` hace una primera llamada. Si no hay múltiples horarios llama, sin `await`, a `getUserTurn()` y `getUserButtons()`. Por ello:

- `user_turn` ocurre antes que esas dos llamadas en sentido causal;
- luego la segunda `user_turn` y `user_buttons` son concurrentes;
- no existe dependencia técnica de respuesta entre la segunda `user_turn` y `user_buttons`.

### Error

La llamada preliminar tiene `catch` silencioso. La segunda llamada, ante HTTP 500, muestra el mensaje del backend o uno genérico y cierra sesión. Otros errores no producen feedback explícito.

## 7. Detalle de `user_buttons`

El backend decide qué acciones están permitidas. El frontend no deriva una máquina de estados a partir de las marcas; solo traduce campos conocidos de la respuesta a una lista de códigos.

Estructura consumida:

```text
data.Firma.action
data.Entrada.action
data.Salida.action
data.Pausa.action
data.Pausa.motivos[<id>].label
data.Reanudacion.action
```

Orden en la lista local: Firma, Entrada, Salida, Pausa, Reanudación. Si ninguna existe, añade el centinela `none` para terminar el loader y mostrar la tarjeta sin botones.

Transformación de motivos:

```text
Pausa.motivos (objeto) -> [{ id: clave, label: motivos[clave].label }]
```

Renderizado efectivo en `ButtonSigning`:

- `ficharentrada` → botón **Iniciar**.
- `ficharpausa` → botón **Pausar** y, además, botón **Finalizar**.
- `ficharfirma` → botón **Firmar**.
- `ficharreanudacion` → botón **Reanudar**.
- No existe una condición de renderizado directa para `ficharsalida`, aunque `Signing` sí recoge `data.Salida.action`. En la implementación actual, **Finalizar** se muestra bajo la condición `actions.includes("ficharpausa")` y al pulsarlo envía `ficharsalida`.

Esta asimetría debe confirmarse con backend antes de replicarla: si el backend devuelve solo `ficharsalida`, el modo personal no muestra un botón de salida. Una acción desconocida o ausente no se renderiza.

### Error

Ante HTTP 500 muestra el mensaje backend o uno genérico y ejecuta logout. Otros errores no muestran feedback.

## 8. Detalle de `user_fichaje`

`ButtonSigning` arma y envía los payloads de entrada, pausa, reanudación y salida. `SignDay` arma el payload de firma.

Los campos se envían siempre en las cuatro marcaciones directas, aunque estén vacíos o sean `undefined`; no hay filtrado de propiedades. `description` y `motivo_pausa` empiezan como cadena vacía. `long` y `lat` proceden de `ActionSigning`. `date` procede de `user_turn.data.date`.

Respuesta esperada:

```json
{
  "success": true,
  "msg": "texto opcional"
}
```

El código solo usa `success` para decidir el camino y `msg` en errores de negocio. No consume datos de jornada devueltos por esta operación.

Tras éxito directo navega a la misma ruta `Signing` con un mensaje específico. Esto provoca recarga por foco y por el efecto que observa `message/type`; dependiendo del comportamiento de navegación, puede causar más de una ejecución de la carga preliminar. No hay llamada directa a `user_turn`/`user_buttons` dentro de `ButtonSigning`.

## 9. Manejo de selección de horario

Cuando `user_turn.data.multiples` es verdadero, `CardSelectTurn` normaliza `data.horarios`:

- objeto: cada clave se convierte en `id`;
- array: el índice convertido a string se usa como `id`.

La tarjeta muestra `titulo`, los tramos del día de `dateUserTurn` y un total calculado localmente. Al confirmar exige una selección y envía:

```json
{
  "action": "user_turn",
  "date": "<data.date de user_turn>",
  "idHorarioM": "<id seleccionado>"
}
```

Es un `POST` a `index.php`. `idHorarioM` representa la clave/identificador del horario múltiple seleccionado. En el caso de un array, el cliente envía el índice, no un campo de ID interno.

Con `success: true`, navega a `Signing` con mensaje de éxito. La pantalla vuelve a ejecutar la consulta preliminar; si ya no es múltiple, vuelve a pedir la jornada y los botones. El POST no se usa directamente para poblar estado.

Con `success: false`, muestra `response.data.msg` o fallback. Con HTTP 500 muestra mensaje, hace logout y detiene el loader. Otros errores solo detienen el loader.

## 10. Manejo de pausa

La pausa abre un modal. Los motivos vienen exclusivamente de `user_buttons.data.Pausa.motivos`. El frontend exige que `motivo_pausa` tenga valor; si falta muestra `Debes seleccionar un motivo de pausa.` y no envía la petición.

La descripción es editable pero no es validada como obligatoria. Tras éxito se cierra el modal, se limpian motivo y descripción y se navega a Signing. El backend debe validar la validez del motivo, cualquier obligatoriedad de descripción y el estado laboral que permita pausar.

## 11. Manejo de firma/salida

`ficharfirma` no se envía directamente desde el botón. El botón **Firmar** navega a `SignDay`, donde el usuario dibuja una firma. El canvas devuelve una cadena (normalmente un data URI/base64) que se manda en `signature` junto con el payload común.

El código considera la firma una salida: el mensaje exitoso es `Salida registrada correctamente.` y el reset de navegación deja `Inicio` + `Signing`.

Hallazgo de implementación: `ButtonSigning` navega con una propiedad llamada `date`, pero `SignDay` desestructura `dateUserTurn` y luego la envía como `date`. Por tanto, en el flujo observado `date` puede llegar como `undefined` al backend. Este documento no corrige el defecto; kiosco debe definir un contrato de nombre único.

Si no hay firma, el frontend impide el POST y muestra `Por favor, firme antes de continuar.`. En `success: false` limpia la firma, muestra `response.data.msg` y resetea la navegación a Inicio. En error de transporte asigna el mensaje genérico, pero no abre explícitamente el modal; por ello ese mensaje puede no ser visible inmediatamente.

## 12. Manejo de errores

| Caso | Comportamiento actual |
|---|---|
| Login sin red/configuración/campos | Modal con validación local. |
| Login HTTP o credenciales sin token | `Por favor, verifica tus credenciales.` |
| `user_info` HTTP 500 | Alerta con `msg`/fallback y logout. |
| `user_turn` preliminar | Fallo silencioso; queda skeleton/estado vacío. |
| Segundo `user_turn` HTTP 500 | Alerta con `msg`/fallback y logout. |
| `user_buttons` HTTP 500 | Alerta con `msg`/fallback y logout. |
| Selección de horario `success=false` | Alerta con `msg`/fallback. |
| Selección de horario HTTP 500 | Alerta y logout. |
| `user_fichaje success=false` directo | Alerta con `response.data.msg`. |
| `user_fichaje` HTTP/transporte directo | Mensaje genérico específico por acción; no usa detalle HTTP. |
| Permiso de ubicación denegado | Texto en pantalla; no renderiza ningún botón de acción. |
| Error al obtener posición después de permiso | No hay `try/catch` en el efecto; puede quedar en loader/error no controlado. |
| Firma vacía | Modal con instrucción de firmar. |
| Firma `success=false` | Modal con `msg`, limpia firma y vuelve a Inicio. |
| Firma HTTP/transporte | Asigna mensaje genérico sin activar explícitamente el modal. |

No existe un manejador global de respuestas HTTP ni un tratamiento uniforme de 401/403. La lógica de negocio rechazada se identifica solo con `response.data.success === false`.

## 13. Tabla de payloads

| Acción UI | Payload |
|---|---|
| Login | `{ action: "auth", grant_type: "client_credentials", client_id: username, client_secret: password }` |
| Seleccionar horario | `{ action: "user_turn", date: dateUserTurn, idHorarioM: turnId }` |
| Entrada | `{ action: "user_fichaje", fichaje: "ficharentrada", description, motivo_pausa, long, lat, date }` |
| Pausa | `{ action: "user_fichaje", fichaje: "ficharpausa", description, motivo_pausa, long, lat, date }` |
| Reanudación | `{ action: "user_fichaje", fichaje: "ficharreanudacion", description, motivo_pausa, long, lat, date }` |
| Salida | `{ action: "user_fichaje", fichaje: "ficharsalida", description, motivo_pausa, long, lat, date }` |
| Firma/salida | `{ action: "user_fichaje", signature, fichaje: "ficharfirma", description, motivo_pausa, long, lat, date }` |

Notas:

- Solo pausa valida localmente `motivo_pausa`.
- `description` nunca es obligatoria en frontend.
- Entrada/reanudación/salida/firma normalmente llevan motivo y descripción vacíos.
- Si `geolocal` no es `"1"` ni `"2"`, se envían `lat: 0`, `long: 0`.
- Si exige geolocalización, se envían coordenadas reales; sin permiso no se puede pulsar una acción.
- Los POST usan JSON por el comportamiento predeterminado de Axios.

## 14. Tabla de actions/códigos

| Código | Fuente/uso | Etiqueta actual | Datos extra frontend |
|---|---|---|---|
| `auth` | Login/logout | Iniciar/cerrar sesión | Credenciales al iniciar. |
| `company_info` | Login | Empresa | Ninguno. |
| `user_info` | Home | Estado global | Ninguno. |
| `user_turn` | Signing/selector | Jornada/horario | `date`, `idHorarioM` solo al seleccionar. |
| `user_buttons` | Signing | Acciones permitidas | Ninguno. |
| `user_fichaje` | Marcación | Registrar acción | Código `fichaje` y payload común. |
| `ficharentrada` | `user_fichaje` | Iniciar | Ubicación/fecha. |
| `ficharpausa` | `user_fichaje` | Pausar | Motivo obligatorio en frontend; descripción opcional. |
| `ficharreanudacion` | `user_fichaje` | Reanudar | Ubicación/fecha. |
| `ficharsalida` | `user_fichaje` | Finalizar | Ubicación/fecha; renderizado ligado actualmente a `ficharpausa`. |
| `ficharfirma` | `user_fichaje` | Firmar/salida | Firma obligatoria en frontend. |

## 15. Diagrama textual del flujo personal

```text
[Login personal]
   ↓ POST auth (usuario/contraseña)
¿access_token?
   ├─ No → [Error de credenciales]
   └─ Sí → [Guardar token en AsyncStorage]
               ↓ GET company_info
            [Navegar a Home]
               ↓ (en paralelo)
      ┌────────┴─────────┐
      ↓                  ↓
 [GET user_info]   [PATCH user_token]
      ↓
[Nombre + geolocal + status + notificaciones]
      ↓
[Abrir Registro de Asistencia / Signing]
      ↓
[Limpiar estados + GET user_turn preliminar]
      ↓
¿data.multiples?
   ├─ Sí → [Mostrar horarios]
   │          ↓
   │       [Seleccionar idHorarioM]
   │          ↓ POST user_turn {date, idHorarioM}
   │       ¿success?
   │          ├─ No → [Mostrar error]
   │          └─ Sí → [Volver a Signing y reiniciar consulta]
   │
   └─ No → (en paralelo)
              ┌──────────────┴──────────────┐
              ↓                             ↓
       [GET user_turn]              [GET user_buttons]
              ↓                             ↓
 [Horario/marcas/tiempo]      [Acciones + motivos de pausa]
              └──────────────┬──────────────┘
                             ↓
                  [Obtener ubicación o (0,0)]
                             ↓
                    ¿Permiso si se requiere?
                       ├─ No → [Bloquear acciones]
                       └─ Sí → [Mostrar acciones permitidas]
                                      ↓
                            Usuario elige acción
                                      ↓
                        ¿Requiere dato adicional?
                  ┌───────────┼────────────┐
                  ↓           ↓            ↓
               Pausa        Firma       Otras
          motivo obligatorio canvas     directo
          descripción opcional
                  └───────────┴────────────┘
                              ↓
                    [POST user_fichaje]
                              ↓
                         ¿success?
                ├─ No → [Mostrar msg/error]
                └─ Sí → [Navegar a Signing]
                              ↓
                [Refrescar user_turn + user_buttons]
```

## 16. Equivalencia conceptual para kiosco

| Modo personal | Responsabilidad | Equivalente kiosco propuesto |
|---|---|---|
| Configuración `apiUrl` + `company_info` | Identificar servidor/empresa | `kiosk_config` y configuración persistente del terminal. |
| `auth` con credenciales | Identidad y token duradero personal | `kiosk_validate_qr`, produciendo credencial temporal y acotada. |
| `user_info` | Trabajador, estado, geolocalización | Parte de `kiosk_validate_qr` o `kiosk_shift_status`; devolver identidad mínima y política de ubicación. |
| `user_turn` | Fecha, horario, marcas, múltiples turnos | `kiosk_shift_status`. |
| `user_buttons` | Acciones y motivos permitidos | `kiosk_shift_status` debería devolverlos en la misma respuesta para evitar carreras. |
| `POST user_turn` | Elegir horario múltiple | Definir dentro de `kiosk_shift_status` o endpoint/operación explícita; actualmente falta en el diseño previsto. |
| `user_fichaje` | Ejecutar acción | `kiosk_fichaje`. |
| Navegar a Signing para refrescar | Reconciliar estado | Respuesta de `kiosk_fichaje` + confirmación; opcional revalidación en backend antes de confirmar. |
| Logout/estado personal persistente | Fin de sesión | Invalidar/borrar token temporal después de éxito, error terminal o timeout. |

Reglas recomendadas para preservar:

- Backend decide acciones permitidas y valida nuevamente al registrar; el kiosco solo renderiza.
- Fecha laboral debe venir del backend y viajar de forma consistente en la marcación.
- Motivos de pausa deben venir con las acciones.
- Política de geolocalización debe ser explícita para el terminal, no heredada accidentalmente del trabajador.
- El token temporal debe estar ligado al terminal, trabajador, empresa, TTL corto y propósito de fichaje.
- No copiar la asimetría actual de salida/pausa ni la discrepancia `date`/`dateUserTurn`.

## 17. Diagrama textual del flujo kiosco

```text
[Arranque modo kiosco]
   ↓
[kiosk_config: terminal, empresa, políticas]
   ↓
[Terminal de fichaje]
   ↓
[Escanear QR]
   ↓
[kiosk_validate_qr]
   ↓
¿QR válido y trabajador habilitado?
   ├─ No → [Mostrar error breve] → [Limpiar datos] → [Terminal]
   └─ Sí → [Guardar token temporal en memoria]
                  ↓
         [kiosk_shift_status]
                  ↓
   [Identidad mínima + fecha laboral + jornada/marcas
    + acciones permitidas + motivos + opciones de horario]
                  ↓
         ¿Múltiples horarios sin resolver?
   ├─ Sí → [Seleccionar horario]
   │          ↓
   │       [Enviar selección al backend]
   │          ↓
   │       [Refrescar kiosk_shift_status]
   └─ No
      ↓
[Mostrar únicamente acciones permitidas]
      ↓
Usuario selecciona acción
      ↓
¿Datos adicionales?
   ├─ Pausa → [Motivo + descripción opcional]
   ├─ Firma → [Definir si kiosco la soporta]
   └─ Resto → [Sin formulario adicional]
      ↓
[POST kiosk_fichaje con token temporal, acción, fecha/contexto]
      ↓
¿success?
   ├─ Sí → [Confirmación] → [Invalidar/limpiar token] → [Terminal]
   └─ No → ¿Error recuperable?
              ├─ Sí → [Mostrar error y permitir reintento acotado]
              └─ No → [Invalidar/limpiar token] → [Terminal]

[Timeout/inactividad/cancelación en cualquier pantalla]
   → [Invalidar/limpiar token y datos del trabajador] → [Terminal]
```

## 18. Dudas para backend

1. ¿Cuál es el contrato completo y tipado de `user_turn`, especialmente `marks`, `horarios`, `id == -1` y `multiples`?
2. ¿Por qué el cliente hace dos GET consecutivos de `user_turn`? ¿Puede garantizarse que una sola respuesta sea suficiente?
3. ¿`user_buttons` siempre devuelve `Pausa` junto con la posibilidad de salida? ¿Cuándo devuelve `Salida.action = ficharsalida` y por qué el cliente no lo renderiza directamente?
4. ¿Qué estados/transiciones valida `user_fichaje` para impedir acciones obsoletas o repetidas?
5. ¿Qué valores exactos admite `geolocal` (`"1"`, `"2"`, otros) y qué semántica tiene cada uno?
6. ¿Son `(0,0)` valores contractuales para “sin geolocalización” o deberían ser `null`/campos omitidos?
7. ¿`description` es obligatoria para algún motivo? ¿Qué longitud/formato admite?
8. ¿`motivo_pausa` debe enviarse como string o número? El picker y las claves de objeto lo producen como string.
9. ¿La fecha es obligatoria en `user_fichaje`? ¿Backend puede/debe ignorar una fecha de cliente y usar su fecha laboral calculada?
10. ¿`ficharfirma` equivale siempre a salida? ¿Qué formato y límite de tamaño admite `signature`?
11. ¿Qué códigos HTTP y esquema de error (`success`, `msg`, código de negocio) serán uniformes en kiosco?
12. ¿Cómo se seleccionará un horario múltiple en los cuatro endpoints kiosco previstos? Falta una operación explícita en el listado actual.
13. ¿`kiosk_shift_status` consolidará jornada, marcas, acciones, motivos y selección de horario en una sola respuesta?
14. ¿Qué TTL, audiencia, uso único y mecanismo de invalidación tendrá el token temporal?
15. ¿Qué debe ocurrir si dos terminales o el móvil intentan marcar simultáneamente?
16. ¿Firma se permitirá en tablet compartida, se sustituirá por otra evidencia o se excluirá del alcance kiosco?

## 19. Recomendaciones para Excalidraw

- Dibujar dos swimlanes principales: **Frontend móvil** y **Backend**; para kiosco añadir **Terminal/lector QR**.
- Separar visualmente autenticación, carga de estado, selección de horario y ejecución de marcación.
- Mostrar expresamente que la segunda `user_turn` y `user_buttons` ocurren en paralelo.
- Usar rombos para `multiples`, permiso de ubicación, datos adicionales y `success`.
- Marcar en color distinto las reglas frontend: validación de motivo, permiso de ubicación, firma no vacía, cálculo/formato visual de horas.
- Marcar como reglas backend: fecha laboral, horarios/marcas, acciones permitidas, motivos válidos y validación final de transición.
- Añadir notas de riesgo junto a salida (`ficharsalida` renderizada bajo `ficharpausa`) y firma (`date` frente a `dateUserTurn`).
- En kiosco, destacar el límite de seguridad de la sesión temporal y todos los caminos que limpian el token (éxito, error no recuperable, cancelación y timeout).

## Clasificación de reglas: frontend frente a backend

### Frontend comprobado

- Valida URL, conectividad y campos de login.
- Guarda token y configura el header global.
- Decide la presentación según `status`, pero no calcula ese estado.
- Formatea horarios y calcula duración programada cuando no hay marcas.
- Convierte respuestas a componentes/botones conocidos.
- Exige motivo para pausa y firma no vacía.
- Solicita permiso y captura ubicación según `geolocal`.
- Controla loaders, modales y navegación/refresco.

### Delegado al backend (por ausencia de lógica local)

- Autenticación y validez del token.
- Estado de jornada (`status`).
- Fecha laboral efectiva.
- Horario, turno libre, múltiples horarios y marcas.
- Tiempo trabajado cuando hay marcas.
- Acciones permitidas en cada momento.
- Catálogo/validez de motivos de pausa.
- Aceptación o rechazo final de cada fichaje.

El frontend no debe considerarse una barrera de seguridad: los payloads pueden construirse fuera de la app. Todas las reglas deben volver a validarse en backend y conservarse así en kiosco.
