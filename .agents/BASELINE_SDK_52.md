# Línea base funcional — Expo SDK 52

Plantilla para registrar una referencia reproducible antes del salto 52 → 53.
No marcar una prueba como aprobada sin evidencia. No incluir secretos, tokens,
credenciales, URLs privadas ni contenidos de archivos de servicios.

## Identificación

- Fecha/hora:
- Responsable:
- Rama:
- Commit:
- Estado de Git:
- Sistema operativo del entorno:

## Herramientas y proyecto

- Node:
- npm:
- Expo CLI local:
- EAS CLI:
- Expo SDK:
- React Native:
- React:
- Gestor de paquetes:
- Lockfile y versión:
- Fuente de configuración Expo:
- Flujo administrado/CNG:
- Carpetas `android/` o `ios/` presentes:
- Versión Expo (`app.json`):
- Versión package (`package.json`):
- `android.package`:
- `ios.bundleIdentifier`:
- Proyecto EAS confirmado sin cambios:

Valores observados en el diagnóstico del 2026-07-27, pendientes de reconfirmar:
rama `upgrade/expo-sdk-55-api-36`, commit `f4bc7fb`, Node `20.18.0`, Expo CLI
local `0.22.21`, EAS CLI no instalado, Expo `52.0.40`, React Native `0.76.7`,
React `18.3.1`, `package-lock.json` versión 3 y ausencia de carpetas nativas.

## Diagnóstico reproducible

Registrar comando, resultado, fecha y enlace/ruta de evidencia:

| Comprobación | Resultado | Evidencia/observación |
| --- | --- | --- |
| `git status --short` | Pendiente | |
| `git branch --show-current` | Pendiente | |
| `git log -1 --oneline` | Pendiente | |
| `node -v` | Pendiente | |
| `npm -v` | Pendiente | |
| `npx expo --version` | Pendiente | |
| `npx expo config --type public` | Pendiente | |
| `npx expo-doctor` | Pendiente | |
| `npx expo install --check` | Pendiente | |
| `eas --version` | Pendiente | |
| `eas project:info` | Pendiente | |

Nota inicial: durante el diagnóstico, `npx expo install --check` no pudo
consultar la API de Expo por restricción de red y no modificó archivos.
`expo-doctor`, bundler, builds, prebuild, pruebas físicas y EAS project info no
fueron ejecutados. El script `lint` usa `eslint . --fix`; no ejecutarlo como
comprobación de solo lectura.

## Build de referencia

- Tipo: Expo Go / development / preview / release:
- Perfil EAS:
- Plataforma:
- Identificador/URL interna del artefacto:
- Fecha:
- Resultado de instalación limpia:
- Resultado de arranque en frío:
- Resultado de retorno desde segundo plano:
- Logs o incidencias, sin datos sensibles:

## Dispositivos

| Plataforma | Modelo | Versión SO | Build | Resultado |
| --- | --- | --- | --- | --- |
| Android | | | | Pendiente |
| iOS | | | | Pendiente |

## Humo funcional

- [ ] Login válido e inválido.
- [ ] Persistencia y cierre de sesión.
- [ ] Registro y recuperación de contraseña.
- [ ] Control de acceso a rutas autenticadas.
- [ ] Tabs Inicio, Solicitudes y Más.
- [ ] Fichaje con ubicación.
- [ ] Calendario.
- [ ] Crear y consultar solicitudes.
- [ ] Listar, descargar, seleccionar, subir y compartir documentos.
- [ ] Firma: dibujar, limpiar y confirmar.
- [ ] Notificaciones en dispositivo físico: permiso, token, recepción y toque.
- [ ] Pérdida y recuperación de conectividad.
- [ ] Checklist completo en `TEST_CHECKLIST.md` adjunto o referenciado.

## Evidencia específica de riesgos conocidos

- [ ] `.env` versionado y nombres `EXPO_PUBLIC_*` auditados sin copiar valores.
- [ ] Persistencia de contraseña en AsyncStorage registrada como riesgo alto.
- [ ] Logs de respuestas, errores, horarios y notificaciones revisados.
- [ ] Llamadas clásicas de FileSystem probadas: `documentDirectory`,
  `downloadAsync`, `readAsStringAsync`, `writeAsStringAsync` y
  `StorageAccessFramework`.
- [ ] Firma/WebView probada en dispositivo físico.
- [ ] Permisos iOS de cámara/fototeca confrontados con uso real.
- [ ] Duplicados de `UIBackgroundModes` registrados.
- [ ] `android.useNextNotificationsApi` registrado para revisión por etapa.
- [ ] Ausencia/configuración de `runtimeVersion` y `expo-updates` registrada.

## Resultado de la puerta 0

- Estado: Pendiente / Aprobada / Rechazada / Aprobada con excepciones.
- Regresiones o bloqueos:
- Excepciones aceptadas:
- Evidencia principal:
- Riesgos pendientes:
- Aprobación y fecha para iniciar SDK 52 → 53:

