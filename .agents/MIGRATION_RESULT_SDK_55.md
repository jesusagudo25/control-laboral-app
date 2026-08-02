# Resultado de migración incremental — Expo SDK 55

Ejecución autorizada del salto exclusivo Expo SDK 54 → 55. No se realizaron
refactors, cambios de lógica, `prebuild`, envíos ni publicaciones. El build
Android `preview` se completó correctamente en EAS, el APK se descargó, se
instaló en el emulador `Pixel_8` y la aplicación inició correctamente.

## Identificación y precondiciones

- Fecha/hora de cierre: 2026-07-27 22:00:58 (UTC-05:00,
  America/Panama).
- Rama: `upgrade/expo-sdk-55-api-36`.
- Commit inicial: `e03e381` (`chore: migrate Expo SDK 53 to 54`).
- `git status --short` inicial: sin salida; árbol limpio.
- Node: `v22.23.1` (cumple el mínimo 20.19.x de SDK 55).
- npm: `10.9.8`.
- Expo CLI local antes del salto: `54.0.26`.
- EAS CLI global: `eas-cli/21.3.0`.
- Lockfile: `package-lock.json`, versión 3.
- Línea base: Expo `~54.0.36`, React Native `0.81.5`, React `19.1.0`.
- Flujo administrado/CNG: no existen carpetas `android/` ni `ios/`.
- Antes de modificar se leyeron `README.md`, todos los documentos vigentes de
  `.agents` y, expresamente, `MIGRATION_PLAN_SDK_52_TO_55.md`,
  `MIGRATION_RESULT_SDK_54.md` y `CODEX_RULES.md`.
- Se consultaron la guía, matriz y notas oficiales de SDK 55:
  https://docs.expo.dev/versions/v55.0.0/,
  https://expo.dev/changelog/sdk-55 y
  https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/.

Los wrappers PowerShell `.ps1` de npm, npx y EAS están bloqueados por la
política de ejecución del equipo. Se usaron sus ejecutables `.cmd` sin alterar
esa política.

## Comandos y resultados

| Comando | Resultado |
| --- | --- |
| `npx.cmd expo install expo@^55.0.0 --fix -- --legacy-peer-deps` | El primer intento no tuvo red. Repetido con acceso autorizado, instaló Expo 55 y alineó la matriz mediante npm. Se conservó RNEUI; `--legacy-peer-deps` sigue siendo necesario por sus peers antiguos. |
| `npx.cmd expo install --fix -- --legacy-peer-deps` | Correcto: `Dependencies are up to date`. |
| `npx.cmd expo install --check` | Correcto: `Dependencies are up to date`. |
| `npx.cmd expo-doctor@latest` | Correcto: 19/19 checks aprobados. |
| `npx.cmd expo config --type public` | Correcto: SDK `55.0.0`; identificadores Android/iOS y proyecto EAS conservados. |
| Metro offline, CI, puerto 8089 | Correcto por salida del CLI: `Starting Metro Bundler` y `Waiting on http://localhost:8089`. El proceso permaneció activo y se cerró después de la prueba. PowerShell no confirmó el socket de forma independiente. |
| `git diff --check` | Sin errores de whitespace; solo avisos de conversión LF/CRLF de Git. |

### Validación posterior para EAS Build (2026-08-01)

| Comando/acción | Resultado |
| --- | --- |
| `eas build -p android --profile preview` | Falló en `Install dependencies`: `npm ci --include=dev` no pudo resolver el peer dependency entre `@rneui/base@4.0.0-rc.7` y `react-native-safe-area-context@5.6.2`. No se publicó ni generó un build utilizable. |
| Crear `.npmrc` con `legacy-peer-deps=true` | Corrección mínima aplicada para que npm/EAS tolere el conflicto conocido de peers de RNEUI. Es una excepción técnica controlada, no una declaración de compatibilidad plena. |
| `npm ci` | Correcto localmente con la configuración de `.npmrc`. |
| `npx expo-doctor` | Detectó inicialmente React Native desalineado: esperado `0.83.10`, encontrado `0.83.6`. |
| `npx expo install react-native` | Correcto: React Native quedó alineado con la versión esperada por Expo SDK 55 (`0.83.10`). |
| `npx expo install --check` | Correcto: `Dependencies are up to date`. |
| `npx expo-doctor` | Correcto después de la alineación: 19/19 checks aprobados. |
| Reintento de `eas build -p android --profile preview` | Correcto. El paso de `npm ci` ya no falla y Expo SDK 55 compiló correctamente en EAS. Build: https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/3f1e0c14-59f5-4688-9a5a-25da70f90bce |
| Descarga e instalación del APK | Correcto. El APK de distribución interna se descargó desde EAS y se instaló correctamente en el emulador `Pixel_8`. |
| Arranque de la aplicación | Correcto en `Pixel_8`. Esto valida instalación y arranque, no el checklist funcional completo. |

No se ejecutó `npm audit fix`, no se refactorizó lógica, no se cambiaron
identificadores Android/iOS ni configuración de tienda. El build fue de
distribución interna: no se publicó en Google Play y no se ejecutó `submit`.

Metro informó que no pudo instalar la última versión de React Native DevTools
en la caché global de `dotslash` por acceso denegado y utilizó una versión
fallback. Esto no bloqueó el arranque del bundler. Al ejecutarse offline,
Metro omitió su validación de dependencias; esa validación se ejecutó por
separado y pasó.

## Cambios realizados

- Expo: `~54.0.36` → `~55.0.28`.
- React Native: `0.81.5` → `0.83.6` durante el salto inicial y posteriormente
  `0.83.10`, alineado mediante `npx expo install react-native`.
