# Plan de análisis y refactorización controlada de la pantalla de fichaje

## Alcance y restricciones

Este documento analiza exclusivamente:

- `src/screens/home/signing/Signing.js`
- `src/components/CardSigning.js`
- `src/components/CardSelectTurn.js`
- `src/components/SkeletonSigning.js`

Se consultaron `package.json` y `app.json` únicamente para contextualizar los riesgos de Expo SDK 55. No se propone modificar configuración, dependencias, endpoints, contratos de API, autenticación, navegación, diseño ni reglas de negocio.

La pantalla usa Expo SDK 55 (`expo ~55.0.28`), React Native 0.83.10 y React 19.2.0. Expo SDK 55 funciona exclusivamente con la Nueva Arquitectura de React Native. Referencias oficiales: [Expo SDK 55](https://expo.dev/changelog/sdk-55), [Nueva Arquitectura](https://docs.expo.dev/guides/new-architecture/) y [useFocusEffect](https://reactnavigation.org/docs/use-focus-effect/).

## Resumen funcional de la pantalla

`Signing` obtiene el turno correspondiente a la fecha informada por el servidor, decide si el usuario debe escoger entre varios horarios y, cuando ya existe un turno aplicable, obtiene las acciones de fichaje habilitadas. Después presenta una de tres vistas:

- `CardSigning`: datos del usuario y empresa, título del horario, tramos de jornada, total trabajado/programado y las acciones existentes (`Firma`, `Entrada`, `Salida`, `Pausa`, `Reanudacion`) mediante `ActionSigning`.
- `CardSelectTurn`: lista de horarios cuando el servidor indica un turno múltiple; permite escoger uno y confirmarlo.
- `SkeletonSigning`: estado visual transitorio cuando todavía no se satisfacen las condiciones de las otras vistas.

Hay tres modalidades funcionales que deben conservarse exactamente:

- Turno normal: se presentan horario, total y acciones.
- Turno múltiple: primero se selecciona el horario; la selección se envía al servidor y se vuelve a cargar `Signing`.
- Turno libre: si todavía no hay marcas, se simula visualmente un tramo `--:-- a --:--` y total `00:00`; si hay marcas, se muestran las marcas y el tiempo trabajado recibido.

## Mapa de flujo actual

```text
Pantalla entra en foco
  -> useFocusEffect
     -> getUserTurnPreliminary()
        -> GET ...?action=user_turn
        -> guarda date
        -> ¿data.multiples?
           sí -> isUserMultipleTurn=true
              -> guarda data.horarios
              -> render esperado: CardSelectTurn
           no -> getUserTurn() y getUserButtons() en paralelo no coordinado
              -> GET ...?action=user_turn (segunda petición idéntica)
                 -> determina día desde data.date
                 -> horario[day], marks[day], time, id y titulo
                 -> ¿sin marcas y turno no libre?
                    sí -> formatea tramos programados y calcula total
                    no -> usa marcas y tiempo_trabajado
                 -> ¿libre y sin marcas?
                    sí -> tramo visual --:-- / --:--, total 00:00
              -> GET ...?action=user_buttons
                 -> arma acciones en orden Firma/Entrada/Salida/Pausa/Reanudacion
                 -> transforma motivos de Pausa

Si cambian route.params.message o route.params.type
  -> useEffect
     -> repite getUserTurnPreliminary()

Render (prioridad efectiva)
  1. Si countTurnData > 0, userName no vacío y actions no vacío -> CardSigning
  2. En otro caso, si isUserMultipleTurn -> CardSelectTurn
  3. En otro caso, si isUserFreeTurn -> CardSigning
  4. En otro caso -> SkeletonSigning

Confirmación en CardSelectTurn
  -> POST .../index.php
     params exactos: { action: "user_turn", date, idHorarioM }
  -> success -> navigation.navigate("Signing", { message, type })
  -> Signing vuelve a consultar el estado
```

## Inventario de estado

| Estado | Uso actual | Diagnóstico |
|---|---|---|
| `motives` | Se entrega a `CardSigning`/`ActionSigning` | Necesario, pero debe vaciarse si una respuesta posterior ya no ofrece `Pausa`. |
| `currentDate` | Se inicializa, nunca se lee ni actualiza | Innecesario. Puede eliminarse en una fase segura. |
| `turnData` | Tramos programados o marcas | Necesario. El tipo alterna entre arreglo y objeto; conviene normalizar internamente sin cambiar el contrato externo. |
| `dateUserTurn` | Fecha del servidor, encabezado, día y POST de selección | Necesario. Debe validarse antes de derivar el día o confirmar un turno. |
| `titleTurn` | Título mostrado en `CardSigning` | Necesario; puede quedar obsoleto entre recargas si no se reinicia. |
| `countTurnData` | Cantidad mostrada y parte de la condición de render | Es estado derivado de `turnData`; mantenerlo separado permite inconsistencias. Candidato a derivación controlada. |
| `totalHours` | Total programado o trabajado | Necesario como valor derivado/normalizado; actualmente cambia de número inicial (`0`) a texto (`HH:MM`). Debe tener tipo estable. |
| `actions` | Acciones habilitadas | Necesario; el valor `['none']` también activa `CardSigning`, por lo que es parte del comportamiento actual y no debe retirarse sin validar `ActionSigning`. |
| `isUserFreeTurn` | Modalidad libre y fallback de render | Necesario, aunque el prop `isFreeTurn` que se envía a `CardSigning` no está declarado ni usado allí. |
| `isUserMultipleTurn` | Modalidad múltiple y tipo de contenedor | Necesario; hoy solo se establece en `true`, nunca explícitamente en `false`. Riesgo alto de estado residual. |
| `multipleTurnsData` | Datos para `CardSelectTurn` | Necesario; hoy no se limpia cuando la respuesta deja de ser múltiple. |
| `isLoading` (`CardSelectTurn`) | Bloqueo/carga del POST | Necesario. |
| `selectedTurnId` (`CardSelectTurn`) | Selección local | Necesario; debe preservar IDs válidos como `0` si el backend pudiera enviarlos. |

También existen variables/importaciones sin efecto: `dayWeek` en ambas funciones de turno y en `renderTurnCard`, `currentDate`, `ScrollView` importado en `CardSelectTurn`, y el prop `isFreeTurn` enviado pero no consumido por `CardSigning`.

## Llamadas de API actuales

### `user_turn`

1. `getUserTurnPreliminary` hace `GET {apiUrl}/custom/fichajes/api/index.php?action=user_turn` para leer `data.multiples`, `data.date` y, en su caso, `data.horarios`.
2. Si no es múltiple, `getUserTurn` repite inmediatamente el mismo `GET` y procesa `data.horario`, `data.marks`, `data.time`, `data.id`, `data.titulo` y `data.date`.
3. `CardSelectTurn` hace `POST {apiUrl}/custom/fichajes/api/index.php` con `{ action: "user_turn", date: dateUserTurn, idHorarioM: turnId }`.

No se debe cambiar ninguna URL, método, nombre de campo ni forma del payload. La mejora segura es reutilizar la respuesta del primer GET en una función pura de procesamiento. Esto elimina el segundo GET sin alterar el contrato. Antes de hacerlo debe confirmarse mediante pruebas que el backend no depende de dos lecturas consecutivas ni produce una respuesta deliberadamente distinta entre ambas; aunque sería inesperado, hoy esa duplicidad forma parte del comportamiento observable.

### `user_buttons`

Se hace un GET a `...?action=user_buttons` solo cuando la respuesta preliminar no es múltiple. Las acciones se agregan en un orden fijo y los motivos de `Pausa` se convierten a `{ id, label }`. Deben conservarse tanto el orden como todos los nombres de acciones y el fallback `none` hasta revisar, en una fase separada, el contrato de `ActionSigning`.

Actualmente `getUserTurn()` y `getUserButtons()` se disparan sin `await` ni coordinación. El render depende de que ambas terminen, pero no existe estado explícito de carga/error ni protección frente a respuestas fuera de orden.

## Riesgos detectados

### Riesgo alto

1. **Estado residual al cambiar de modalidad.** `isUserMultipleTurn` nunca vuelve a `false`; `isUserFreeTurn` solo se actualiza dentro del segundo GET; tampoco se limpian `multipleTurnsData`, `actions`, `motives`, `turnData`, `countTurnData` o `titleTurn` al iniciar una recarga. Una respuesta nueva puede mezclarse temporal o permanentemente con datos anteriores.
2. **Prioridad de render incompatible con estado residual.** `CardSigning` tiene prioridad sobre `CardSelectTurn`. Si existen `countTurnData` y `actions` de una carga anterior, una respuesta múltiple nueva puede seguir mostrando el fichaje anterior aunque `isUserMultipleTurn` sea `true`.
3. **Carreras y actualización tras blur/unmount.** No hay cancelación con `AbortController`/Axios ni bandera de actividad. Una solicitud anterior puede sobrescribir datos más recientes o actualizar estado cuando la pantalla ya perdió foco. React Navigation recomienda limpiar o ignorar resultados de efectos asíncronos al perder foco.
4. **Acceso inseguro a respuesta parcial.** Expresiones como `response.data.data.multiples`, `response.data.data.date`, `horario[day]`, `marks[day]`, `marks.length`, `time.tiempo_trabajado`, `Object.keys(turn)` y `Object.keys(marks)` pueden lanzar si falta cualquier nodo. El `catch` no siempre produce UI de error, por lo que el usuario puede quedar indefinidamente ante el skeleton.
5. **Cálculo incorrecto para turnos nocturnos.** Restar dos fechas del mismo día produce duración negativa cuando `out < in` (por ejemplo, 22:00–06:00). No debe corregirse sin confirmar la regla actual del backend, porque sería un cambio de lógica de negocio.

### Riesgo medio

6. **GET duplicado de `user_turn`.** Aumenta latencia, consumo y probabilidad de que dos respuestas representen estados distintos. La variable `dateUserTurn` incluso puede cambiar entre las dos respuestas.
7. **Doble recarga potencial.** Volver/navegar a `Signing` puede activar `useFocusEffect`; el cambio de `message/type` activa además `useEffect`. Ambos llaman la misma carga y pueden solaparse.
8. **Dependencias obsoletas del callback.** El `useCallback` de `useFocusEffect` tiene `[]` aunque usa funciones que cierran sobre `apiUrl` y `logout`. Si cambia el contexto, el callback mantiene referencias antiguas. Añadir directamente funciones recreadas como dependencias también podría causar recargas excesivas; primero se necesita estabilizar el cargador.
9. **Errores silenciosos.** Solo HTTP 500 muestra alerta y ejecuta `logout`. Errores de red, timeout, respuestas 4xx distintas, `success: false` inesperado y errores de parseo no dejan estado recuperable ni mensaje. Debe preservarse la política actual de logout hasta que el dueño funcional autorice cambios.
10. **Skeleton utilizado como error y como estado vacío.** No hay distinción entre “cargando”, “sin acciones”, “sin usuario”, “respuesta inválida” y “falló la red”. Esto dificulta diagnóstico y puede mostrar una carga infinita.
11. **Mutación de datos de respuesta.** `turn` referencia directamente `response.data.data.horario[day]` y sus items se mutan al formatear. Puede generar efectos laterales si el objeto se comparte o se reutiliza.
12. **Identificadores de turno y checks truthy.** `if (!turnId)` y `disabled={!selectedTurnId}` rechazan `0` o cadena vacía. La normalización suele producir strings, pero un objeto con ID numérico sobrescribe el ID generado por el spread (`{ id: key, ...value }`). Además, `keyExtractor` espera una cadena estable.
13. **Normalización ambigua de múltiples.** Para arreglos, se usa el índice como ID salvo que `...item` lo sobrescriba; para objetos, la propiedad `id` interna también puede sobrescribir la clave. Debe preservarse exactamente cuál ID llega hoy al POST hasta validar fixtures reales.
14. **Contenedores de scroll.** `Signing` usa `View` para múltiples porque `CardSelectTurn` contiene `FlatList`, y `ScrollView` para el resto. Esta decisión evita listas virtualizadas anidadas, pero el alto máximo se calcula una sola vez al importar el módulo y no reacciona a cambios de dimensiones. No conviene cambiarlo antes de pruebas en dispositivos.

### Riesgo bajo / mantenibilidad

15. **Formato horario duplicado.** El parseo, diferencia y formato se repite en `Signing` y `CardSelectTurn`, y dos veces dentro de `getUserTurn`.
16. **Redondeo con casos límite.** `Math.round` puede producir `minutes === 60` sin normalizar la hora. El cálculo con `Date` local es innecesario para horas simples y puede ocultar entradas inválidas.
17. **Tipos inestables.** `turnData` empieza como arreglo y después suele ser objeto; `totalHours` empieza como número y luego es texto. Esto aumenta ramas implícitas y errores de render.
18. **Fecha inválida o ausente.** El encabezado cae a la fecha local actual, pero el procesamiento usa directamente la fecha del servidor. `dayjs(null/undefined)` y zonas horarias pueden seleccionar un día distinto según el formato recibido. La fecha del servidor debe seguir siendo la autoridad; se requieren fixtures para conocer su formato real antes de tocar el parseo.
19. **Estado derivado duplicado.** `countTurnData` y parte de `totalHours` pueden derivarse de datos normalizados. Varias llamadas consecutivas a setters permiten combinaciones transitorias incoherentes.
20. **Código muerto y responsabilidades mezcladas.** Importaciones/variables sin uso y una función extensa mezclan transporte, validación, transformación, cálculo, efectos y presentación.
21. **Estilos y textos inline.** No son un problema funcional inmediato. Extraerlos solo aportaría claridad y debe hacerse sin cambios visuales, mediante comparación de capturas.
22. **Mojibake aparente.** La salida de consola muestra caracteres como `TÃ­tulo` y `ReanudaciÃ³n`; puede ser solo interpretación de encoding por la terminal. Hay que verificar bytes/render real antes de “corregirlos”, porque una conversión equivocada dañaría textos válidos.

## Logs con posible exposición en producción

Hay tres logs dentro del alcance:

- `console.log(error)` en `getUserTurnPreliminary` puede exponer la configuración de Axios, URL, cabeceras, datos de respuesta y detalles internos del servidor.
- `console.log(response.data.data)` imprime el payload completo de `user_turn`, potencialmente con horario, marcas, fecha e identificadores laborales.
- `console.log(response.data.data.horario[day])` imprime el horario diario.

Los dos últimos deben considerarse datos laborales sensibles. Su retiro o encapsulación tras una condición estrictamente de desarrollo es un cambio seguro y prioritario, sin alterar la lógica funcional.

## Riesgos específicos tras Expo SDK 55

1. SDK 55 incorpora React Native 0.83 y React 19.2, y no permite desactivar la Nueva Arquitectura. En esta pantalla no hay una API eliminada evidente, pero los componentes de terceros (`@rneui`, navegación y listas) deben validarse en builds nativos reales, no solo en Expo Go.
2. La Nueva Arquitectura y los ciclos de montaje/desmontaje de desarrollo hacen más visibles efectos no idempotentes, respuestas tardías y actualizaciones después de blur. La pantalla ya tiene solicitudes duplicables y sin cleanup; es un riesgo preexistente, no una regresión demostrada de SDK 55.
3. `react-native-screens` 4.23 mejora el ciclo de vida nativo de pantallas. Esto refuerza la necesidad de verificar foco/blur, retorno desde modales y navegación hacia la misma ruta con parámetros.
4. React 19 exige mayor disciplina en efectos. La carga debe ser idempotente, tener dependencias correctas y descartar/cancelar respuestas obsoletas. No debe introducirse memoización solo “por React 19” sin una necesidad medida.
5. `FlatList` bajo la Nueva Arquitectura debe probarse con selección, scroll, rotación/cambio de tamaño y accesibilidad. No hay evidencia en estos archivos de una incompatibilidad concreta; el riesgo principal es el cálculo estático de altura y el ciclo de navegación.
6. El salto de SDK puede revelar incompatibilidades de módulos usados por `ActionSigning`, pero ese componente queda fuera del alcance de este análisis. Debe cubrirse mediante pruebas integrales de las cinco acciones, sin refactorizarlo en esta fase.
7. Expo recomienda usar development builds para validar una app que se publicará. La aceptación de esta pantalla debe ejecutarse al menos en un build Android y uno iOS equivalentes a producción.

## Cambios seguros recomendados

Todos estos cambios corresponden a fases futuras; no se aplican en este documento.

1. Crear una única función de carga orquestadora con estados explícitos (`loading`, `ready`, `selecting`, `error`) o un estado compuesto equivalente que impida combinaciones imposibles.
2. Hacer un solo GET de `user_turn`, pasar su `data` a una función pura de normalización y llamar a `user_buttons` únicamente cuando corresponda, conservando endpoint, método y contrato.
3. Reiniciar de forma atómica los datos incompatibles al cambiar entre normal, múltiple y libre; en particular, asegurar `isUserMultipleTurn=false` cuando `multiples` sea falso y limpiar datos múltiples cuando ya no apliquen.
4. Dar prioridad explícita al modo de pantalla, no a la presencia accidental de datos antiguos. La representación visual final debe permanecer igual.
5. Añadir cancelación o descarte de respuestas obsoletas en `useFocusEffect`, con cleanup al blur/unmount. Mantener dependencias completas y estables.
6. Consolidar la recarga por foco y por parámetros para que cada evento funcional produzca una sola carga. No cambiar la navegación ni los nombres `message/type`.
7. Introducir validación defensiva de la forma de respuesta antes de acceder a nodos anidados. Usar defaults únicamente donde reproduzcan el comportamiento actual; una forma desconocida debe entrar a un estado de error controlado y registrable sin datos sensibles.
8. Extraer funciones puras locales para: seleccionar el día, normalizar turnos, formatear `HH:MM`, calcular duración y construir acciones/motivos. Inicialmente deben vivir en el mismo módulo o en un archivo adyacente exclusivo de esta pantalla.
9. Evitar mutar el objeto recibido por Axios; construir copias normalizadas.
10. Usar tipos de estado consistentes desde la inicialización (`totalHours: "00:00"`, colección de turnos con una forma acordada).
11. Eliminar `currentDate`, `dayWeek`, imports no usados y el prop no consumido solo después de verificar que no existe dependencia indirecta.
12. Retirar los logs de payload/error de producción. Si se conserva diagnóstico, registrar únicamente códigos y contexto no sensible bajo `__DEV__`.
13. Mantener intactos el orden y los valores de acciones, incluidos `none`, hasta verificar el contrato de `ActionSigning`.
14. En `CardSelectTurn`, memoizar la normalización solo si se justifica; primero fijar una regla estable de ID basada en fixtures reales. Cambiar los checks a comparación explícita con `null` únicamente si las pruebas confirman IDs `0` válidos.
15. Extraer estilos inline sin alterar valores, acompañando el cambio con capturas antes/después en tamaños representativos.

## Cambios que NO deben hacerse ahora

- No modificar `user_turn`, `user_buttons`, sus URLs, métodos, parámetros, nombres, casing ni estructura de respuestas esperadas.
- No cambiar el POST `{ action, date, idHorarioM }` ni el significado del ID seleccionado.
- No cambiar la política de autenticación/logout. El logout ante 500 es cuestionable desde UX, pero es comportamiento existente y está expresamente fuera de alcance.
- No cambiar rutas, `navigation.navigate("Signing", ...)`, nombres de parámetros ni flujo posterior a la selección.
- No eliminar, renombrar, reordenar ni reinterpretar `Firma`, `Entrada`, `Salida`, `Pausa` o `Reanudacion`.
- No “corregir” turnos nocturnos, descansos, redondeos o zona horaria sin especificación funcional y casos aprobados; serían cambios de negocio.
- No reemplazar Axios, Day.js, RNEUI, `FlatList` o navegación, ni agregar dependencias.
- No convertir toda la pantalla a un patrón global, store, reducer compartido, hook global o nueva capa API. El refactor debe permanecer local.
- No tocar `ActionSigning`, hooks globales, autenticación, otras pantallas, configuración Expo/EAS ni dependencias.
- No cambiar significativamente el layout, colores, textos, alto del skeleton o comportamiento de scroll antes de contar con capturas comparativas.
- No combinar este refactor con nuevos requisitos funcionales.

## Plan por fases

### Fase 0 — Congelar el comportamiento y obtener fixtures

- Registrar, en un entorno de pruebas seguro, ejemplos anonimizados de respuestas para: normal sin marcas, normal con marcas, múltiple, libre sin marcas, libre con marcas, sin acciones, Pausa con motivos, respuesta parcial, HTTP 500 y error de red.
- Documentar el formato exacto de `date`, si `marks` es arreglo u objeto, la forma de `horario/horarios`, y el tipo/precedencia del ID múltiple.
- Capturar video o screenshots y secuencia de requests por escenario en Android/iOS SDK 55.
- Confirmar si dos GET consecutivos a `user_turn` son equivalentes y libres de efectos laterales.

**Salida:** línea base reproducible y matriz de contratos; ningún cambio productivo.

### Fase 1 — Estabilización mínima previa a cualquier refactor

- Retirar/encapsular logs sensibles.
- Añadir una protección local contra respuestas obsoletas y actualizaciones tras blur.
- Representar carga/error de forma explícita manteniendo el mismo skeleton durante carga y sin introducir un nuevo diseño.
- Corregir únicamente estados residuales demostrados por pruebas, sin cambiar reglas de negocio.

**Salida:** mismo UI y mismas llamadas funcionales, con menos carreras y exposición. Cada cambio debe ser pequeño y reversible.

### Fase 2 — Unificación de adquisición de datos

- Separar `fetchUserTurn` de `normalizeUserTurn`.
- Reutilizar la primera respuesta en vez de llamar de nuevo a `user_turn`, una vez comprobada la ausencia de efectos laterales.
- Coordinar `user_buttons` con la modalidad de turno y definir una sola transición a `ready`.
- Consolidar los disparadores de foco y parámetros para evitar solicitudes solapadas.

**Salida:** una lectura de turno por ciclo de carga y estados deterministas, sin modificar contratos.

### Fase 3 — Extracción de transformaciones puras

- Extraer y probar cálculo/formato de horas, selección del día, normalización de tramos y construcción de acciones/motivos.
- Mantener explícitamente los resultados actuales para fixtures válidos.
- Marcar como pendientes los casos de negocio no definidos (nocturnos, minutos 60, fecha/zona horaria); no cambiar su resultado sin aprobación.

**Salida:** lógica testeable y función principal más corta.

### Fase 4 — Simplificación de componentes y render

- Sustituir booleanos que pueden contradecirse por un modo local inequívoco o un estado compuesto.
- Derivar conteos de la colección normalizada cuando sea seguro.
- Mantener `CardSigning`, `CardSelectTurn` y `SkeletonSigning` con los mismos límites visuales y props funcionales.
- Limpiar código muerto y extraer estilos sin diferencias visuales.

**Salida:** render predecible y componentes con contratos claros.

### Fase 5 — Validación de regresión y despliegue gradual

- Ejecutar toda la matriz en development builds SDK 55 Android/iOS y luego en builds release internos.
- Comparar requests, payloads, navegación, acciones visibles, horarios y capturas con la línea base.
- Liberar de forma aislada, sin mezclar con otras migraciones o funcionalidades, para facilitar rollback.

## Checklist de pruebas antes/después

Cada caso debe ejecutarse antes y después, comparando respuesta visual, orden de solicitudes y payloads.

### Carga y ciclo de vida

- [ ] Al abrir `Signing`, aparece skeleton y luego la vista correcta sin parpadeo hacia otra modalidad.
- [ ] Volver a enfocar la pantalla actualiza exactamente una vez o el número acordado en la línea base.
- [ ] Cambiar `message/type` tras una acción actualiza sin solicitudes duplicadas ni datos anteriores.
- [ ] Salir rápidamente de la pantalla no produce warnings ni actualizaciones tardías.
- [ ] Repetir foco/blur con red lenta no permite que una respuesta vieja reemplace una nueva.
- [ ] Cambio de `apiUrl` en el contexto, si es una capacidad real, usa la URL vigente.

### Turno normal

- [ ] Sin marcas: muestra título, todos los tramos programados, conteo y total idénticos.
- [ ] Con marcas: muestra las marcas y `tiempo_trabajado` truncado a `HH:MM` como hoy.
- [ ] Conserva el día derivado de la fecha del servidor.
- [ ] Varios tramos conservan orden y formato.

### Turno múltiple

- [ ] Muestra todos los horarios y no muestra datos del turno anterior.
- [ ] Seleccionar/deseleccionar visualmente no cambia estilos ni comportamiento.
- [ ] Botón deshabilitado sin selección y carga bloqueada durante POST.
- [ ] El POST conserva exactamente endpoint y `{ action: "user_turn", date, idHorarioM }`.
- [ ] Success navega a `Signing` con los mismos parámetros y termina mostrando el turno elegido.
- [ ] `success: false`, HTTP 500 y error de red mantienen el comportamiento acordado y permiten recuperar la UI.
- [ ] IDs string, numérico y `0` se prueban contra fixtures reales antes de cambiar checks.
- [ ] Lista larga conserva scroll, selección y altura en distintos tamaños/orientaciones.

### Turno libre

- [ ] Sin marcas: muestra exactamente un tramo `--:-- a --:--`, conteo 1 y `00:00`.
- [ ] Con marcas: muestra marcas y tiempo trabajado recibidos.
- [ ] Están disponibles exactamente las acciones autorizadas por `user_buttons`.

### Acciones

- [ ] `Firma`, `Entrada`, `Salida`, `Pausa` y `Reanudacion` aparecen cuando el servidor las entrega.
- [ ] Se conserva el orden actual.
- [ ] Motivos de Pausa mantienen `{ id, label }` y no quedan motivos obsoletos.
- [ ] El fallback `none` conserva el comportamiento existente.
- [ ] Cada acción completa su navegación/retorno y refresca el estado correcto; `ActionSigning` se prueba como caja negra por estar fuera del alcance.

### Horas y fechas

- [ ] `08:05–17:30`, múltiples tramos y minutos fraccionarios producen el mismo resultado antes/después.
- [ ] Entradas faltantes conservan los defaults actuales donde estén definidos.
- [ ] Turno nocturno se documenta; no se modifica sin regla aprobada.
- [ ] Fecha ISO, fecha sin zona y cambio cercano a medianoche se contrastan con datos reales del backend.
- [ ] El encabezado usa la fecha del servidor y conserva locale/formato español.

### Errores, privacidad y SDK 55

- [ ] HTTP 500 conserva alerta y logout actuales hasta autorización explícita para cambiarlos.
- [ ] HTTP 4xx, timeout, offline, respuesta vacía y JSON parcial no bloquean indefinidamente ni provocan crash.
- [ ] Ningún log release contiene respuesta, horario, marcas, URL completa, cabeceras o identificadores.
- [ ] Pruebas en build release Android y iOS, con Nueva Arquitectura, sin warnings relevantes.
- [ ] Capturas antes/después no muestran cambios visuales significativos.
- [ ] No cambian endpoints, métodos, parámetros, navegación, hooks globales, configuración ni dependencias.

## Criterio de rollback

El refactor debe dividirse en commits pequeños por fase. Se revierte la fase completa —sin intentar parches acumulativos en producción— si ocurre cualquiera de estos casos:

- cambia el número, orden, método, URL o payload de solicitudes fuera de la optimización previamente aprobada del GET duplicado;
- desaparece o cambia una acción habilitada;
- se muestra una modalidad equivocada o datos de un turno/fecha anterior;
- difieren horarios, total, conteo, motivos o fecha respecto a la línea base para el mismo fixture;
- falla la selección múltiple o cambia el ID enviado;
- se altera navegación, logout o resultado de una acción;
- aparece crash, carga infinita, warning de actualización tras desmontaje o regresión específica de Android/iOS;
- existe una diferencia visual significativa no aprobada;
- no puede explicarse una discrepancia del backend o faltan fixtures para validar un caso crítico.

La reversión debe volver al último commit validado de la fase anterior. No se deben revertir ni sobrescribir cambios ajenos a esta pantalla. Para datos ya enviados no hay migración ni rollback de servidor, porque el plan no modifica contratos ni persistencia.

## Recomendación final

**Conviene realizar el refactor estructural después de publicar y estabilizar la versión SDK 55**, siempre que la matriz de pruebas previa no descubra un bloqueo de fichaje. La migración ya combina React 19.2, React Native 0.83 y Nueva Arquitectura; mezclarla con una reestructuración de la pantalla más crítica dificultaría atribuir regresiones y aumentaría el costo de rollback.

Antes de publicar SDK 55 solo se aconseja una fase de estabilización muy limitada si el calendario lo permite: eliminar logs sensibles, probar exhaustivamente las tres modalidades en builds release y, si las pruebas reproducen carreras o estado residual, aplicar únicamente el parche mínimo respaldado por un caso automatizado/manual. La eliminación del GET duplicado, la consolidación de efectos y la extracción de cálculos deben esperar a que exista una versión SDK 55 estable en producción y una línea base de respuestas reales anonimizadas.

En síntesis: **publicar primero con validación reforzada; refactorizar después por fases, salvo defectos bloqueantes demostrados**.
