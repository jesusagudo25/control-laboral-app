# Estado de publicación por plataforma — Control Laboral GM

## Referencia actual

- Fecha de actualización: 2026-08-01.
- Rama: `main`.
- Commit: `ee97cca` (`chore: refactor Signing component state management and cleanup`).
- Base técnica: Expo SDK 55.
- `npx expo install --check`: `Dependencies are up to date`.
- `npx expo-doctor`: 19/19 comprobaciones aprobadas.

El build Android `preview` anterior con SDK 55 se completó, instaló y arrancó
correctamente. Después se aplicó una mejora puntual en `Signing.js`; por ello,
ese artefacto no representa exactamente el commit actual y debe generarse un
nuevo build `preview` desde `main` antes de avanzar hacia publicación.

## Estado de iOS / App Store Connect

- Control Laboral GM ya existe en producción para iOS.
- App Store Connect muestra la versión iOS 1.1.
- Estado visible: **Listo para distribución**.
- iOS no está en fase de primera publicación. El objetivo es mantener la
  continuidad productiva mediante una actualización de la aplicación existente.
- Todavía no se ha registrado en esta documentación un build iOS del commit
  actual compatible con SDK 55 ni su validación en TestFlight.

### Próximos pasos de iOS

1. Generar desde `main` un build iOS compatible con Expo SDK 55.
2. Validar instalación y flujos funcionales en TestFlight, con atención especial
   al flujo de firma afectado por la mejora reciente.
3. Confirmar permisos, capacidades, credenciales, metadatos y cumplimiento de
   los requisitos vigentes de App Store Connect.
4. Enviar la actualización de la app existente cuando la validación sea
   satisfactoria y exista autorización para publicar.

## Estado de Android / Google Play Console

- Control Laboral GM todavía no ha llegado a producción en Android.
- La sección de producción aparece inactiva.
- Los requisitos de prueba cerrada aparecen cumplidos visualmente en Google
  Play Console.
- El botón **Solicitar acceso a producción** aparece deshabilitado para el
  usuario actual.
- La consola informa: **Solo el propietario de la cuenta puede solicitar acceso
  a producción**.
- Android sí está en fase de primera publicación.
- Existe evidencia de un build Android `preview` previo con SDK 55 que compiló,
  se instaló y arrancó correctamente, pero fue generado antes del cambio puntual
  de `Signing.js` y no valida el commit actual.

### Próximos pasos de Android

1. Generar un nuevo build Android `preview` desde `main` en el commit actual.
2. Instalarlo y ejecutar la validación funcional, especialmente firma/WebView y
   los demás flujos críticos definidos en los checklist del proyecto.
3. Si el `preview` queda aprobado, generar el build `production` en formato AAB.
4. Subir el AAB al canal de prueba o de producción que corresponda y completar
   las verificaciones de Google Play.
5. Coordinar con el propietario de la cuenta para que solicite el acceso a
   producción y, cuando proceda, realice o autorice la publicación inicial.

## Diferencias entre plataformas

| Aspecto | iOS | Android |
| --- | --- | --- |
| Situación en tienda | Aplicación ya publicada | Producción aún inactiva |
| Etapa | Actualización de una app existente | Primera publicación |
| Estado visible | Versión 1.1, **Listo para distribución** | Prueba cerrada aparentemente cumplida; acceso a producción pendiente |
| Siguiente validación | Build SDK 55 en TestFlight | Nuevo `preview` desde `main`, seguido de AAB de producción |
| Dependencia administrativa | Flujo normal de actualización | El propietario debe solicitar acceso a producción |

Los dos flujos no deben tratarse como equivalentes: iOS requiere preservar la
continuidad de una aplicación productiva, mientras Android todavía debe superar
el acceso y la publicación inicial en Google Play.

## Riesgos y pendientes

- El cambio reciente de `Signing.js` no está cubierto por el build Android
  `preview` previo; hace falta un artefacto nuevo desde `main`.
- No consta todavía una validación iOS con SDK 55 en TestFlight.
- La instalación y el arranque por sí solos no sustituyen la validación funcional
  completa en cada plataforma.
- Firma/WebView, permisos, notificaciones, ubicación, archivos/compartición,
  navegación y autenticación deben comprobarse según los checklist vigentes.
- El AAB Android de producción y su validación en Google Play siguen pendientes.
- El avance de Android a producción depende de una acción administrativa que el
  usuario actual no puede ejecutar.
- Las políticas y requisitos de ambas tiendas pueden cambiar y deben volver a
  verificarse antes de generar o enviar los artefactos finales.

## Nota administrativa de Google Play

La solicitud de acceso a producción debe realizarla el **propietario de la
cuenta de Google Play Console**. El usuario actual no puede completar esa acción
mientras la consola mantenga el botón deshabilitado y la restricción indicada.

## Recomendación de estabilización

No mezclar nuevas mejoras funcionales con el proceso de publicación hasta
generar y validar los builds del commit actual por separado en Android e iOS.
Cualquier cambio adicional invalidaría parte de la evidencia y obligaría a
repetir las validaciones de la plataforma afectada.