- React: `19.1.0` → `19.2.0`.
- Paquetes Expo y módulos nativos directos alineados a la matriz estable de
  SDK 55 mediante Expo CLI.
- Expo CLI local resultante: `55.0.34`.
- `newArchEnabled` retirado de `app.json`: SDK 55 ya no soporta la
  arquitectura heredada y eliminó esa opción.
- Override `targetSdkVersion: 35` retirado. `expo-build-properties` permanece
  configurado sin opciones y SDK 55 usa `compileSdkVersion` y
  `targetSdkVersion` 36 por defecto.
- Expo CLI añadió `expo-sharing` a la lista de config plugins al actualizar su
  paquete compatible.
- `package-lock.json` actualizado por npm como parte de la instalación.
- `.npmrc` contiene `legacy-peer-deps=true` como excepción técnica controlada
  para permitir que EAS Build ejecute `npm ci` ante el conflicto conocido de
  peers de RNEUI.

Archivos de producto afectados:

- `.npmrc`
- `app.json`
- `package.json`
- `package-lock.json`

Este documento añade:

- `.agents/MIGRATION_RESULT_SDK_55.md`

No cambiaron pantallas, navegación, servicios, lógica de negocio, endpoints,
credenciales, `android.package`, `ios.bundleIdentifier`, proyecto EAS,
`google-services.json` ni archivos nativos. No se eliminó ninguna dependencia
no relacionada y no se ejecutó `npm audit fix`.

## Configuración, validación y riesgos

1. **Build Android de SDK 55 aprobado en EAS.** EAS reportó SDK `55.0.0` y
   versión `1.0.1 (23)`. La compilación `preview` produjo un APK instalable.
   La inspección independiente de los valores nativos efectivos de
   `compileSdkVersion` y `targetSdkVersion` sigue pendiente.
2. **Alto — peer dependency de RNEUI.** `@rneui/base@4.0.0-rc.7` conserva
   peers antiguos (`react-native-safe-area-context ^3.1.9 || ^4.0.0`) frente a
   `react-native-safe-area-context@5.6.2` requerido por el stack actual. La
   excepción controlada de `.npmrc` permite instalar con npm, pero no elimina
   la deuda técnica ni el riesgo de ejecución. RNEUI no se sustituye en esta
   fase. Deben probarse visualmente safe areas, modales y formularios en
   Android e iOS.
3. **Alto — FileSystem clásico.** El código sigue usando
   `documentDirectory`, `downloadAsync`, `readAsStringAsync`,
   `writeAsStringAsync` y `StorageAccessFramework`. No hubo refactor
   autorizado ni prueba en dispositivo.
4. **Alto — RN 0.83 / React 19.2 / Reanimated 4.2.** Doctor, Metro y el build
   Android pasan; el APK se instaló y arrancó, pero no hubo prueba funcional
   completa.
5. **Medio — DevTools fallback.** Metro no pudo escribir en la caché global de
   `dotslash` y utilizó una versión fallback de React Native DevTools. El
   bundler continuó y quedó esperando conexiones.
6. **Alto — vulnerabilidades npm.** npm informó 20 vulnerabilidades
   transitivas: 1 baja, 11 moderadas, 7 altas y 1 crítica. No se ejecutó
   `npm audit fix` para evitar cambios indiscriminados.
7. **Pendiente funcional.** En dispositivo físico o emulador quedan por
   validar login, navegación, solicitudes, documentos, ubicación,
   firma/WebView, FileSystem/Sharing y notificaciones, además de conectividad,
   edge-to-edge y permisos.
8. **Riesgos preexistentes no corregidos.** Persistencia de contraseña en
   AsyncStorage, logs potencialmente sensibles, permisos sin consumidor,
   modos iOS duplicados y dependencias antiguas permanecen fuera del alcance
   de este salto.

## Estado de Puerta 3

- Alineación de dependencias: **aprobada**.
- Configuración Expo pública: **aprobada**.
- Expo Doctor: **aprobado**, 19/19.
- React Native: **alineado** con Expo SDK 55 en `0.83.10` mediante
  `npx expo install react-native`.
- Instalación limpia local con `npm ci`: **aprobada** usando la excepción
  controlada de `.npmrc`.
- Arranque de Metro: **aprobado por salida del CLI**, sin confirmación
  independiente del socket y con DevTools fallback.
- Identificadores Android/iOS y proyecto EAS: **conservados**.
- Configuración declarativa alineada con Android API 36: **aprobada** por
  matriz de SDK 55 y ausencia del override 35.
- Valores nativos efectivos de API 36: **pendientes de inspección
  independiente**; EAS reportó SDK `55.0.0` y el build compiló correctamente.
- Build Android `preview`: **aprobado**. `npm ci` ya no falla; build de
  distribución interna `1.0.1 (23)` finalizado correctamente con credenciales
  Android remotas de Expo.
- APK: **descargado e instalado correctamente** en el emulador `Pixel_8`.
- Arranque de la aplicación: **aprobado** en `Pixel_8`.
- Build iOS: **no ejecutado**.
- Checklist funcional en emulador/dispositivo físico: **pendiente** para
  login, navegación, solicitudes, documentos, ubicación, firma/WebView,
  FileSystem/Sharing y notificaciones.
- Publicación o envío: **no ejecutado**, no autorizado.
- Puerta funcional completa y candidato de tienda: **pendientes**.

Estado actual: SDK 55, Expo Doctor 19/19, dependencias actualizadas, React
Native alineado y build Android `preview` exitoso. El APK se descargó, instaló
y arrancó en `Pixel_8`. Quedan pendientes la inspección independiente de API
36 efectiva y el checklist funcional. No se ejecutó ni se autoriza por esta
validación `eas submit`, TestFlight o una publicación en Google Play.
