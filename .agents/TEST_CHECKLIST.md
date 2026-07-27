# Checklist de pruebas

Usar una copia por plataforma, versión de SDK y tipo de build. Registrar
dispositivo, versión de SO, perfil EAS, commit y resultado.

Estados sugeridos: `[ ]` pendiente, `[x]` aprobado, `[!]` falló, `[-]` no
aplica.

## Evidencia de ejecución

- [ ] SDK y commit registrados.
- [ ] Dispositivo/modelo registrado.
- [ ] Versión de Android o iOS registrada.
- [ ] Tipo de build registrado: Expo Go, development, preview o release.
- [ ] Fecha y responsable registrados.

## Diagnóstico y arranque

- [ ] Instalación limpia de dependencias.
- [ ] `npx expo-doctor` sin errores bloqueantes.
- [ ] `npx expo install --check` conforme.
- [ ] Bundler inicia sin errores.
- [ ] Instalación limpia de la aplicación.
- [ ] Arranque en frío sin cierre inesperado.
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

## Conectividad

- [ ] Operación con red estable.
- [ ] Sin conexión al iniciar.
- [ ] Pérdida de conexión durante una operación.
- [ ] Recuperación de conexión.
- [ ] Red lenta.
- [ ] Timeout o error de servidor.
- [ ] No se duplican transacciones al reintentar.

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
- [ ] Privacy Manifest/APIs con motivo requerido revisados.
- [ ] Build candidato generado con Xcode 26.2 o posterior.
- [ ] iPhone físico con versión soportada.

## Build release y tiendas

- [ ] Identificadores Android/iOS sin cambios.
- [ ] Proyecto EAS sin cambios.
- [ ] Version/build number correctos.
- [ ] Iconos, splash y nombre correctos.
- [ ] APK de preview instala y funciona.
- [ ] AAB de producción se genera.
- [ ] IPA de distribución se genera.
- [ ] Firma y credenciales válidas sin modificarlas.
- [ ] Política OTA/runtime compatible con el binario.
- [ ] Google Play pista interna/cerrada validada.
- [ ] TestFlight validado.
- [ ] Sin crashes bloqueantes ni regresiones críticas.

Las últimas cuatro acciones que impliquen carga a servicios externos requieren
autorización expresa. Completar el checklist no autoriza publicación.
