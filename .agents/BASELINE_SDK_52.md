# Línea base funcional — Expo SDK 52

Ejecución de referencia previa al salto 52 → 53. Se realizó sin modificar
código, dependencias, lockfile ni configuración. No se incluyen valores de
variables, secretos, credenciales, URLs privadas ni archivos de servicios.

## Identificación

- Fecha/hora: 2026-07-27 21:10:16 (UTC-05:00, America/Panama).
- Responsable: Codex.
- Rama: `upgrade/expo-sdk-55-api-36`.
- Commit: `412db77` (`docs: update agent baseline for Expo SDK 55 migration`).
- Git inicial: `M .gitignore`, cambio preexistente y preservado.
- SO: Microsoft Windows NT 10.0.26200.0.

El commit difiere de `f4bc7fb`, observado anteriormente. Antes de editar este
documento, los diagnósticos no habían modificado archivos rastreados.

## Herramientas y proyecto

- Node: `v20.18.0`.
- npm: `11.6.2`.
- Expo CLI local: `0.22.21`.
- EAS CLI global: `eas-cli/16.28.0` (avisó que existe una versión posterior;
  no se actualizó).
- Expo efectivo: SDK `52.0.0`; paquete `~52.0.40`.
- React Native: `0.76.7`; React: `18.3.1`.
- Gestor: npm; `package-lock.json` versión 3.
- Configuración: `app.json`; no hay `app.config.js` ni `app.config.ts`.
- Flujo: administrado/CNG; no existen `android/` ni `ios/`.
- Versiones: Expo/app `1.0.1`; package `1.0.0`.
- Identificadores: Android e iOS continúan como
  `com.jagudo25.controllaboralapp`.
- Proyecto EAS: el identificador configurado sigue presente en la
  configuración pública; no se confirmó remotamente.

Los wrappers PowerShell de npm/npx/eas fallaron porque la ejecución de
scripts `.ps1` está deshabilitada. Se usaron los `.cmd` equivalentes sin
cambiar esa política. Dentro del sandbox, Node falló con `EPERM` al resolver
`C:\Users\LEGION`; los diagnósticos autorizados se repitieron fuera del
sandbox.

## Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `M .gitignore` al inicio. |
| `git branch --show-current` | `upgrade/expo-sdk-55-api-36`. |
| `git log -1 --oneline` | `412db77 docs: update agent baseline for Expo SDK 55 migration`. |
| `node -v` | `v20.18.0`. |
| `npm.cmd -v` | `11.6.2`. |
| `npx.cmd --no-install expo --version` | `0.22.21`. |
| `npx.cmd --no-install expo config --type public` | Correcto: resolvió `app.json`, SDK 52.0.0, Android/iOS e identificadores esperados. |
| `npx.cmd expo-doctor` | 14/17 checks pasaron; 3 fallaron. |
| `npx.cmd --no-install expo install --check` | No ejecutado: bloqueado por la política de red del entorno. |
| `eas.cmd --version` | `eas-cli/16.28.0`. |
| `eas.cmd project:info` | No ejecutado: requiere consulta remota/autenticada. |
| `node .\node_modules\expo\bin\cli start --offline --port 8088` | Metro inició y el puerto quedó escuchando. |

`npx expo-doctor` descargó `expo-doctor@1.18.19` a la caché de npx porque no
estaba instalado localmente; no cambió las dependencias del proyecto. No se
ejecutaron `npm install`, `expo install --fix`, `prebuild` ni lint (el script
de lint usa `--fix`).

## Errores de Expo Doctor

1. `android.useNextNotificationsApi` es una propiedad adicional no admitida
   por el esquema Expo efectivo.
2. React Native Directory marca
   `react-native-keyboard-aware-scroll-view` como no probado en Nueva
   Arquitectura; ese paquete, `@rneui/base` y `@rneui/themed` aparecen como no
   mantenidos. No hay metadatos para `https` ni
   `react-native-vector-icons`.
3. Versiones no alineadas con lo esperado para SDK 52:
   `@react-native-async-storage/async-storage` instalado `2.1.2`, esperado
   `1.23.1`; Expo `52.0.40`, esperado `~52.0.49`; `expo-location` `18.0.8`,
   esperado `~18.0.10`; React Native `0.76.7`, esperado `0.76.9`.

## Corrección mínima de Puerta 0

Se corrigieron los puntos de alineación de SDK 52 sin migrar a SDK 53:

- Se eliminó `android.useNextNotificationsApi` de `app.json`.
- Mediante `npx expo install` se alinearon Expo a `~52.0.49`, React Native a
  `0.76.9`, `expo-location` a `~18.0.10` y AsyncStorage a `1.23.1`.

`react-native-keyboard-aware-scroll-view@0.9.5` se conserva sin reemplazo. Se
usa en:

- `src/screens/request/RequestCreate.js`, en el formulario de creación de
  solicitudes.
