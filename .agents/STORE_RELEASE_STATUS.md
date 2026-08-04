# Estado de publicación por plataforma — Control Laboral GM

## Referencia actual

- Fecha de actualización: 2026-08-03.
- Rama: `main`.
- Commit: `ee97cca` (`chore: refactor Signing component state management and cleanup`).
- Base técnica: Expo SDK 55.
- `npx expo install --check`: `Dependencies are up to date`.
- `npx expo-doctor`: 19/19 comprobaciones aprobadas.

El build Android `preview` anterior con SDK 55 se completó, instaló y arrancó
correctamente. Posteriormente se generó exitosamente desde `main` el AAB Android
de producción con `versionCode` 24. El artefacto está listo para Google Play,
pero su carga depende de que la consola permita crear la versión de producción.

## Estado de iOS / App Store Connect

- Control Laboral GM ya existe en producción para iOS.
- App Store Connect muestra la versión iOS 1.1.
- Estado visible: **Listo para distribución**.
- iOS no está en fase de primera publicación. El objetivo es mantener la
  continuidad productiva mediante una actualización de la aplicación existente.
- El 2026-08-03 se ejecutó desde la rama `main` el build iOS de producción con
  `eas build -p ios --profile production` y finalizó exitosamente.
- Las credenciales iOS están listas para `@jagudo25/control-laboral-app`.
- Bundle identifier: `com.jagudo25.controllaboralapp`.
- Push Notifications están configuradas.
- Build EAS:
  <https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/6cf43f87-ac96-4023-87b1-57f7617745ff>
- Artifact IPA:
  <https://expo.dev/artifacts/eas/lg4WXGVcm3VgxFriGiwm1FqPveXnljSE-Jx1LulPpyc.ipa>
- Estado actual: el IPA de producción fue generado correctamente y está
  pendiente de submit a App Store Connect/TestFlight.

### Próximos pasos de iOS

1. Realizar el submit del IPA a App Store Connect/TestFlight cuando exista la
   autorización correspondiente.
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
- El 2026-08-02 se ejecutó desde la rama `main` el build Android de producción
  con `eas build -p android --profile production` y finalizó exitosamente.
- EAS incrementó automáticamente el `versionCode` de 23 a 24.
- Build EAS:
  <https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/eaef5531-1ee1-4833-8bcf-d67e294a408f>
- Artifact AAB:
  <https://expo.dev/artifacts/eas/0kiCWVHlajRYt6oabR7jvVDLUgDnRYZHTZ2I7D6iue0.aab>
- Estado actual: el AAB de producción está listo para subir a Google Play
  cuando la consola permita crear una versión de producción.

### Próximos pasos de Android

1. Cuando Google Play Console lo permita, crear la versión de producción y
   subir el AAB generado con `versionCode` 24.
2. Completar las verificaciones de Google Play y la validación funcional que
   corresponda al artefacto de producción.
3. Coordinar con el propietario de la cuenta para que solicite el acceso a
   producción y, cuando proceda, realice o autorice la publicación inicial.
4. Conservar como evidencia los enlaces del build EAS y del artifact AAB.

## Diferencias entre plataformas

| Aspecto | iOS | Android |
| --- | --- | --- |
| Situación en tienda | Aplicación ya publicada | Producción aún inactiva |
| Etapa | Actualización de una app existente | Primera publicación |
| Estado visible | Versión 1.1, **Listo para distribución** | Prueba cerrada aparentemente cumplida; acceso a producción pendiente |
| Siguiente validación | Submit y validación en App Store Connect/TestFlight del IPA de producción generado | Subir y validar en Google Play el AAB de producción con `versionCode` 24 |
| Dependencia administrativa | Flujo normal de actualización | El propietario debe solicitar acceso a producción |

Los dos flujos no deben tratarse como equivalentes: iOS requiere preservar la
continuidad de una aplicación productiva, mientras Android todavía debe superar
el acceso y la publicación inicial en Google Play.

## Riesgos y pendientes

- El build Android `preview` previo no cubre el cambio reciente de `Signing.js`;
  ya existe un AAB de producción nuevo desde `main`, pero su validación en
  Google Play sigue pendiente.
- El IPA iOS de producción fue generado exitosamente, pero su submit y
  validación en App Store Connect/TestFlight siguen pendientes.
- La instalación y el arranque por sí solos no sustituyen la validación funcional
  completa en cada plataforma.
- Firma/WebView, permisos, notificaciones, ubicación, archivos/compartición,
  navegación y autenticación deben comprobarse según los checklist vigentes.
- El AAB Android de producción ya fue generado exitosamente; su carga y
  validación en Google Play siguen pendientes hasta que la consola permita crear
  una versión de producción.
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
