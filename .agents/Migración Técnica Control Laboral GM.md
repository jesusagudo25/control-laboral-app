# Control Laboral GM - Análisis y migración técnica Expo / Android 16 / iOS 26

## Objetivo

Analizar y preparar una nueva versión del aplicativo móvil **Control Laboral GM** sin afectar el funcionamiento actual, actualizando el stack Expo/React Native para cumplir con los requisitos actuales de Google Play y App Store.

La prioridad es dejar el aplicativo funcional, estable y publicable en Android e iOS.

---

## Contexto actual

La app ya existe y actualmente se encuentra publicada en iOS. En Android está en proceso de acceso a producción mediante Google Play Console.

Google Play Console está mostrando advertencia de política:

* La aplicación debe estar orientada a **Android 16 / API level 36** o superior.
* El target actual detectado por Google Play no cumple el requisito.
* Google indica que el nivel actual más alto no compatible es Android 15 / API 35.
* A partir del 31 de agosto de 2026 no se podrán publicar actualizaciones si no se cumple este requisito.

También se debe considerar Apple:

* Las nuevas cargas a App Store Connect deben compilarse con Xcode 26 o superior y SDK iOS/iPadOS 26 o posterior.

---

## Stack actual del proyecto

El proyecto usa Expo SDK 52 aproximadamente:

```json
{
  "name": "control-laboral-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --fix"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.1.2",
    "@react-native-community/datetimepicker": "8.2.0",
    "@react-native-community/netinfo": "^11.4.1",
    "@react-native-picker/picker": "2.9.0",
    "@react-navigation/bottom-tabs": "^7.3.3",
    "@react-navigation/native": "^7.0.18",
    "@react-navigation/stack": "^7.2.3",
    "@rneui/base": "^4.0.0-rc.7",
    "@rneui/themed": "^4.0.0-rc.8",
    "axios": "^1.8.4",
    "dayjs": "^1.11.13",
    "expo": "~52.0.40",
    "expo-constants": "~17.0.8",
    "expo-device": "~7.0.3",
    "expo-document-picker": "~13.0.3",
    "expo-file-system": "~18.0.12",
    "expo-linear-gradient": "~14.0.2",
    "expo-location": "^18.0.8",
    "expo-notifications": "~0.29.14",
    "expo-sharing": "~13.0.1",
    "expo-status-bar": "~2.0.1",
    "https": "^1.0.0",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "react-native-calendars": "^1.1310.0",
    "react-native-dotenv": "^3.4.11",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-keyboard-aware-scroll-view": "^0.9.5",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-signature-canvas": "^4.7.2",
    "react-native-svg": "15.8.0",
    "react-native-vector-icons": "^10.2.0",
    "react-native-webview": "13.12.5",
    "expo-build-properties": "~0.13.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~8.0.1",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.4",
    "prettier": "^3.5.3"
  },
  "private": true
}
```

---

## Requerimiento principal

Migrar el proyecto a una versión de Expo compatible con:

* Android targetSdkVersion 36.
* Android compileSdkVersion 36.
* Builds publicables en Google Play.
* Builds publicables en App Store Connect usando Xcode 26 / iOS SDK 26.
* Mantener compatibilidad funcional con la versión actual del aplicativo.
* No introducir refactors grandes sin validación previa.

---

## Versión objetivo recomendada

Evaluar primero migración a:

* **Expo SDK 55** como base mínima segura para Android API 36 y Xcode 26.
* Evaluar luego si conviene subir a **Expo SDK 56**, pero solo si el análisis de dependencias no muestra riesgos altos.

No hacer salto directo sin revisar breaking changes, dependencias nativas, compatibilidad de React Native y flujo de build.

---

## Trabajo solicitado a Codex

### 1. Diagnóstico inicial

Revisar el proyecto completo y generar un informe con:

* Estructura del proyecto.
* Pantallas principales.
* Navegación.
* Servicios/API usados.
* Variables de entorno.
* Configuración de Expo.
* Configuración de Android/iOS.
* Dependencias críticas.
* Dependencias posiblemente obsoletas o conflictivas.
* Uso de permisos: ubicación, notificaciones, archivos, documentos, firma, webview.
* Riesgos de migración.

No modificar código en esta primera etapa salvo que se solicite explícitamente.

---

### 2. Validación de compatibilidad Expo

Revisar la compatibilidad de las dependencias actuales con Expo SDK 55.

