# Correcciones puntuales post migración Expo SDK 55

## Contexto

El proyecto **Control Laboral GM** fue migrado a **Expo SDK 55** y ya cuenta con build Android preview exitoso desde EAS. La app instala y arranca correctamente, pero durante pruebas manuales posteriores se detectaron inconsistencias visuales y funcionales en pantallas específicas.

El objetivo de esta tarea es corregir únicamente los problemas reportados, sin refactorizar la aplicación completa y sin modificar contratos de API.

---

## Alcance permitido

Corregir únicamente los siguientes puntos:

1. `Calendar.js`

   * La fecha del calendario se está mostrando en formato incorrecto.
   * Actualmente se observa algo similar a:
     `Sun Aug 02 2026 10:32:32 GMT-0500`
   * Debe mostrarse en un formato amigable para el usuario, preferiblemente en español.

2. `Document.js`

   * No permite subir un nuevo documento.
   * Revisar flujo de selección de archivo, modal, validaciones, permisos y envío.
   * Corregir sin cambiar endpoint ni payload salvo que se detecte un error estrictamente técnico posterior a SDK 55.

3. `DocumentDetail.js`

   * No permite descargar un documento existente.
   * Revisar uso de `expo-file-system`, `expo-sharing`, permisos y cambios introducidos por Expo SDK 55.
   * Mantener el flujo actual de descarga y visualización, corrigiendo solo lo necesario.

4. Pantalla de creación de solicitud

   * Los inputs tipo select no se ven correctamente.
   * Se observan valores con texto muy claro o poco visible.
   * Corregir estilos de los select/picker sin cambiar lógica, datos, opciones ni payload.

5. Pantalla de login / contraseña

   * Agregar un icono tipo “ojo” para mostrar/ocultar la contraseña escrita.
   * No cambiar autenticación.
   * No cambiar endpoint de login.
   * No cambiar validaciones actuales.
   * Solo permitir alternar `secureTextEntry`.

---

## Restricciones estrictas

* No cambiar endpoints.
* No cambiar nombres de parámetros enviados al backend.
* No cambiar payloads.
* No cambiar reglas de negocio.
* No cambiar navegación.
* No cambiar autenticación.
* No tocar lógica de fichaje que ya fue validada.
* No modificar `Signing.js` salvo que sea estrictamente necesario y se justifique.
* No tocar `package.json`, `package-lock.json`, `app.json`, `eas.json`, `.npmrc` ni configuración Expo/EAS.
* No ejecutar `npm audit fix`.
* No actualizar dependencias.
* No reemplazar librerías.
* No hacer refactor general.
* No rediseñar pantallas completas.
* No tocar iOS/Android nativo manualmente.
* Mantener compatibilidad con Expo SDK 55.

---

## Evidencia visual reportada

### 1. Calendario

En la pantalla `Calendario`, el encabezado del calendario muestra una fecha larga técnica:

```text
Sun Aug 02 2026 10:32:32 GMT-0500
```

Resultado esperado:

* Mostrar fecha en español o formato corto legible.
* Ejemplos aceptables:

  * `domingo, 2 de agosto de 2026`
  * `02 de agosto de 2026`
  * `Agosto 2026`

No debe mostrarse el objeto `Date` crudo convertido a string.

---

### 2. Documentos - subir documento

En `Document.js`, el modal “Nuevo Documento” abre correctamente, pero el flujo de selección/subida no está funcionando como se espera.

Validar:

* Botón `Seleccionar archivo`.
* Resultado de `DocumentPicker`.
* Nombre del archivo seleccionado.
* URI del archivo.
* Tipo MIME.
* Envío al backend.
* Estado de loading.
* Mensajes de error.
* Compatibilidad con Expo SDK 55.

Resultado esperado:

* El usuario puede seleccionar un archivo.
* La pantalla muestra el archivo seleccionado.
* El usuario puede guardar/subir el documento.
* Si ocurre error, debe mostrarse mensaje claro sin romper la pantalla.

---

### 3. Detalle de documento - descargar archivo

En `DocumentDetail.js`, el detalle del documento se muestra, pero el botón `Descargar archivo` no permite descargar correctamente.

Validar:

* Construcción de URL de descarga.
* Uso de `expo-file-system`.
* Uso de `expo-sharing`.
* Permisos o comportamiento de almacenamiento en Android moderno.
* Manejo de errores.
* Nombre final del archivo.
* Que el botón no quede sin respuesta visual.

Resultado esperado:

* El usuario puede descargar o compartir el archivo.
* Si no es posible guardar directamente por restricciones Android, debe usarse `Sharing.shareAsync` o flujo equivalente ya compatible.
* No cambiar endpoint de descarga.

---

### 4. Crear solicitud - selects poco visibles

En la pantalla `Crear Solicitud`, los campos select/picker se ven con texto muy claro sobre fondo claro. Esto dificulta leer opciones como:

* Tipo de solicitud
* Jornada de inicio
* Jornada de fin
* Revisor

