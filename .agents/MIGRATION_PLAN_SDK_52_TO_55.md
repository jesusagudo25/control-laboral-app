# Plan incremental Expo SDK 52 → 53 → 54 → 55

## Principios

- Un SDK por etapa.
- Un commit identificable por etapa aprobada.
- No mezclar actualización de SDK con refactors.
- Resolver primero incompatibilidades mediante versiones recomendadas por
  Expo.
- No usar `npm outdated` como lista automática de actualizaciones.
- No avanzar si falla una puerta de calidad.
- No publicar ni enviar builds sin autorización expresa.

## Fase 0 — Línea base SDK 52

Objetivo: disponer de una referencia reproducible antes de cambiar
dependencias.

Acciones de solo diagnóstico:

```bash
git status --short
git branch --show-current
git log -1 --oneline
node -v
npm -v
npx expo --version
npx expo config --type public
npx expo-doctor
npx expo install --check
eas --version
eas project:info
```

Registrar resultados sin incluir secretos. Confirmar lockfile, flujo CNG y
ausencia/presencia de `android/` e `ios/`.

Completar `.agents/BASELINE_SDK_52.md`. La evidencia del diagnóstico actual
confirma rama `upgrade/expo-sdk-55-api-36`, commit `f4bc7fb`, Node `20.18.0`,
Expo CLI local `0.22.21`, ausencia de EAS CLI local, `package-lock.json`
versión 3 y flujo administrado/CNG sin carpetas nativas. Estos datos deben
reconfirmarse al ejecutar la línea base; todavía no existe evidencia de build
funcional ni pruebas físicas.

Antes del primer cambio, auditar sin reproducir valores:

- que `.env` continúa versionado y qué nombres `EXPO_PUBLIC_*` llegarían al
  bundle;
- persistencia de contraseña del flujo “recordarme” en AsyncStorage;
- logs de respuestas, errores, horarios y notificaciones;
- permisos declarados de cámara/fototeca frente a capacidades realmente
  utilizadas.

Los hallazgos de seguridad no autorizan refactors dentro del salto. Deben
quedar documentados, con corrección separada o excepción explícita antes de un
candidato de tienda.

Puerta 0:

- Estado inicial documentado.
- SDK 52 inicia correctamente.
- Build base disponible o su imposibilidad documentada.
- Checklist de humo ejecutado.
- Auditoría de variables públicas, credenciales locales y logs registrada.
- Aprobación para iniciar cambios.

## Fase 1 — SDK 52 a SDK 53

1. Consultar la guía oficial de actualización y notas de SDK 53.
2. Cambiar únicamente Expo y dependencias requeridas por su matriz.
3. Ejecutar la alineación oficial:

   ```bash
   npx expo install --fix
   npx expo-doctor
   npx expo install --check
   ```

4. Revisar el diff de `package.json`, lockfile y configuración Expo.
5. Resolver errores mínimos de compatibilidad, documentando cada cambio.
6. Ejecutar pruebas de humo y, si está autorizado, builds internos.
7. Probar las llamadas observadas de FileSystem clásico:
   `documentDirectory`, `downloadAsync`, `readAsStringAsync`,
   `StorageAccessFramework` y `writeAsStringAsync`.
8. Confirmar si `android.useNextNotificationsApi` continúa reconocido y
   necesario; no conservarlo por inercia.

Puerta 1:

- Sin errores bloqueantes de Expo Doctor.
- Inicio y navegación básica correctos.
- Ubicación, notificaciones, documentos y firma probados al nivel disponible.
- Control de acceso verificado, incluida la ruta `Home` presente en el stack no
  autenticado.
- Commit de etapa y autorización para SDK 54.

## Fase 2 — SDK 53 a SDK 54

Repetir el procedimiento de alineación sin reutilizar supuestos de SDK 53.
Prestar atención a:

- React 19 y cambios asociados.
- Nueva Arquitectura.
- Comportamiento edge-to-edge de Android.
- APIs de archivos/documentos.
- Las llamadas concretas de FileSystem clásico inventariadas en la Fase 1.
- Compatibilidad de RNEUI, firma y WebView.

Puerta 2:

- Diagnóstico limpio o excepciones justificadas.
- Checklist de regresión aprobado.
- Build Android/iOS interno cuando esté autorizado.
- Commit de etapa y autorización para SDK 55.

## Fase 3 — SDK 54 a SDK 55

1. Actualizar de forma controlada Node.js `20.18.0` a `20.19.x` o posterior
   compatible, registrar la versión y repetir instalación/diagnóstico antes de
   modificar el SDK.
2. Consultar notas y guía oficial de SDK 55.
3. Alinear Expo, React Native 0.83, React 19.2 y paquetes relacionados usando
   las herramientas de Expo.
4. Confirmar que no existe dependencia de la arquitectura heredada.
   Revisar y retirar `newArchEnabled` cuando la configuración de SDK 55 así lo
   requiera, ya que la arquitectura heredada deja de estar soportada y esta
   opción deja de ser válida.
5. Revisar `expo-file-system`, notificaciones, ubicación, firma y WebView por
   cambios de API/comportamiento.
6. Eliminar el override Android API 35 solamente cuando la configuración
   efectiva de SDK 55 garantice API 36 y el diff haya sido aprobado.
7. Validar la configuración Expo generada.
8. Resolver o documentar explícitamente la API legacy de FileSystem, permisos
   sin consumidor, variables públicas, almacenamiento de credenciales y logs
   sensibles antes de declarar un candidato.

Puerta 3:

- `compileSdkVersion` y `targetSdkVersion` efectivos en 36.
- Build Android interno correcto en dispositivo físico.
- Build iOS con Xcode 26.2+ correcto en dispositivo físico.
- Checklist funcional completo sin regresiones bloqueantes.
- Sin cambio de identificadores, proyecto EAS, endpoints o credenciales.
- Sin contraseña persistida directamente en AsyncStorage y sin secretos
  asumidos como protegidos por `EXPO_PUBLIC_*`, salvo excepción de seguridad
  explícitamente aprobada.

## Fase 4 — Candidatos de tienda

Solo con autorización:

- Generar AAB de producción.
- Generar IPA de distribución.
- Validar AAB en pista interna/cerrada.
- Validar IPA mediante TestFlight.
- Completar requisitos de privacidad, permisos y metadatos.

La generación no autoriza `eas submit`, promoción a producción ni publicación.

## Fase 5 — Refactor posterior

Fuera del alcance de la migración inicial. Crear propuesta y rama separada
para:

- Centralización de Axios y errores.
- Limpieza de dependencias duplicadas o sin uso.
- Mejoras de almacenamiento, configuración y seguridad.
- Limpieza de permisos y configuración duplicada.

Cada refactor debe tener justificación, riesgo, pruebas y aprobación propios.

## Reversión

Cada etapa debe poder revertirse mediante Git. No usar comandos destructivos
ni reescribir la línea base. Si una etapa falla:

1. Detener el avance.
2. Conservar logs y diff.
3. Clasificar si el bloqueo es configuración, dependencia o código.
4. Proponer alternativas con impacto.
5. Esperar autorización antes de sustituir librerías o ampliar alcance.
