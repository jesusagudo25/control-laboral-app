# Validación manual Android preview — Expo SDK 55

## Datos de la prueba

- **Fecha de prueba:** 2026-08-01.
- **Rama:** `upgrade/expo-sdk-55-api-36`.
- **Build EAS usado:** perfil `preview`, Expo SDK `55.0.0`, versión
  `1.0.1 (23)`, build
  [3f1e0c14-59f5-4688-9a5a-25da70f90bce](https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/3f1e0c14-59f5-4688-9a5a-25da70f90bce).
- **Plataforma probada:** Android, APK de distribución interna instalado y
  ejecutado en el emulador `Pixel_8`.

## Resultado general

El build EAS `preview` fue instalado y ejecutado correctamente. La validación
manual inicial finalizó satisfactoriamente y no se observaron fallos
bloqueantes en los flujos cubiertos.

## Flujos probados

| Flujo | Resultado |
| --- | --- |
| Inicio de aplicación | Satisfactorio. La aplicación abre y completa el inicio correctamente. |
| Login | Satisfactorio. El acceso se completa correctamente. |
| Marcación de tiempo | Satisfactorio. La marcación se registra correctamente. |
| Finalización de tiempo | Satisfactorio. La finalización se completa correctamente. |
| Calendario | Satisfactorio. El calendario abre y responde correctamente durante la prueba. |
| Notificaciones | Satisfactorio. El flujo de notificaciones probado funciona correctamente. |
| Navegación general | Satisfactorio. La navegación entre las pantallas recorridas no presentó bloqueos. |

## Pendientes

- Ampliar la cobertura manual a escenarios alternos, errores y casos límite.
- Repetir la validación en dispositivos Android físicos y versiones de Android
  objetivo, registrando modelo y versión del sistema operativo.
- Ejecutar la validación equivalente en iOS cuando exista un build autorizado.
- Mantener pendientes las validaciones de build de producción y publicación;
  esta prueba no autoriza `eas submit` ni una liberación en tiendas.

## Recomendación de siguiente paso

Realizar una ronda de regresión más amplia en dispositivos Android físicos,
incluyendo permisos, comportamiento en segundo plano y casos de error. Si no
aparecen regresiones, preparar el build candidato de producción siguiendo el
proceso de autorización y validación de tiendas.