Especial atención a:

* `expo-location`
* `expo-notifications`
* `expo-document-picker`
* `expo-file-system`
* `expo-sharing`
* `expo-build-properties`
* `react-native-signature-canvas`
* `react-native-webview`
* `react-native-vector-icons`
* `react-native-linear-gradient`
* `@rneui/base`
* `@rneui/themed`
* `react-native-calendars`
* React Navigation
* AsyncStorage
* NetInfo
* Picker
* DateTimePicker
* Reanimated
* Gesture Handler
* Safe Area Context
* Screens

Identificar si alguna dependencia debe reemplazarse por alternativa Expo-compatible.

---

### 3. Plan de migración seguro

Proponer un plan por fases:

#### Fase A - Preparación

* Crear rama `upgrade/expo-sdk-55-api-36`.
* Confirmar estado limpio de Git.
* Respaldar `package.json`, `package-lock.json` o `yarn.lock`.
* Documentar versión actual funcional.
* Identificar comandos actuales de build.

#### Fase B - Actualización Expo

* Actualizar Expo SDK.
* Actualizar paquetes Expo compatibles.
* Actualizar React y React Native según versión requerida por Expo.
* Ejecutar `npx expo install --fix` si aplica.
* Revisar y ajustar `app.json` o `app.config.js`.

#### Fase C - Android

Validar:

* `targetSdkVersion 36`
* `compileSdkVersion 36`
* `minSdkVersion` razonable
* permisos Android
* edge-to-edge Android 15/16 si aplica
* notificaciones
* ubicación
* file/document picker
* firma
* webview
* build AAB con EAS

#### Fase D - iOS

Validar:

* Build con Xcode 26 o imagen EAS compatible.
* iOS deployment target compatible.
* permisos en `Info.plist`.
* uso de ubicación.
* uso de documentos/archivos.
* notificaciones.
* firma.
* TestFlight.

#### Fase E - Pruebas funcionales

Crear checklist de pruebas:

* Inicio de app.
* Login o acceso.
* Navegación principal.
* Consulta de información.
* Formularios.
* Firma digital si aplica.
* Documentos/archivos si aplica.
* Ubicación si aplica.
* Notificaciones si aplica.
* Comportamiento sin internet.
* Comportamiento con internet lento.
* Android físico.
* iPhone físico.
* Build release.

---

### 4. Refactor controlado

Evaluar oportunidades de mejora sin cambiar comportamiento:

* Centralizar cliente Axios.
* Centralizar manejo de errores.
* Centralizar configuración de API/base URLs.
* Mejorar manejo de loading states.
* Mejorar manejo offline si existe.
* Revisar AsyncStorage.
* Revisar validaciones.
* Revisar repetición de código en pantallas.
* Revisar navegación y estructura de carpetas.
* Revisar estilos duplicados.
* Revisar logs sensibles.
* Revisar seguridad de variables de entorno.
* Revisar permisos no utilizados.

No aplicar refactors grandes sin presentar primero propuesta y riesgos.

---

### 5. Resultado esperado

Entregar:

1. Informe técnico del estado actual.
2. Lista de riesgos de migración.
3. Plan de actualización recomendado.
4. Cambios propuestos en `package.json`.
5. Cambios requeridos en configuración Expo.
6. Checklist de pruebas Android/iOS.
7. Comandos exactos para instalar, probar y compilar.
8. Recomendación final: Expo SDK 55 o SDK 56.

---

## Restricciones

* No romper la versión funcional actual.
* No cambiar lógica de negocio sin autorización.
* No eliminar pantallas ni flujos existentes.
* No reemplazar librerías sin justificar.
* No modificar credenciales ni endpoints productivos.
* No publicar builds automáticamente.
* No hacer cambios masivos sin explicación.
* Priorizar estabilidad sobre modernización agresiva.

---

## Comandos iniciales sugeridos

Antes de modificar:

```bash
git status
git branch
node -v
npm -v
npx expo --version
npx expo-doctor
npm outdated
```

Luego generar diagnóstico y esperar confirmación antes de aplicar cambios.

---

## Pregunta final que debe responder Codex

¿Cuál es la ruta más segura para llevar este proyecto desde Expo SDK 52 a una versión compatible con Android API 36 y App Store Connect 2026, minimizando riesgos y manteniendo estable el aplicativo Control Laboral GM?
