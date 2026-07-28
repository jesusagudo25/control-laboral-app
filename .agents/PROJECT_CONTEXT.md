# Contexto del proyecto

## Identidad y objetivo

- Aplicación: **Control Laboral GM**.
- Repositorio/package: `control-laboral-app`.
- Tecnología base: Expo y React Native.
- Prioridad: conservar el comportamiento funcional y obtener binarios
  publicables en Android e iOS durante 2026.
- Estrategia aprobada: migración incremental Expo SDK 52 → 53 → 54 → 55.

## Estado observado antes de modificar

Información tomada de `package.json`, `app.json`, `eas.json`, `src/` y del
entorno local durante el diagnóstico del 2026-07-27:

- Expo `~52.0.40`.
- React Native `0.76.7`.
- React `18.3.1`.
- Node.js `20.18.0`; es suficiente para la línea base actual, pero deberá
  actualizarse de forma controlada a `20.19.x` o posterior antes de SDK 55.
- Expo CLI local `0.22.21`.
- EAS CLI local no instalado.
- Rama observada: `upgrade/expo-sdk-55-api-36`.
- Commit observado: `f4bc7fb`.
- Inventario observado: 43 archivos JavaScript y 14 pantallas.
- Nueva Arquitectura activada mediante `newArchEnabled: true`.
- Versión declarada en Expo: `1.0.1`.
- Versión declarada en `package.json`: `1.0.0`; mantener diferenciadas ambas
  versiones hasta resolver la discrepancia de forma autorizada.
- `android.package`: `com.jagudo25.controllaboralapp`.
- `ios.bundleIdentifier`: `com.jagudo25.controllaboralapp`.
- Proyecto EAS ya vinculado; su identificador no debe cambiar.
- `expo-build-properties` fuerza actualmente Android
  `targetSdkVersion: 35`.
- No se observaron carpetas nativas `android/` o `ios/` en el inventario
  inicial; confirmar nuevamente antes de ejecutar `prebuild`.
- El gestor es npm según el lockfile observado: `package-lock.json` versión 3.
- La configuración Expo efectiva proviene de `app.json`; no se observó
  `app.config.js` ni equivalente.

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

El uso observado de `expo-file-system` corresponde a la API clásica e incluye
`documentDirectory`, `downloadAsync`, `readAsStringAsync`,
`StorageAccessFramework` y `writeAsStringAsync`. Estas llamadas deben
verificarse explícitamente en cada salto, porque SDK 55 diferencia la API
actual de la API legacy.

## Configuración de permisos observada

iOS declara descripciones para cámara, fototeca y ubicación durante el uso.
No se observó un consumidor de cámara, image picker o media library; confirmar
si cámara y fototeca son permisos heredados antes del candidato de tienda.
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

Hallazgos de uso y configuración que requieren tratamiento controlado:

- `expo-linear-gradient` y `react-native-linear-gradient` están instalados,
  pero no se observaron importaciones directas de ninguno.
- Está instalado el paquete `https`; confirmar si existe uso real.
- No se observaron importaciones directas de `react-native-dotenv`.
- `.env` está versionado y `.gitignore` solo excluye `.env*.local`. Contiene
  nombres `EXPO_PUBLIC_*`; no reproducir sus valores y tratar todo valor
  `EXPO_PUBLIC_*` como público porque puede incorporarse al bundle.
- No se observaron importaciones directas de `react-native-vector-icons`,
  `react-native-reanimated`, `react-native-safe-area-context`,
  `react-native-svg` ni `https`. No eliminarlas sin analizar requisitos
  indirectos, pares o configuración.
- `react-native-webview` no tiene importación directa observada, pero sirve de
  infraestructura a `react-native-signature-canvas`, que sí está en uso.
- Axios está distribuido en múltiples archivos; no centralizarlo durante la
  migración salvo corrección estrictamente necesaria y autorizada.

## Hallazgos de seguridad y observabilidad

- Riesgo alto: el flujo “recordarme” persiste usuario y contraseña directamente
  en AsyncStorage. AsyncStorage no es almacenamiento seguro para credenciales.
- Riesgo alto: existen logs de notificaciones completas, respuestas de API,
  datos de horarios y objetos de error. Aunque no se observó impresión
  explícita del access token, esos objetos pueden contener datos personales o
  información del servidor.
- No se observaron referencias `process.env` en el código durante el
  diagnóstico, pero esto no reduce el riesgo de mantener un `.env` versionado.
- El stack no autenticado contiene una ruta `Home`; probar que la selección del
  stack raíz impide acceso no autenticado.
- `android.useNextNotificationsApi: true` debe comprobarse en cada salto y no
  trasladarse mecánicamente hasta SDK 55.
- En SDK 55 la arquitectura heredada deja de estar soportada y
  `newArchEnabled` deja de ser una opción útil; revisar su eliminación en esa
  etapa según la configuración oficial.
- No se observó `runtimeVersion` explícito ni dependencia directa
  `expo-updates`; la política OTA explícita permanece pendiente.

## Línea base pendiente de ejecución

Antes del primer cambio de dependencias se debe registrar:

- Confirmar nuevamente commit, rama y estado de Git al iniciar la migración.
- Registrar npm y reconfirmar Node, Expo CLI y disponibilidad de EAS CLI.
- Reconfirmar `package-lock.json` versión 3.
- Resultado de `npx expo config --type public`.
- Resultado de `npx expo-doctor` y `npx expo install --check`.
- Build funcional de SDK 52 y resultado del checklist de humo.
- Versiones/build numbers actuales en las tiendas.
- Política actual de `runtimeVersion`/actualizaciones OTA, si se utiliza.

Durante el diagnóstico, `npx expo install --check` no pudo consultar la API de
Expo por restricción de red y no produjo cambios. No se ejecutaron
`expo-doctor`, bundler, builds, prebuild, pruebas en dispositivo, información
del proyecto EAS ni `lint`; el script `lint` aplica `--fix` y no es apropiado
para una revisión estrictamente no modificadora. Registrar la línea base real
en `BASELINE_SDK_52.md` antes del primer cambio de dependencias.
