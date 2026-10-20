# HVAC Solutions V1.3
HVAC Solutions es nuestro avance academico para un sistema de cotizaciones y seguimiento de equipos y servicios tecnicos de HVAC Controls.

La idea principal es que un cliente pueda explorar el catalogo, seleccionar equipos o servicios, reunirlos en una sola solicitud y enviar una consulta de forma simple. Tambien buscamos dejar una base de trabajo clara para seguir creciendo el proyecto por etapas.

## Que se puede probar hoy
- inicio, catalogo, nosotros y contactanos
- catalogo con equipos y servicios en una sola vista
- busqueda, filtros y boton para mostrar mas resultados
- categorias visuales y bloque destacado para servicios tecnicos
- formulario de solicitud en tres pasos
- carrito para reunir productos y servicios
- vista de confirmacion y seguimiento demo
- footer compartido en todas las paginas

## Tecnologias
Usamos Java y Spring Boot para el backend.
Usamos React, JavaScript y Vite para el frontend.
La base de datos prevista es PostgreSQL y mas adelante se trabajara con Docker Compose para levantar el entorno completo.

## Como ejecutar la demo
Desde la carpeta frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run testAll
npm.cmd run buildDemo
npm.cmd run devDemo
```

Luego abrimos en nuestro navegador:

http://127.0.0.1:5173/

## Estructura general

backend/
frontend/
docker-compose.yml
README.md

## Cambios recientes
En esta version mejoramos el catalogo para que se vea mas ordenado, mas util y con mas personalidad. Se mantuvo el estilo minimalista, pero ahora aprovecha mejor el espacio, muestra mejor las categorias y presenta mejor los servicios tecnicos.

La seccion Nosotros fue reorganizada y ahora muestra una estructura mas clara. Tambien reemplazamos los numeros por iconos para que la experiencia visual sea mas agradable.

La seccion Contactanos ahora tiene una estructura mas completa, con hero principal, bloque de contacto, informacion comercial, forma de atencion, cobertura y llamada final a la accion.

Tambien dejamos un solo footer compartido para todo el sitio y ajustamos detalles visuales como flechas, botones y tarjetas para que el recorrido sea mas claro.

## Lo que sigue
- conectar el backend con PostgreSQL
- guardar solicitudes reales
- implementar autenticacion y cuentas
- trabajar el seguimiento real de cotizaciones
- seguir mejorando la experiencia del SaaS