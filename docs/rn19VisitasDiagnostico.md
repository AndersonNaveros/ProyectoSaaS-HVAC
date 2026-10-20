# RN19 — Visitas de diagnóstico pagadas

**Estado de decisión: parcialmente confirmado (por el equipo; validar formalmente con HVAC).**

## Datos confirmados por el usuario

1. Las visitas presenciales de diagnóstico **tienen costo**.
2. Pueden autorizarlas el propietario de HVAC o la persona responsable de coordinación comercial y operativa (también realiza funciones de secretaría).
3. **NO está definido** un momento de pago universal: puede depender del cliente o del trabajo, o debe confirmarse.

## Modelo propuesto (todavía no implementado)

La cotización de visita y la orden de visita son procesos separados de una cotización completa de productos/servicios. Una futura entidad `visita_diagnostico` debería contener:

- `solicitud_id` / `cliente_id`: vinculación con la solicitud original.
- `authorized_by_user_id` y `authorized_at`: autorización **interna** trazable.
- `tarifa`, `moneda` y `condiciones_pago`: valores **privados** establecidos por HVAC.
- `momento_cobro`: `POR_ACORDAR`, `ANTES`, `DESPUES`, `PERSONALIZADO`.
- `aceptacion_cliente_at` y `evidencia_aceptacion`: diferenciar aprobación por el cliente de autorización interna.
- `payment_status`: `PENDIENTE`, `PARCIAL`, `VERIFICADO`, según confirmación autorizada.
- `fecha_programada`, `tecnico_id`, `estado_operativo`, `informe_tecnico_id`.

**Importante:** subir una captura de pago o comprobante no implica que el dinero esté confirmado. Tampoco autorizar internamente la visita significa que el cliente aceptó su tarifa.

## Posible máquina de estados (requiere aprobación)

`SOLICITADA` → `TARIFA_COMUNICADA` → `APROBADA_INTERNA` → `ACEPTADA_CLIENTE` → `PROGRAMADA` → `REALIZADA` → `INFORME_ENTREGADO`.

`CANCELADA` puede ocurrir desde algunos estados. El seguimiento del **pago es independiente** del estado de la visita.

## Preguntas que no debemos decidir por cuenta propia

- ¿Hay tarifa fija o se estima según zona, complejidad o desplazamiento?
- ¿La tarifa se descuenta del trabajo posterior si el cliente contrata?
- ¿Quién verifica el pago y qué comprobantes se emiten?
- ¿Qué condiciones se aplican a reprogramaciones, cancelaciones o visitas fuera de Lima?
- ¿Qué técnicos pueden ejecutar la visita y adjuntar fotos/documentos?

## Alcance de v0.1

Solo una tarjeta de catálogo ficticia de servicio de diagnóstico. **No se generan tarifas, cobros, visitas ni órdenes reales** en el código. Estas se implementarán después de la aprobación formal de las reglas de negocio.
