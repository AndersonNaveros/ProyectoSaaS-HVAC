# Catálogo unificado · Decisiones V1.3

Queremos que una persona pueda reunir equipos y servicios técnicos en una misma solicitud, sin tener que enviar varios formularios. Por eso mantenemos **un catálogo único** y no una tienda con pagos o stock público.

## Lo que decidimos para la interfaz

- Presentamos **Todo / Equipos / Servicios**, búsqueda por nombre, descripción, categoría y código, un filtro de categoría y orden por nombre.
- Elegimos tarjetas compactas: cuatro columnas en pantallas amplias, menos columnas según el ancho.
- Cada tarjeta tiene solo dos acciones: **Ver detalles** y **Agregar**. El carrito se revisa desde la cabecera o el resumen del catálogo.
- Cargamos hasta ocho resultados al inicio y mostramos más al solicitarlo, sin recargar la página.
- Evitamos publicar precios, disponibilidad interna o información comercial que todavía no ha sido aprobada.
- En servicios técnicos no anunciamos una tarifa de diagnóstico ni un momento de cobro: coordinación comercial lo confirmará caso por caso.
- Las imágenes de la versión académica son **referenciales** y provienen del prototipo recibido. Antes de publicar la web comercial comprobaremos su procedencia y autorización.

## Cómo está conectado con Java

El endpoint inicial `GET /api/catalog` responde una lista plana que contiene:

`id`, `type` (`PRODUCT` o `SERVICE`), `name`, `sku`, `summary`, `category`.

De momento **React filtra y ordena localmente** porque la cantidad de artículos es pequeña. La demo tiene 12 referencias ficticias con imágenes asociadas por `mediaKey`. Ese campo es opcional y exclusivo de la simulación; Java no tiene que enviarlo para que React pueda trabajar. Si una imagen no está disponible, presentamos un estado neutral y evitamos inventar fotografías de un artículo.

El backend debe seguir validando `catalogItemId` y `quantity` al recibir `POST /api/solicitudes`, independientemente de lo que React haya mostrado.

## Qué necesitamos después

1. Completar la catalogación real con HVAC: nombres, categorías y servicios vigentes.
2. Aprobar fotografías propias o con licencia. Podemos añadir URLs de imágenes a un DTO público, sin mezclar rutas del servidor con carpetas locales.
3. Si hay cientos o miles de referencias, exponer en Java filtros de tipo/categoría, búsqueda con índice y paginación del lado servidor.
4. Mantener los precios, descuentos, autorizaciones y costos internos protegidos. La cotización formal seguirá otro flujo.
5. Probar rendimiento, accesibilidad y comportamiento móvil antes de una publicación real.

**Estado:** el frontend se puede ejecutar con `npm.cmd run devDemo`; falta verificar la integración real de Java y PostgreSQL en el equipo de desarrollo.
