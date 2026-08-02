# Checklist de pruebas

Usar una copia por plataforma, versión de SDK y tipo de build. Registrar
dispositivo, versión de SO, perfil EAS, commit y resultado.

Estados sugeridos: `[ ]` pendiente, `[x]` aprobado, `[!]` falló, `[-]` no
aplica.

## Estado SDK 55 después del build Android preview (2026-08-01)

- [x] Proyecto en Expo SDK 55.
- [x] `.npmrc` contiene `legacy-peer-deps=true` como excepción técnica
  controlada para que EAS ejecute `npm ci` pese al conflicto conocido entre
  RNEUI y `react-native-safe-area-context@5.6.2`.
- [x] `npm ci` finalizó correctamente de forma local.
- [x] React Native alineado en `0.83.10` mediante
  `npx expo install react-native`.
- [x] `npx expo install --check`: `Dependencies are up to date`.
- [x] `npx expo-doctor`: 19/19 checks passed.
- [!] Primer `eas build -p android --profile preview`: falló en
  `Install dependencies` por el conflicto de peer dependencies de RNEUI.
- [x] Reintento de `eas build -p android --profile preview`: finalizó
  correctamente; `npm ci` ya no falla y SDK 55 compila en EAS.
- [x] EAS reportó SDK `55.0.0` y versión `1.0.1 (23)`.
- [x] Build Android de distribución interna generado con credenciales remotas
  de Expo: https://expo.dev/accounts/jagudo25/projects/control-laboral-app/builds/3f1e0c14-59f5-4688-9a5a-25da70f90bce
- [x] APK descargado correctamente desde EAS.
- [x] APK instalado correctamente en el emulador `Pixel_8`.
- [x] Aplicación iniciada correctamente en `Pixel_8`.
- [ ] Confirmar `targetSdkVersion` y `compileSdkVersion` efectivos en 36 con
  el build generado.
- [ ] Ejecutar y registrar el checklist funcional completo en dispositivo
  físico o emulador: login, navegación, solicitudes, documentos, ubicación,
  firma/WebView, FileSystem/Sharing y notificaciones.
- [-] Publicación en Google Play: no ejecutada.
- [-] `eas submit`: no ejecutado.

RNEUI permanece como deuda técnica y riesgo posterior; no se reemplaza en
esta fase. No se ejecutó `npm audit fix`, no se cambiaron identificadores ni
configuración de tienda y no se publicó ningún build.

## Evidencia de ejecución

- [ ] SDK y commit registrados.
- [ ] Dispositivo/modelo registrado.
- [ ] Versión de Android o iOS registrada.
- [ ] Tipo de build registrado: Expo Go, development, preview o release.
- [ ] Fecha y responsable registrados.
- [ ] Rama, estado de Git, Node, npm, Expo CLI, EAS CLI y lockfile registrados.
- [ ] Resultado o limitación de cada comando diagnóstico documentado.

## Diagnóstico y arranque

- [ ] Instalación limpia de dependencias.
- [ ] `npx expo-doctor` sin errores bloqueantes.
- [ ] `npx expo install --check` conforme.
- [ ] Configuración Expo efectiva proviene de la fuente esperada.
- [ ] Bundler inicia sin errores.
- [x] Instalación limpia de la aplicación en `Pixel_8`.
- [x] Arranque inicial sin cierre inesperado en `Pixel_8`.
- [ ] Reinicio y retorno desde segundo plano.
- [ ] Splash, icono, orientación y tema correctos.

## Autenticación

- [ ] Login válido.
- [ ] Login inválido y mensaje de error.
- [ ] Persistencia de sesión al reiniciar.
- [ ] Cierre de sesión.
- [ ] Registro.
- [ ] Recuperación de contraseña.
- [ ] Expiración o rechazo de sesión.
- [ ] No se imprimen credenciales ni tokens en logs.
- [ ] El flujo “recordarme” no deja la contraseña almacenada directamente en
  AsyncStorage.
- [ ] Un usuario no autenticado no puede acceder a `Home` ni a rutas
  protegidas.

## Navegación

- [ ] Tabs Inicio, Solicitudes y Más.
- [ ] Apertura y retorno de Registro de Asistencia.
- [ ] Apertura y retorno de Calendario.
- [ ] Apertura y retorno de Solicitudes.
- [ ] Apertura y retorno de Documentos.
- [ ] Apertura y retorno de Notificaciones.
- [ ] Botón atrás de Android sin estados rotos.
- [ ] Deep link/notificación no rompe la navegación, si aplica.

## Inicio y datos

- [ ] Carga de información inicial.
- [ ] Estados de carga visibles.
- [ ] Estado vacío.
- [ ] Error de API controlado.
- [ ] Actualización/recarga de datos.

## Asistencia, ubicación y firma

- [ ] Solicitud de ubicación durante el uso.
- [ ] Permiso concedido.
- [ ] Permiso denegado.
- [ ] Permiso denegado permanentemente/configuración.
- [ ] Ubicación precisa y aproximada en Android, si aplica.
- [ ] Fichaje de entrada.
- [ ] Fichaje de salida.
- [ ] Acciones intermedias configuradas.
- [ ] Validación ante respuesta fallida o lenta.
- [ ] Canvas de firma carga correctamente.
- [ ] Dibujar, limpiar y confirmar firma.
- [ ] Firma con teclado/barras/safe areas sin superposición.

