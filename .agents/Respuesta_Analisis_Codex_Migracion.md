El documento es una buena especificación inicial: define alcance, restricciones, entregables y separa correctamente diagnóstico, migración y pruebas. Puede utilizarse como guía de trabajo, pero recomiendo corregir varios puntos antes de ejecutarlo.

## Observaciones principales

1. **Expo SDK 55 es el objetivo más razonable**

Expo SDK 55 cumple con:

- `compileSdkVersion 36`
- `targetSdkVersion 36`
- Xcode 26.2 o posterior
- React Native 0.83
- React 19.2
- iOS 15.1 o posterior

Expo SDK 56 también cumple, pero implica React Native 0.85, Xcode 26.4 e incrementa el mínimo de iOS a 16.4. Para una aplicación existente donde prima la estabilidad, SDK 55 ofrece menor impacto. [Matriz oficial de Expo SDK](https://docs.expo.dev/versions/v55.0.0/)

Además, SDK 55 elimina el soporte para la arquitectura heredada de React Native. Este riesgo crítico no aparece suficientemente destacado en el documento. [Notas de Expo SDK 55](https://expo.dev/sdk/55)

2. **Debe aclararse el requisito de Google Play**

La frase:

> “Google indica que el nivel actual más alto no compatible es Android 15 / API 35”

es confusa. API 35 no es actualmente “incompatible”. Desde el 31 de agosto de 2026, las aplicaciones nuevas y actualizaciones deberán apuntar a API 36. Las aplicaciones existentes deberán apuntar al menos a API 35 para continuar disponibles para nuevos usuarios de versiones superiores de Android. Google contempla una extensión hasta el 1 de noviembre de 2026. [Requisitos oficiales de Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=es-419)

Sugiero reemplazarla por:

> A partir del 31 de agosto de 2026, las aplicaciones nuevas y las actualizaciones deberán apuntar a Android 16/API 36. Hasta esa fecha, API 35 sigue siendo válido conforme al requisito anterior.

3. **El requisito de Apple es correcto, pero falta la fecha**

Desde el 28 de abril de 2026, las cargas a App Store Connect deben compilarse con Xcode 26 o posterior y un SDK de iOS/iPadOS 26. [Requisitos oficiales de Apple](https://developer.apple.com/news/upcoming-requirements/)

Conviene incluir esa fecha expresamente.

4. **No recomiendo saltar directamente de SDK 52 a SDK 55**

Aunque el destino final debe ser SDK 55, la ruta más segura es:

```text
SDK 52 → SDK 53 → SDK 54 → SDK 55
```

Cada etapa debería producir:

- Dependencias alineadas mediante `npx expo install --fix`.
- `npx expo-doctor` sin errores relevantes.
- Arranque correcto.
- Build de desarrollo.
- Prueba rápida de los flujos nativos críticos.
- Commit independiente.

No hace falta publicar cada versión intermedia. Las etapas sirven para aislar incompatibilidades y facilitar la reversión.

## Riesgos que faltan o necesitan mayor énfasis

- **Nueva arquitectura obligatoria en SDK 55:** revisar especialmente RNEUI RC, `react-native-signature-canvas`, `react-native-keyboard-aware-scroll-view`, calendarios y cualquier módulo nativo poco mantenido.
- **Cambio mayor de React 18 a React 19:** puede afectar librerías de interfaz que dependan de comportamientos antiguos.
- **Cambios de `expo-file-system`:** se debe localizar el uso real de la API, no limitarse a revisar la versión instalada.
- **Duplicación de gradientes:** aparecen `expo-linear-gradient` y `react-native-linear-gradient`. Hay que confirmar cuál se usa y evitar mantener ambas sin necesidad.
- **Paquete `https`:** normalmente no debe instalarse en React Native; Axios utiliza la implementación de red nativa. Debe investigarse su uso antes de retirarlo.
- **RNEUI en versiones release candidate:** merece clasificación de riesgo alto por antigüedad y compatibilidad con React 19/Nueva Arquitectura.
- **`react-native-vector-icons`:** revisar si puede utilizarse `@expo/vector-icons`, pero sin reemplazarlo automáticamente.
- **`react-native-dotenv`:** sus valores terminan dentro del bundle. No debe considerarse almacenamiento seguro para secretos.
- **Notificaciones:** deben probarse con development build o release en dispositivos físicos; Expo Go no basta para validar el flujo completo.
- **Permisos Android 13–16:** incluir notificaciones, ubicación precisa/aproximada, acceso en segundo plano si existe y permisos realmente generados en el manifiesto.
- **Android edge-to-edge:** validar visualmente barras, modales, teclado, Safe Area y firma WebView.
- **Privacy Manifest de Apple:** revisar APIs con motivo requerido, incluyendo las introducidas por dependencias.
- **Identidad de la aplicación:** confirmar que `android.package`, `ios.bundleIdentifier`, certificados, perfiles y proyecto EAS permanecen sin cambios.
- **Actualizaciones OTA:** si se usa `expo-updates`, revisar `runtimeVersion` para impedir que un bundle incompatible llegue al binario anterior.

## Mejoras al procedimiento

En la fase de preparación añadiría:

```bash
git status --short
git log -1 --oneline
node -v
npm -v
npx expo config --type public
npx expo-doctor
npx expo install --check
eas --version
eas project:info
```

También deben registrarse antes de migrar:

- Gestor de paquetes real y archivo lock.
- Versión de Node utilizada por desarrollo y EAS.
- Contenido de `app.json`/`app.config.js` y `eas.json`.
- Si existen carpetas `android` o `ios`.
- Si el proyecto usa CNG/prebuild o mantiene proyectos nativos manualmente.
- Identificadores Android/iOS y números actuales de versión/build.
- Perfiles EAS y comandos de compilación vigentes.
- Build funcional de referencia instalado en dispositivos.
- Resultado de una prueba funcional base.

No considero necesario copiar manualmente `package.json` y el lockfile si están correctamente registrados en Git y la rama está limpia. Un tag de referencia resulta más seguro:

```bash
git tag pre-expo-55-baseline
```

El comando `npm outdated` es informativo, pero no debe emplearse para actualizar indiscriminadamente: las versiones deben salir de la matriz compatible de Expo mediante `npx expo install`.

## Ajuste recomendado de las fases

Separaría la migración técnica del refactor:

1. Diagnóstico sin cambios.
2. Build base reproducible de SDK 52.
3. Migraciones incrementales 52→53→54→55.
4. Compatibilidad de Nueva Arquitectura y React 19.
5. Configuración Android API 36.
6. Configuración iOS/Xcode 26.
7. Pruebas funcionales y builds internos.
8. TestFlight y pista interna/cerrada de Google Play.
9. Refactors en otra rama y después de validar la migración.

También cambiaría el nombre fijo de rama por algo neutral, por ejemplo:

```text
upgrade/expo-sdk-55
```

El API 36 ya está implícito en SDK 55 y así el nombre sigue siendo válido si no hace falta configurar los SDK manualmente.

## Conclusión

La ruta más segura es migrar incrementalmente hasta **Expo SDK 55 estable**, sin refactorizar simultáneamente y con un punto de validación por cada SDK. SDK 56 no aporta una necesidad regulatoria adicional para este caso y aumenta el riesgo por React Native 0.85, Xcode 26.4 y el incremento del mínimo de iOS a 16.4.

El documento debería aprobarse después de:

- Corregir la explicación de API 35.
- Añadir la fecha del requisito de Apple.
- Convertir SDK 55 en objetivo principal y SDK 56 en evaluación futura.
- Añadir Nueva Arquitectura/React 19 como riesgo crítico.
- Exigir migración incremental y builds de control.
- Separar completamente migración y refactor.

El archivo está correctamente codificado en UTF-8. Los caracteres `Ã³`, `Ã¡`, etc. que aparecieron inicialmente son un problema de lectura de PowerShell sin `-Encoding UTF8`, no corrupción del documento. No realicé modificaciones al archivo ni al proyecto.