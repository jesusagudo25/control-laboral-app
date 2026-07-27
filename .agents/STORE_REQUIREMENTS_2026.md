# Requisitos de tiendas para 2026

Verificado el 2026-07-26. Antes de producir el build final se deben consultar
otra vez las fuentes oficiales, porque las políticas pueden cambiar.

## Google Play

Desde el **31 de agosto de 2026**:

- Las aplicaciones móviles nuevas y sus actualizaciones deben apuntar a
  Android 16, API level 36, o posterior.
- Las aplicaciones existentes deben apuntar al menos a Android 15, API level
  35, para seguir disponibles para nuevos usuarios en dispositivos con una
  versión de Android superior al target de la aplicación.
- Google permite solicitar una extensión hasta el 1 de noviembre de 2026
  cuando corresponda. La extensión es una contingencia, no el plan principal.

Fuente oficial:

- https://support.google.com/googleplay/android-developer/answer/11926878?hl=es-419

## App Store Connect

Desde el **28 de abril de 2026**, las aplicaciones cargadas a App Store
Connect deben compilarse con Xcode 26 o posterior y con el SDK de iOS/iPadOS
26 correspondiente.

Fuente oficial:

- https://developer.apple.com/news/upcoming-requirements/

## Compatibilidad del objetivo Expo

La matriz oficial de Expo indica para SDK 55:

- React Native 0.83.
- React 19.2.
- Node.js mínimo 20.19.x.
- Android mínimo 7.
- `compileSdkVersion` 36.
- `targetSdkVersion` 36.
- iOS mínimo 15.1.
- Xcode 26.2 o posterior.

SDK 55 ya no admite la arquitectura heredada. Este proyecto declara
`newArchEnabled: true`, pero las dependencias y los flujos deben probarse en
Nueva Arquitectura antes de considerar cumplida la migración.

Fuentes oficiales:

- https://docs.expo.dev/versions/v55.0.0/
- https://expo.dev/changelog/sdk-55

## Criterio de cumplimiento

No basta con editar `app.json`. Para declarar cumplimiento deben existir:

- Build Android release/AAB generado con API target 36 comprobada.
- Build iOS generado con imagen de Xcode 26 compatible.
- Validación de permisos, privacidad, firma y capacidades.
- Pruebas en dispositivos físicos.
- Validación en pista interna/cerrada de Google Play y TestFlight.

Cargar o publicar esos builds requiere autorización expresa.