- `src/screens/document/Document.js`, en el modal de carga de documentos.

Riesgo pendiente: React Native Directory la marca como no probada con Nueva
Arquitectura y el proyecto tiene `newArchEnabled: true`. Por ello deben
probarse en Android e iOS el enfoque de campos, el desplazamiento automático,
la persistencia de toques y el cierre del teclado en esos dos flujos. No se
modificó su implementación durante Puerta 0.

## Estado del arranque

Metro inició en modo CI y offline, mostró `Starting Metro Bundler`, escuchó
en `http://localhost:8088` y se cerró únicamente el proceso creado tras 15
segundos. Expo indicó que omitió la validación de dependencias por estar
offline.

Esto valida carga de configuración y arranque del servidor de desarrollo. No
valida la generación/evaluación de un bundle de plataforma, instalación,
arranque en frío, navegación ni funciones de la aplicación.

## Build y dispositivos

- Build Android/iOS: no generado.
- Instalación limpia, arranque en frío y retorno desde segundo plano: no
  ejecutados.
- Emulador, simulador o dispositivo físico: no disponibles.
- Humo funcional de `TEST_CHECKLIST.md`: pendiente en su totalidad.

`CODEX_RULES.md` prohíbe crear builds y ejecutar `prebuild` sin autorización
específica. Por tanto, la ausencia de build es una limitación autorizativa,
no un fallo de compilación observado.

## Limitaciones de red

- El arranque se ejecutó deliberadamente con `--offline`.
- Expo Doctor produjo resultados completos.
- `expo install --check` fue bloqueado porque transmitiría metadatos de
  dependencias/configuración a Expo. No se eludió el control.
- `eas project:info` quedó pendiente por requerir comunicación remota.
- No hay evidencia local de versiones/build numbers de tiendas ni artefactos
  anteriores.

## Auditoría estática de riesgos conocidos

- [x] `.env` existe, pero `git ls-files` confirma que actualmente no está
  rastreado. El cambio preexistente de `.gitignore` agrega `.env` y `.env.*`
  (salvo `.env.example`), contradiciendo el diagnóstico anterior.
- [x] Nombres públicos inventariados sin valores:
  `EXPO_PUBLIC_API_KEY`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_APP_NAME`,
  `EXPO_PUBLIC_ENVIRONMENT` y `EXPO_PUBLIC_VERSION`. Deben tratarse como
  públicos e incorporables al bundle.
- [x] Riesgo alto confirmado: `src/context/AuthProvider.js` persiste y lee
  `lastPassword` directamente en AsyncStorage; Login la recupera para
  “recordarme”.
- [x] Se contaron 31 llamadas `console.log/warn/error/debug` en 14 archivos,
  incluidas áreas de API, autenticación, horarios/firma, documentos y
  notificaciones. Su contenido requiere revisión manual antes del candidato.
- [x] FileSystem clásico inventariado en `Document.js` y `DocumentDetail.js`:
  `documentDirectory`, `downloadAsync`, `readAsStringAsync`,
  `writeAsStringAsync` y `StorageAccessFramework`.
- [ ] FileSystem clásico probado en ejecución.
- [ ] Firma/WebView probado en dispositivo físico.
- [x] No se observaron consumidores de cámara, image picker o media library;
  los permisos iOS de cámara/fototeca siguen declarados.
- [x] `UIBackgroundModes` duplica `fetch` y `remote-notification`.
- [x] `android.useNextNotificationsApi` está presente y Doctor lo rechaza.
- [x] No se encontraron `runtimeVersion`, dependencia directa
  `expo-updates` ni referencias `process.env` en el código revisado.

Los `[x]` anteriores son evidencia estática, no pruebas funcionales.

## Validaciones pendientes

- `expo install --check` con acceso permitido a Expo.
- `eas project:info` y confirmación remota.
- Build base Android/iOS, previa autorización.
- Instalación y checklist en dispositivos físicos.
- API, autenticación, control de rutas, ubicación, notificaciones,
  documentos, FileSystem, firma/WebView y conectividad.
- Versiones/build numbers actuales en Google Play y App Store Connect.
- Política OTA real, si existe fuera de la configuración observada.

## Resultado de la puerta 0

- Estado: **rechazada/incompleta**.
- Evidencia positiva: configuración resuelta, Doctor ejecutado y Metro inicia
  offline en SDK 52.
- Bloqueos: 3 checks fallidos de Doctor, sin ejecución de la app, sin humo,
  sin build y sin pruebas físicas.
- Riesgos: configuración inválida, versiones desalineadas, librerías
  no mantenidas/sin metadatos, contraseña en AsyncStorage, logs
  potencialmente sensibles, permisos sin consumidor y FileSystem sin prueba.
- Autorización SDK 52 → 53: no otorgada. No avanzar hasta completar o aceptar
  explícitamente las excepciones de esta puerta.
