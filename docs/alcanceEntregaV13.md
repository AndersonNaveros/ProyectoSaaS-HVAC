# Alcance de nuestra entrega HVAC-SolutionsV1.3

## Qué mostramos

Nos enfocamos en cuatro apartados públicos: Inicio, Catálogo, Nosotros y Contáctanos. Dejamos un footer único desde `App.jsx` y una navegación compartida.

- **Inicio**: presentación de la empresa, soluciones, proceso de atención y criterios técnicos
- **Catálogo**: equipos y servicios en un mismo recorrido, filtros, búsqueda, categorías visuales, ventana de detalles y carrito
- **Nosotros**: experiencia profesional, especialidades y forma de trabajar usando iconos reutilizables
- **Contáctanos**: acceso a solicitud, orientación, información comercial, pasos de atención y cobertura
- **Solicitud**: carrito combinado y formulario de invitado en tres pasos; seguimos con un resumen de WhatsApp y un enlace de seguimiento simulados

## Cómo lo implementamos

Usamos React y Vite para el frontend. Java con Spring Boot y PostgreSQL forman la siguiente integración pendiente. Preferimos un monolito Java modular antes que microservicios para esta etapa del curso.

Para la presentación ejecutamos `npm.cmd run devDemo`. Ese modo utiliza únicamente un catálogo de prueba y solicitudes simuladas. El modo `npm.cmd run dev` sigue esperando el backend, sin reemplazarlo con información inventada.

## Pendientes antes de una prueba real con clientes

- Confirmar correo, teléfono, RUC, horario y fotografías autorizadas con HVAC
- Ejecutar PostgreSQL, verificar Docker Compose y conectar la API Spring Boot
- Guardar solicitudes reales, autenticar usuarios y proteger accesos por rol
- Implementar revisión de solicitudes, cotización real y coordinación de visitas
- Confirmar el momento de cobro de los diagnósticos según las condiciones del cliente
- Revisar consentimiento y tratamiento de datos personales antes de lanzar formularios públicos

## Qué no estamos afirmando

No decimos que este avance sea un SaaS listo para vender. Tampoco afirmamos que el backend esté desplegado ni que una solicitud de prueba se envíe a la empresa. Lo mostramos como una base navegable sobre la que seguiremos trabajando y registrando cambios en GitHub.
