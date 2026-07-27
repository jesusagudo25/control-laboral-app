# Contexto del proyecto

## Identidad y objetivo

- Aplicación: **Control Laboral GM**.
- Repositorio/package: `control-laboral-app`.
- Tecnología base: Expo y React Native.
- Prioridad: conservar el comportamiento funcional y obtener binarios
  publicables en Android e iOS durante 2026.
- Estrategia aprobada: migración incremental Expo SDK 52 → 53 → 54 → 55.

## Estado observado antes de modificar

Información tomada de `package.json`, `app.json`, `eas.json` y `src/` el
2026-07-26:

- Expo `~52.0.40`.
- React Native `0.76.7`.
- React `18.3.1`.
- Nueva Arquitectura activada mediante `newArchEnabled: true`.
- Versión declarada en Expo: `1.0.1`.
- `android.package`: `com.jagudo25.controllaboralapp`.
- `ios.bundleIdentifier`: `com.jagudo25.controllaboralapp`.
- Proyecto EAS ya vinculado; su identificador no debe cambiar.
- `expo-build-properties` fuerza actualmente Android
  `targetSdkVersion: 35`.
- No se observaron carpetas nativas `android/` o `ios/` en el inventario
  inicial; confirmar nuevamente antes de ejecutar `prebuild`.
- El gestor aparente es npm; confirmar el lockfile y usar un solo gestor.

No copiar credenciales, tokens, URLs privadas ni el contenido de
`google-services.json` a esta documentación.

## Perfiles EAS

`eas.json` define:

- `development`: development client, distribución interna, APK en Android.
- `preview`: distribución interna, APK en Android.
- `production`: distribución de tienda, AAB en Android y auto incremento.
- `submit.production`: existe, pero los envíos automáticos no están
  autorizados.

## Navegación y pantallas observadas

La aplicación usa React Navigation con stack de autenticación, tabs y stack
principal.

Autenticación:

- Login.
- Registro.
- Recuperación de contraseña.

Tabs principales:

- Inicio.
- Solicitudes.
- Más.

Flujos secundarios:

- Registro de asistencia y fichaje diario.
- Calendario.
- Crear y consultar solicitudes.
- Consultar y compartir documentos.
- Notificaciones.

La pantalla de documentos existe en el stack aunque no aparece como tab
principal en la configuración observada.

## Capacidades nativas y datos

- Ubicación: `expo-location`, utilizada durante acciones de fichaje.
- Notificaciones: `expo-notifications` y `expo-device`; listeners en la
  navegación y registro de token en dispositivo físico.
- Documentos: `expo-document-picker`.
- Archivos: `expo-file-system`.
- Compartir: `expo-sharing`.
- Firma: `react-native-signature-canvas`, dependiente de WebView.
- WebView: `react-native-webview`.
- Persistencia local: AsyncStorage para autenticación y otros datos.
- Estado de red: NetInfo.
- API: Axios usado en contextos, pantallas y componentes.

## Configuración de permisos observada

iOS declara descripciones para cámara, fototeca y ubicación durante el uso.
También declara modos de segundo plano para `fetch` y
`remote-notification`, actualmente duplicados en `UIBackgroundModes`.

Android referencia `google-services.json` y el plugin de notificaciones. Los
permisos finales deben verificarse sobre el manifiesto generado, no inferirse
únicamente desde `app.json`.

## Dependencias de atención prioritaria

Evaluar por compatibilidad real y por uso, sin sustituir automáticamente:

- `@rneui/base` y `@rneui/themed` en versiones release candidate.
- `react-native-signature-canvas`.
- `react-native-webview`.
- `react-native-keyboard-aware-scroll-view`.
- `react-native-calendars`.
- React Navigation.
- Reanimated, Gesture Handler, Screens y Safe Area Context.
- AsyncStorage, NetInfo, Picker y DateTimePicker.
- `expo-notifications`, `expo-location`, `expo-document-picker`,
  `expo-file-system` y `expo-sharing`.

Elementos que requieren diagnóstico:

- Conviven `expo-linear-gradient` y `react-native-linear-gradient`.
- Está instalado el paquete `https`; confirmar si existe uso real.
- `react-native-dotenv` no protege secretos: cualquier valor incorporado al
  bundle debe tratarse como público.
- Axios está distribuido en múltiples archivos; no centralizarlo durante la
  migración salvo corrección estrictamente necesaria y autorizada.

## Línea base pendiente

Antes del primer cambio de dependencias se debe registrar:

- Commit exacto de partida y estado de Git.
- Versiones de Node, npm, Expo CLI y EAS CLI.
- Lockfile vigente.
- Resultado de `npx expo config --type public`.
- Resultado de `npx expo-doctor` y `npx expo install --check`.
- Build funcional de SDK 52 y resultado del checklist de humo.
- Versiones/build numbers actuales en las tiendas.
- Política actual de `runtimeVersion`/actualizaciones OTA, si se utiliza.
