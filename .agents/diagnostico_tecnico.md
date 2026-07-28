## Diagnóstico técnico

La documentación vigente es mayormente coherente con el repositorio, pero necesita algunos ajustes. El proyecto sigue siendo una línea base Expo SDK 52 y todavía no cumple el objetivo final de Android API 36 / Expo SDK 55.

No modifiqué código, dependencias, configuración ni documentación. Git quedó limpio.

### Línea base confirmada

- Rama: `upgrade/expo-sdk-55-api-36`.
- Commit: `f4bc7fb`.
- Worktree: limpio.
- Expo: `52.0.40`.
- React Native: `0.76.7`.
- React: `18.3.1`.
- Lockfile: `package-lock.json`, versión 3; npm es el gestor aparente.
- Node: `20.18.0`.
- Expo CLI local: `0.22.21`.
- EAS CLI local: no instalado.
- No existen directorios `android/` o `ios/`: el proyecto utiliza el flujo administrado/CNG.
- Inventario: 43 archivos JavaScript y 14 pantallas.
- La configuración Expo efectiva proviene de `app.json`; no existe `app.config.js` o equivalente.

La matriz oficial confirma que SDK 55 requiere Node 20.19.x como mínimo, React Native 0.83, React 19.2, API 36 y Xcode 26.2+. Por tanto, el Node actual deberá actualizarse antes de la etapa 54→55. [Matriz oficial de Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/)

## Hallazgos por severidad

### Bloqueantes para el objetivo SDK 55

1. **Android continúa limitado explícitamente a API 35**

   `expo-build-properties` define `targetSdkVersion: 35` en [app.json](D:/ActiveDirectory/Projects/control-laboral-app/app.json). Es correcto para la línea base SDK 52, pero incompatible con el objetivo API 36. No debe retirarse hasta llegar a la etapa SDK 55 y validar la configuración generada.

2. **Node no alcanza el mínimo de SDK 55**

   Está instalado Node `20.18.0`; SDK 55 requiere `20.19.x` o posterior.

3. **No existe evidencia de build base o validación funcional**

   La documentación reconoce este pendiente correctamente. Sin build SDK 52, pruebas físicas y checklist de humo, no existe una línea base reproducible para atribuir regresiones.

### Riesgo alto

1. **Archivo `.env` versionado por Git**

   `.env` está registrado en el repositorio y `.gitignore` solo excluye `.env*.local`. Expo detectó variables `EXPO_PUBLIC_*`, incluida una con nombre de clave API. No inspeccioné ni reproduje valores.

   Todo valor `EXPO_PUBLIC_*` debe considerarse público porque puede incorporarse al bundle. Aunque actualmente no aparecen referencias `process.env` en el código, conservar material sensible en un archivo versionado sigue siendo un riesgo.

2. **Contraseñas almacenadas directamente en AsyncStorage**

   El flujo “recordarme” guarda usuario y contraseña en texto accesible mediante AsyncStorage en `AuthProvider.js`. Esto no está destacado en `PROJECT_CONTEXT.md` ni en el checklist con la severidad necesaria. AsyncStorage no es almacenamiento seguro para credenciales.

3. **Logs con respuestas y errores de negocio**

   Se registran notificaciones completas, respuestas de API, datos de horarios y objetos de error. No observé impresión explícita del access token, pero los objetos registrados podrían contener datos personales o información de servidor.

4. **Cambio de API de `expo-file-system`**

   El proyecto usa intensivamente la API clásica:

   - `documentDirectory`
   - `downloadAsync`
   - `readAsStringAsync`
   - `StorageAccessFramework`
   - `writeAsStringAsync`

   SDK 55 separa claramente la API actual y la API legacy. La advertencia documental es correcta, pero debe enumerar estas llamadas reales como objetivo específico de revisión.

5. **Compatibilidad real de firma/WebView**

   `react-native-signature-canvas` sí se utiliza. `react-native-webview` no se importa directamente, pero es infraestructura de la firma. Este flujo debe probarse en Nueva Arquitectura, Android edge-to-edge y dispositivos físicos.

### Riesgo medio

1. **Dependencias declaradas sin uso directo observado**

   No encontré importaciones de:

   - `expo-linear-gradient`
   - `react-native-linear-gradient`
   - `react-native-dotenv`
   - `react-native-vector-icons`
   - `react-native-reanimated`
   - `react-native-safe-area-context`
   - `react-native-svg`
   - `https`

   Algunas pueden ser requisitos indirectos o de configuración, por lo que no corresponde eliminarlas automáticamente. Sin embargo, la documentación debería decir que ambos gradientes parecen no utilizarse, no solamente que “conviven”.

   `react-native-webview`, `react-native-screens` y `react-native-gesture-handler` tampoco se importan directamente, pero pueden ser dependencias de infraestructura o pares requeridos.

2. **Permisos iOS aparentemente no utilizados**

   Se declaran descripciones de cámara y fototeca, pero no encontré uso de cámara, image picker ni media library. Debe verificarse si son restos de una funcionalidad anterior.

