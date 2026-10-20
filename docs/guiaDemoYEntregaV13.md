# HVAC Solutions V1.3 — Guía rápida de demostración

## Qué está realmente implementado
- Aplicación React con catálogo, filtros, búsqueda y carrito único.
- Flujo progresivo en tres pasos para cotizaciones de invitados.
- En **modo demostración** se cargan seis elementos ficticios desde el navegador (sin Java ni PostgreSQL), se simula una solicitud y se muestra un seguimiento que se conserva **solo en el navegador**. No se almacena ningún dato de contacto en localStorage.
- En modo normal, el frontend consulta el backend Java, que requiere PostgreSQL para guardar solicitudes y generar tokens privados.
- **No** hay aún cuentas registradas, panel administrativo, pagos, órdenes de diagnóstico ni envío automático de WhatsApp.

## Arranque rápido, sin Docker
Desde la carpeta frontend:

```powershell
npm.cmd install
npm.cmd run testDemo
npm.cmd run devDemo
```

Abrir `http://127.0.0.1:5173`. Vite debería mostrar la barra **MODO DEMOSTRACIÓN LOCAL** y tarjetas ficticias. No usar datos de clientes reales.

## Prueba de presentación
1. Filtrar por **Servicios** para mostrar diagnósticos y mantenimiento.
2. Volver a **Todos**, agregar un producto y un servicio.
3. Abrir **Mi solicitud** y modificar cantidades.
4. Continuar como invitado; poner nombre y teléfono ficticios.
5. Confirmar y verificar un código `DEMO-...`.
6. Pulsar **Ver seguimiento**: aparece «Solicitud registrada» desde el navegador.
7. Explicar que el backend Java/PostgreSQL real se integrará en la siguiente fase.

## Comprobar compilación
En otra terminal de frontend:

```powershell
npm.cmd run buildDemo
```

Esto comprueba compilación de frontend; no demuestra integración real con Java.

## GitHub: preparación segura
- Crear repositorio **privado** mientras no se aprueben derechos de publicación y materiales del cliente.
- Subir código, documentación de demostración y archivo `package-lock.json` generado por npm.
- No subir `.env`, `node_modules/`, `dist/`, `backend/target/`, contraseñas, capturas de WhatsApp de clientes ni documentos reales.
- No subir el ZIP de versiones anteriores al repositorio como si fueran código fuente.

## Próxima etapa
Configurar Docker Desktop + WSL2 + PostgreSQL, iniciar Java/Spring Boot, comprobar `GET /api/catalog`, probar `POST /api/solicitudes` y `/api/tracking/lookup` con almacenamiento real. Más adelante implementar login de clientes, administración y visitas de diagnóstico pagadas.