## Solicitudes

- [ ] Listado.
- [ ] Detalle.
- [ ] Creación con datos válidos.
- [ ] Validaciones con datos incompletos.
- [ ] Error de envío.
- [ ] Evitar envío duplicado por doble toque.

## Documentos y archivos

- [ ] Listado de documentos.
- [ ] Detalle/descarga.
- [ ] Selección de documento.
- [ ] Cancelación del selector.
- [ ] Subida correcta.
- [ ] Tipo o tamaño inválido.
- [ ] Acceso al archivo después de seleccionarlo.
- [ ] Compartir documento.
- [ ] Manejo de archivo inexistente o descarga fallida.
- [ ] `documentDirectory` funciona o su migración/uso legacy está documentado.
- [ ] `downloadAsync` funciona o su migración/uso legacy está documentado.
- [ ] `readAsStringAsync` funciona o su migración/uso legacy está documentado.
- [ ] `writeAsStringAsync` funciona o su migración/uso legacy está documentado.
- [ ] `StorageAccessFramework` funciona en los dispositivos Android objetivo.
- [ ] No se solicitan permisos amplios de almacenamiento sin necesidad.

## Notificaciones

- [ ] Prueba en dispositivo físico.
- [ ] Solicitud de permiso.
- [ ] Permiso concedido.
- [ ] Permiso denegado.
- [ ] Token Expo obtenido y manejado sin exponerlo.
- [ ] Canal Android creado.
- [ ] Notificación en primer plano.
- [ ] Notificación en segundo plano.
- [ ] Notificación con aplicación cerrada.
- [ ] Toque de notificación.
- [ ] Sonido, alerta y badge según comportamiento esperado.
- [ ] Los logs no exponen payloads completos, datos personales, respuestas de
  API ni objetos de error sensibles.

## Conectividad

- [ ] Operación con red estable.
- [ ] Sin conexión al iniciar.
- [ ] Pérdida de conexión durante una operación.
- [ ] Recuperación de conexión.
- [ ] Red lenta.
- [ ] Timeout o error de servidor.
- [ ] No se duplican transacciones al reintentar.
- [ ] Respuestas y errores de red no dejan datos sensibles en logs.

## Configuración y datos sensibles

- [ ] `.env` y otros archivos de entorno versionados están inventariados sin
  copiar sus valores.
- [ ] Cada variable `EXPO_PUBLIC_*` fue revisada como dato público incorporable
  al bundle.
- [ ] Ninguna clave, contraseña o secreto depende de
  `react-native-dotenv`/`EXPO_PUBLIC_*` para su protección.
- [ ] La ausencia de referencias `process.env` fue reconfirmada o los usos
  nuevos fueron auditados.
- [ ] No se imprimen notificaciones completas, datos de horarios, respuestas
  de API ni objetos de error con información sensible.

## Interfaz Android 15/16

- [ ] Edge-to-edge correcto.
- [ ] Barra de estado y navegación legibles.
- [ ] Safe areas correctas.
- [ ] Teclado no cubre campos ni botones.
- [ ] Modales y scroll correctos.
- [ ] DateTimePicker y Picker correctos.
- [ ] Calendario correcto.
- [ ] Permiso de notificaciones Android 13+.
- [ ] Manifiesto generado revisado.
- [ ] `targetSdkVersion` efectivo en 36 para el candidato final.
- [ ] `compileSdkVersion` efectivo en 36 para el candidato final.

## Interfaz y capacidades iOS

- [ ] Safe areas en iPhone con notch/Dynamic Island.
- [ ] Teclado y formularios.
- [ ] Selectores de fecha y documentos.
- [ ] Descripciones de permisos correctas y localizadas según necesidad.
- [ ] Modos de segundo plano justificados y sin duplicados.
- [ ] Cámara y fototeca tienen consumidor funcional confirmado o sus permisos
  fueron retirados mediante cambio autorizado.
- [ ] Privacy Manifest/APIs con motivo requerido revisados.
- [ ] Build candidato generado con Xcode 26.2 o posterior.
- [ ] iPhone físico con versión soportada.

## Build release y tiendas

- [ ] Identificadores Android/iOS sin cambios.
- [ ] Proyecto EAS sin cambios.
- [ ] Version/build number correctos.
- [ ] Iconos, splash y nombre correctos.
- [x] APK de preview instala y arranca correctamente; funcionalidad completa
  aún pendiente de validación.
- [ ] AAB de producción se genera.
- [ ] IPA de distribución se genera.
- [ ] Firma y credenciales válidas sin modificarlas.
- [ ] Política OTA/runtime compatible con el binario.
- [ ] Ausencia o configuración explícita de `runtimeVersion` y `expo-updates`
  registrada.
- [ ] Google Play pista interna/cerrada validada.
- [ ] TestFlight validado.
- [ ] Sin crashes bloqueantes ni regresiones críticas.

Las últimas cuatro acciones que impliquen carga a servicios externos requieren
autorización expresa. Completar el checklist no autoriza publicación.
