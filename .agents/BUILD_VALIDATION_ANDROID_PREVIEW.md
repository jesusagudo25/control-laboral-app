# Validación de build Android preview — Expo SDK 55

## Resultado

El build Android con perfil `preview` finalizó correctamente en EAS. El paso
de instalación de dependencias ya no falla en `npm ci` y Expo SDK 55 compila
correctamente en EAS.

- Fecha de registro: 2026-08-01.
- Comando: `eas build -p android --profile preview`.
- Perfil: `preview`.
- Tipo: Android internal distribution build.
- Build: https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/3f1e0c14-59f5-4688-9a5a-25da70f90bce
- SDK reportado por EAS: `55.0.0`.
- Versión: `1.0.1 (23)`.
- Credenciales: credenciales Android remotas de Expo.
- Artefacto: APK descargado correctamente desde EAS.
- Instalación: correcta en el emulador `Pixel_8`.
- Arranque: correcto en el emulador `Pixel_8`.

## Alcance de la validación

Esta evidencia aprueba la instalación de dependencias en EAS, la compilación
Android de SDK 55, la generación y descarga del APK, su instalación y el
arranque inicial. El intento anterior que falló durante `npm ci` queda superado
por este build exitoso.

No se hicieron cambios funcionales, no se publicó en Google Play y no se
ejecutó `eas submit`.

## Validación pendiente

La instalación y el arranque no sustituyen la prueba funcional. Queda
pendiente ejecutar y registrar, en dispositivo físico o emulador:

- Login y persistencia/cierre de sesión.
- Navegación principal y rutas protegidas.
- Solicitudes.
- Documentos.
- Ubicación y permisos.
- Firma/WebView.
- FileSystem/Sharing, incluidas descarga, lectura, escritura y compartición.
- Notificaciones, preferentemente con las pruebas que requieren dispositivo
  físico.

También queda pendiente confirmar de forma independiente los valores nativos
efectivos de `compileSdkVersion` y `targetSdkVersion` 36 en el artefacto o en
un proyecto nativo generado.
