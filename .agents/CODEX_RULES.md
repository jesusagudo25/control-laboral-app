# Reglas de trabajo para Codex

Estas reglas aplican a toda actividad relacionada con la migración.

## Alcance actual

- La autorización actual cubre documentación y diagnóstico.
- No modificar todavía código funcional, dependencias, lockfiles,
  configuración Expo/EAS ni archivos nativos.
- No crear builds ni ejecutar prebuild hasta recibir autorización.

## Antes de cada etapa

- Leer `README.md` y todos los documentos vigentes de `.agents`.
- Revisar `git status --short` y preservar cambios existentes del usuario.
- Confirmar SDK, rama, commit, Node, gestor de paquetes y lockfile.
- Consultar documentación oficial correspondiente al SDK de la etapa.
- Presentar diagnóstico, cambios propuestos, riesgos y plan de validación.
- Esperar autorización explícita para modificar.

## Cambios permitidos cuando se autorice la migración

- Actualizar un solo SDK por etapa: 52→53, 53→54 o 54→55.
- Usar versiones recomendadas por `npx expo install`.
- Hacer correcciones mínimas indispensables para compatibilidad.
- Actualizar documentación y evidencia de pruebas.

## Acciones prohibidas sin autorización específica

- Cambiar lógica de negocio, pantallas, navegación o contratos de API.
- Modificar credenciales, endpoints productivos o `google-services.json`.
- Cambiar `android.package`, `ios.bundleIdentifier` o el proyecto EAS.
- Sustituir o eliminar librerías por iniciativa propia.
- Ejecutar refactors, cambios masivos o actualizaciones indiscriminadas.
- Regenerar proyectos nativos mediante `expo prebuild`.
- Ejecutar `eas submit`, publicar, promover pistas o liberar en tiendas.
- Alterar certificados, perfiles, llaves de firma o secretos EAS.
- Usar comandos destructivos o descartar cambios del usuario.

## Manejo de hallazgos

- No corregir automáticamente un hallazgo fuera del alcance.
- Registrar archivo, evidencia, impacto y recomendación.
- Clasificarlo como bloqueante, alto, medio o bajo.
- Si contiene información sensible, describirla sin copiar su valor.
- Si una dependencia es incompatible, presentar alternativas y sus riesgos
  antes de reemplazarla.

## Disciplina de cada salto

Al terminar una etapa:

- Mostrar el diff relevante.
- Ejecutar Expo Doctor y la comprobación de dependencias.
- Ejecutar el checklist autorizado.
- Documentar errores, advertencias aceptadas y evidencia.
- No iniciar el SDK siguiente sin una puerta aprobada.

## Criterios de seguridad

- Priorizar estabilidad y reversibilidad.
- Tratar variables incluidas en el bundle como públicas.
- No imprimir tokens, contraseñas, cabeceras de autorización ni archivos de
  servicios.
- No asumir que Expo Go valida capacidades nativas.
- Probar notificaciones, ubicación, firma, archivos y builds release en
  dispositivos físicos.

## Comunicación

Cada entrega debe indicar:

- Qué se revisó o cambió.
- Qué archivos fueron afectados.
- Qué pruebas se ejecutaron y su resultado.
- Qué no se pudo verificar.
- Riesgos restantes.
- Autorización requerida para el siguiente paso.