Resultado esperado:

* El texto seleccionado debe ser legible.
* El placeholder debe distinguirse del valor seleccionado.
* El borde y colores deben mantenerse consistentes con el tema actual.
* No cambiar opciones ni datos enviados.

Corregir únicamente estilos.

---

### 5. Login - ver contraseña

Agregar un botón/icono de ojo en el input de contraseña.

Resultado esperado:

* Por defecto la contraseña se mantiene oculta.
* Al tocar el ojo, se muestra la contraseña.
* Al tocar nuevamente, se oculta.
* No cambiar endpoint, submit, validación ni almacenamiento actual.
* El cambio debe ser visual y local al input de contraseña.

---

## Plan de trabajo solicitado a Codex

### Fase 1 — Diagnóstico puntual

Antes de modificar código, revisar los archivos relacionados con cada incidencia:

* `Calendar.js`
* `Document.js`
* `DocumentDetail.js`
* Pantalla de creación de solicitud, probablemente `RequestCreate.js`
* Pantalla de login, probablemente dentro de `screens/auth`

Entregar un resumen corto indicando:

* Archivo exacto afectado.
* Causa probable.
* Cambio mínimo recomendado.
* Riesgo del cambio.
* Prueba manual necesaria.

No hacer refactor general.

---

### Fase 2 — Corrección mínima

Aplicar solo los cambios necesarios para corregir las incidencias reportadas.

Cada corrección debe ser pequeña y localizada.

Requisitos:

* Mantener el comportamiento actual.
* Mantener diseño general.
* No modificar contratos API.
* No cambiar datos enviados.
* No alterar flujos ya validados.
* Evitar cambios globales de tema salvo que sea imprescindible.

---

### Fase 3 — Validación

Después de aplicar cambios, ejecutar:

```bash
npx expo install --check
npx expo-doctor
git diff --check
```

Si es posible, levantar Metro:

```bash
npx expo start
```

No generar build EAS automáticamente salvo autorización posterior.

---

## Checklist de pruebas manuales

### Calendario

* [ ] Abrir pantalla Calendario.
* [ ] Confirmar que la fecha ya no se muestra como objeto Date crudo.
* [ ] Confirmar que el formato es legible en español.
* [ ] Cambiar de mes/día si aplica.
* [ ] Verificar que selección de día sigue funcionando.

### Documentos

* [ ] Abrir pantalla Documentos.
* [ ] Abrir modal Nuevo Documento.
* [ ] Seleccionar archivo.
* [ ] Confirmar que el archivo seleccionado se refleja visualmente.
* [ ] Escribir descripción.
* [ ] Guardar/subir documento.
* [ ] Confirmar mensaje de éxito o actualización de lista.
* [ ] Validar error controlado si falla la subida.

### Detalle de documento

* [ ] Abrir un documento existente.
* [ ] Presionar Descargar archivo.
* [ ] Confirmar que se descarga, abre o comparte correctamente.
* [ ] Confirmar que no queda el botón sin respuesta.
* [ ] Validar mensaje de error si el archivo no existe o falla descarga.

### Crear solicitud

* [ ] Abrir Crear Solicitud.
* [ ] Confirmar que los selects son legibles.
* [ ] Abrir cada select.
* [ ] Seleccionar opciones.
* [ ] Confirmar que los valores seleccionados se ven correctamente.
* [ ] Confirmar que crear solicitud mantiene el mismo flujo.

### Login

* [ ] Abrir login.
* [ ] Escribir contraseña.
* [ ] Confirmar que inicia oculta.
* [ ] Tocar icono de ojo.
* [ ] Confirmar que se muestra.
* [ ] Tocar nuevamente.
* [ ] Confirmar que se oculta.
* [ ] Confirmar que login sigue funcionando.

---

## Criterio de aceptación

La tarea se considera correcta si:

* `expo-doctor` queda en 19/19.
* No se cambian endpoints ni payloads.
* No se alteran flujos ya validados.
* Las cinco incidencias reportadas quedan corregidas.
* La app sigue iniciando correctamente.
* Login, fichaje, calendario, documentos y solicitudes siguen funcionando.
* Los cambios son localizados y fáciles de revisar.

---

## Criterio de rollback

Revertir la corrección si ocurre cualquiera de estos casos:

* Falla login.
* Falla fichaje.
* Falla navegación principal.
* Se rompe creación de solicitud.
* Se rompe carga de documentos.
* Cambia un endpoint o payload.
* Se modifica configuración del proyecto sin autorización.
* `expo-doctor` deja de pasar.
* Aparece un error nuevo en una pantalla no relacionada.

---

## Nota final

Esta tarea no es una refactorización general. Es una corrección puntual post migración SDK 55 basada en pruebas manuales reales.

El objetivo es dejar la app estable para continuar con:

1. Nuevo build Android preview.
2. Validación manual.
3. Build Android production AAB.
4. Coordinación con propietario de Google Play.
5. Validación iOS/TestFlight.
