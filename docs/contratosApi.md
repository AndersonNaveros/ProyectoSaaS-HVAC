# Contratos API — vertical 01

## `GET /api/catalog`

Respuesta (`200`):

```json
[
  {"id":1,"type":"PRODUCT","name":"Termostato programable","sku":"DEMO-TH-01","summary":"Referencia ficticia para pruebas.","category":"Climatización"}
]
```

Los datos reales vendrán de una catalogación autorizada. No devolver jamás costo, tasa interna, margen, precio ni disponibilidad cuantitativa privada.

## `POST /api/solicitudes`

Body de ejemplo con **datos inventados**:

```json
{
  "idempotencyKey":"a1b2c3d4-1234-4321-a1b2-bfa48d73da1e",
  "contactName":"Cliente de prueba",
  "contactPhone":"+51 900 000 000",
  "contactEmail":"",
  "companyName":"",
  "location":"",
  "notes":"Requiere información comercial",
  "preferredContact":"WHATSAPP",
  "lines":[{"catalogItemId":1,"quantity":2},{"catalogItemId":3,"quantity":1}]
}
```

Respuesta nueva (`201`):

```json
{
  "code":"HVAC-2026-REFERENCIA",
  "token":"TOKEN_ALEATORIO_DEVUELTO_UNA_SOLA_VEZ",
  "expiresAt":"2026-11-16T12:00:00Z",
  "alreadyRegistered":false,
  "whatsappSummary":"Hola, HVAC Solutions..."
}
```

**La referencia, fecha y token son ilustrativos.** El token real lo genera el backend, con 256 bits aleatorios. Solo se almacena su SHA-256. El frontend debe permitir copiar el enlace privado generado.

Si se repite `idempotencyKey` después de completar la primera solicitud, se devuelve `200` con `alreadyRegistered:true` y `token:null` para evitar duplicación o exposición del secreto. Si se perdió el token, la recuperación deberá definirse y verificarse con HVAC; no se restablece por conocer el código público.

## `POST /api/tracking/lookup`

Body: `{ "token": "TOKEN_PRIVADO" }`

Respuesta (`200`):

```json
{
  "code":"HVAC-2026-REFERENCIA",
  "status":"REGISTERED",
  "createdAt":"2026-10-17T12:00:00Z",
  "lines":[{"type":"PRODUCT","name":"Termostato programable","quantity":2}]
}
```

Si no es válido o ha caducado, `404`. El endpoint envía `Cache-Control: no-store`. El token no viaja en la URL del endpoint de backend. Solo se puede consultar una **vista limitada**; no incluye precios, información de contacto ni documentos privados.

## Consideraciones técnicas

- Validar en el servidor los identificadores y cantidades del carrito; jamás confiar en datos de nombres o precios enviados desde React.
- La BD tiene restricción `UNIQUE(idempotency_key)` y `UNIQUE(tracking_hash)`.
- **El código de referencia NO autoriza** el seguimiento.
- Los archivos adjuntos, autenticación, roles y órdenes de trabajo todavía no están implementados.
- CORS solo se habilita desde el origen especificado por `FRONTEND_ORIGIN` cuando aplica; en desarrollo la API se consume mediante el proxy de Vite.
