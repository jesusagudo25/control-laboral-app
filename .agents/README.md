# Base operativa de la migración

Este directorio reúne el contexto y las reglas de trabajo para migrar **Control
Laboral GM** desde Expo SDK 52 hasta Expo SDK 55.

## Documentos vigentes

- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md): estado técnico observado en el
  repositorio antes de iniciar la migración.
- [`STORE_REQUIREMENTS_2026.md`](./STORE_REQUIREMENTS_2026.md): requisitos de
  Google Play y App Store Connect verificados para 2026.
- [`MIGRATION_PLAN_SDK_52_TO_55.md`](./MIGRATION_PLAN_SDK_52_TO_55.md): plan
  incremental y puertas de avance.
- [`CODEX_RULES.md`](./CODEX_RULES.md): límites y reglas de ejecución para
  Codex.
- [`TEST_CHECKLIST.md`](./TEST_CHECKLIST.md): pruebas mínimas de regresión,
  plataforma y publicación.
- [`STORE_RELEASE_STATUS.md`](./STORE_RELEASE_STATUS.md): estado operativo
  actual y próximos pasos diferenciados para App Store Connect y Google Play.

## Documentos de referencia preservados

- `Migración Técnica Control Laboral GM.md`: solicitud técnica original.
- `Respuesta_Analisis_Codex_Migracion.md`: revisión inicial de la solicitud.

## Estado actual

- Fecha de creación de esta base: 2026-07-26.
- Última actualización del índice: 2026-08-01.
- Rama observada: `main`.
- Commit observado: `ee97cca` (`chore: refactor Signing component state
  management and cleanup`).
- Migración completada: Expo SDK 55; dependencias alineadas y Expo Doctor
  aprobado (19/19).
- Publicación: consultar `STORE_RELEASE_STATUS.md`; iOS ya está en producción y
  Android continúa en fase de primera publicación.

Antes de trabajar en la migración, leer todos los documentos vigentes de este
índice. Si la configuración real del repositorio contradice estos documentos,
detener el cambio, registrar la diferencia y actualizar primero la
documentación con autorización.
