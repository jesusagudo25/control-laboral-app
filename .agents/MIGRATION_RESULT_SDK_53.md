# Resultado de migración incremental — Expo SDK 53

Ejecución autorizada del salto exclusivo Expo SDK 52 → 53. No se avanzó a
SDK 54, no se ejecutaron refactors, `prebuild`, builds ni cambios de lógica.

## Identificación y precondiciones

- Fecha/hora de cierre: 2026-07-27 21:38:01 (UTC-05:00,
  America/Panama).
- Rama: `upgrade/expo-sdk-55-api-36`.
- Commit inicial: `3794df7` (`chore: align Expo SDK 52 baseline`).
- `git status --short` inicial: sin salida; árbol limpio.
- Node: `v20.18.0`.
- npm: `11.6.2`.
- Lockfile: `package-lock.json`, versión 3.
- Línea base: Expo `~52.0.49`, React Native `0.76.9`, React `18.3.1`.
- Se leyeron antes de modificar `README.md` y todos los documentos vigentes
  de `.agents`.
- Se consultaron la guía y las notas oficiales de SDK 53:
  https://expo.dev/changelog/sdk-53

La autorización expresa de esta ejecución habilitó únicamente la Fase 1 y
reemplazó para este salto el estado histórico de “no autorizado” de la línea
base. No autoriza SDK 54.

## Comandos y resultados

| Comando | Resultado |
| --- | --- |
| `npx.cmd expo install expo@^53.0.0 --fix` | La llamada superó el timeout del controlador, pero sus procesos terminaron la instalación. Se verificaron los archivos y procesos antes de continuar. |
| `npx.cmd expo install --fix` | Detectó el paquete pendiente, pero npm bloqueó la instalación por el peer antiguo de RNEUI frente a Safe Area Context 5. |
| `npx.cmd expo install eslint-config-expo@~9.2.0 -- --legacy-peer-deps` | Correcto; completó la versión recomendada sin sustituir ni eliminar RNEUI. |
| `npm.cmd install --package-lock-only --legacy-peer-deps` | Correcto; resincronizó el lockfile después de mantener `eslint-config-expo` solo en `devDependencies`. |
| `npx.cmd expo install --check` | Correcto: `Dependencies are up to date`. |
| `npx.cmd expo-doctor@latest` | 17/18 checks aprobados; un check de metadata de React Native Directory falló. |
| `npx.cmd expo config --type public` | Correcto; resolvió SDK `53.0.0` y conservó identificadores y proyecto EAS. |
| Metro offline, puerto 8088 | Correcto: `Starting Metro Bundler`, `Waiting on http://localhost:8088` y puerto escuchando. El proceso creado se cerró después de la prueba. |
| `git diff --check` | Sin errores de whitespace; solo avisos de conversión LF/CRLF de Git para archivos existentes. |

Metro se inició mediante el CLI local de Expo con red deshabilitada. El flag
`--non-interactive` produjo una advertencia porque ya no está soportado; no
impidió el arranque. Expo omitió la validación de dependencias durante ese
arranque por estar offline; dicha validación se ejecutó por separado y pasó.

## Cambios realizados

- Expo: `~52.0.49` → `~53.0.27`.
- React Native: `0.76.9` → `0.79.6`.
- React: `18.3.1` → `19.0.0`.
- Paquetes Expo y módulos nativos directos alineados a la matriz de SDK 53
  mediante Expo CLI.
- `eslint-config-expo`: `~8.0.1` → `~9.2.0`, conservado únicamente en
  `devDependencies`.
- Expo añadió el config plugin
  `@react-native-community/datetimepicker` a `app.json`, requerido por la
  versión alineada del módulo.
- `package-lock.json` fue regenerado por npm como parte de la instalación.

Archivos afectados:

- `package.json`
- `package-lock.json`
- `app.json`
- `.agents/MIGRATION_RESULT_SDK_53.md`

No cambiaron pantallas, navegación, servicios, lógica de negocio, endpoints,
credenciales, identificadores, proyecto EAS ni `google-services.json`. Se
conservó `targetSdkVersion: 35`; API 36 pertenece a una etapa posterior. No se
eliminó ninguna dependencia no relacionada.

## Expo Doctor y riesgos

El único check fallido de Doctor corresponde a React Native Directory:

- `react-native-keyboard-aware-scroll-view`: no probado con Nueva
  Arquitectura y no mantenido.
- `@rneui/base` y `@rneui/themed`: no mantenidos.
- Sin metadata: `eslint-config-expo`, `https` y
  `react-native-vector-icons`.

Riesgos y limitaciones:

1. **Alto — peer dependency de RNEUI.** `@rneui/base@4.0.0-rc.7` declara
   `react-native-safe-area-context ^3.1.9 || ^4.0.0`, mientras SDK 53 requiere
   `5.4.0`. npm necesitó `--legacy-peer-deps`. No se sustituyó RNEUI por estar
   fuera del alcance. Deben probarse visualmente sus componentes, safe areas,
   modales y formularios en Android e iOS.
2. **Alto — React 19 / React Native 0.79.** El cambio mayor puede revelar
   incompatibilidades de librerías antiguas. Metro inicia, pero no hubo
   dispositivo ni bundle de plataforma ejecutado.
3. **Medio — Node de validación.** Node `20.18.0` satisface la recomendación
   general de SDK 53 de usar Node 20, pero `expo-doctor@1.20.1` y una
   dependencia de ESLint advierten que sus versiones actuales requieren al
   menos Node `20.19.x`/`20.19.4`. Doctor sí completó sus checks. No se cambió
   Node porque no fue parte del salto autorizado.
4. **Alto — vulnerabilidades npm.** npm informó 49 vulnerabilidades
   transitivas: 1 baja, 9 moderadas, 38 altas y 1 crítica. No se ejecutó
   `npm audit fix` ni se actualizaron paquetes fuera de la matriz, para evitar
   cambios indiscriminados. Requieren análisis separado.
5. **Medio — `package.json:exports`.** React Native 0.79 habilita esta
   resolución de Metro por defecto. El servidor inicia, pero falta evaluar un
   bundle y todos los imports en ejecución.
6. **Pendiente funcional — capacidades nativas.** Continúan sin prueba en
   dispositivo ubicación, notificaciones, firma/WebView, documentos y las
   llamadas clásicas de FileSystem (`documentDirectory`, `downloadAsync`,
   `readAsStringAsync`, `writeAsStringAsync` y
   `StorageAccessFramework`).
7. **Riesgos preexistentes no corregidos.** Persistencia de contraseña en
   AsyncStorage, logs potencialmente sensibles, permisos sin consumidor,
   modos iOS duplicados y dependencias no mantenidas permanecen documentados.

## Estado de Puerta 1

- Alineación de dependencias: **aprobada**.
- Configuración Expo pública: **aprobada**.
- Arranque de Metro: **aprobado**.
- Expo Doctor: **con advertencia/no limpio** por metadata y mantenimiento de
  dependencias preexistentes; no hubo error de configuración o versión Expo.
- Pruebas en emulador/dispositivo, navegación y capacidades nativas:
  **pendientes** por falta de entorno de ejecución.
- Build interno: **no ejecutado**, no autorizado.
- Puerta funcional completa: **pendiente**.
- Autorización para SDK 54: **no otorgada**. No avanzar sin revisión del diff,
  pruebas disponibles y autorización expresa.