3. **Modos de segundo plano duplicados y posiblemente excesivos**

   `fetch` y `remote-notification` aparecen dos veces cada uno. Además, no se observó implementación explícita de background fetch. La diferencia ya está bien documentada, pero debería clasificarse como limpieza obligatoria antes del candidato de tienda.

4. **Configuración de notificaciones antigua que requiere validación**

   `android.useNextNotificationsApi: true` permanece en `app.json`. Debe confirmarse en cada salto si Expo todavía la reconoce; no debería trasladarse mecánicamente hasta SDK 55.

5. **Arquitectura nueva**

   La documentación afirma correctamente que `newArchEnabled: true`. Sin embargo, en SDK 55 esa opción desaparece porque la arquitectura heredada deja de estar soportada. [Notas oficiales de SDK 55](https://expo.dev/changelog/sdk-55)

6. **Navegación de autenticación**

   El stack no autenticado contiene una ruta `Home`, aunque la raíz selecciona el stack según `isAuthenticated`. Esto no contradice el inventario general, pero sí merece documentarse como superficie de prueba de control de acceso.

### Riesgo bajo / deuda documental

- `package.json` declara versión `1.0.0`, mientras Expo declara `1.0.1`. La documentación ya menciona correctamente la versión Expo, pero convendría registrar ambas para evitar ambigüedad.
- No existe configuración explícita de `runtimeVersion` ni dependencia directa `expo-updates`. La política OTA está “pendiente” en los documentos, pero puede anotarse que no se observó configuración explícita.
- El script `lint` ejecuta `eslint . --fix`; no es adecuado para un diagnóstico estrictamente no modificador. No lo ejecuté.

## Capacidades y estructura confirmadas

La descripción funcional de `PROJECT_CONTEXT.md` coincide con el código:

- Stack de login, registro y recuperación.
- Tabs Inicio, Solicitudes y Más.
- Flujos de asistencia, calendario, solicitudes, documentos y notificaciones.
- Documentos está en el stack, no como tab.
- Ubicación en fichaje.
- Notificaciones y token Expo en dispositivo físico.
- Document picker, FileSystem y Sharing.
- Firma basada en WebView.
- NetInfo y AsyncStorage.
- Axios distribuido en numerosos componentes y pantallas.

También se confirmaron los perfiles EAS descritos: development y preview generan APK internos; production genera AAB y usa autoincremento; existe `submit.production`.

## Contraste con requisitos externos

Las fechas y requisitos de `STORE_REQUIREMENTS_2026.md` siguen vigentes:

- Google Play exige API 36 para nuevas apps y actualizaciones desde el 31 de agosto de 2026; contempla extensión hasta el 1 de noviembre. [Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es-419)
- Apple exige desde el 28 de abril de 2026 builds con Xcode 26 o posterior y SDK iOS 26 correspondiente. [Apple Developer](https://developer.apple.com/news/upcoming-requirements/)

## Ajustes documentales propuestos

Sin aplicarlos todavía:

1. Añadir a `PROJECT_CONTEXT.md`:

   - Node actual `20.18.0` y su incompatibilidad futura con SDK 55.
   - `.env` está versionado y contiene nombres `EXPO_PUBLIC_*`.
   - No se observó uso real de `react-native-dotenv`.
   - Ambos paquetes de gradiente parecen sin uso.
   - Contraseñas persistidas en AsyncStorage como riesgo alto.
   - Lista concreta de llamadas legacy de FileSystem.
   - Permisos iOS de cámara/fototeca sin consumidor observado.
   - Ausencia de configuración OTA/runtime explícita.
   - EAS CLI local no disponible.

2. Actualizar `TEST_CHECKLIST.md` con:

   - Verificación de que ninguna contraseña queda almacenada en AsyncStorage.
   - Auditoría de `.env` y variables `EXPO_PUBLIC_*`.
   - Prueba específica de FileSystem legacy durante cada salto.
   - Revisión de logs de respuestas, errores y notificaciones.
   - Confirmación de permisos iOS realmente utilizados.

3. Ajustar `MIGRATION_PLAN_SDK_52_TO_55.md`:

   - Incluir actualización controlada de Node antes de SDK 55.
   - Añadir una puerta para auditar variables públicas y archivos versionados.
   - Indicar que `newArchEnabled` deberá revisarse/eliminarse al llegar a SDK 55, donde deja de ser una opción válida.

4. Corregir la referencia original sobre dependencias:

   - Sustituir “conviven ambos gradientes” por “ambos están instalados, pero no se observan importaciones directas”.
   - Diferenciar dependencia directa de WebView frente a su uso indirecto por la firma.

## Validaciones no completadas

`expo install --check` intentó consultar la API de Expo y falló por restricción de red. No produjo cambios y Git permaneció limpio. No ejecuté:

- `expo-doctor`
- builds o bundler
- prebuild
- pruebas en dispositivo
- EAS project info
- lint con autofix

La ruta incremental 52→53→54→55 continúa siendo técnicamente razonable, pero la primera puerta debería incluir los ajustes documentales anteriores, una línea base funcional SDK 52 y la resolución planificada de Node, credenciales locales y almacenamiento inseguro.