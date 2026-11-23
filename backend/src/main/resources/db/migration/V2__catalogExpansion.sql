-- Ampliamos los registros de prueba sin modificar la migracion V1.
-- Estos items todavia NO forman parte del inventario real de HVAC.
INSERT INTO catalog_items (type, name, sku, summary, category) VALUES
('PRODUCT', 'Difusor de aire', 'DEMO-DA-01', 'Elemento de distribucion de aire para sistemas de ventilacion.', 'Ventilacion'),
('SERVICE', 'Instalacion y puesta en marcha', NULL, 'Instalacion y configuracion sujetas a evaluacion.', 'Instalacion'),
('PRODUCT', 'Aire acondicionado split', 'DEMO-SP-01', 'Equipo de climatizacion para espacios residenciales o comerciales.', 'Climatizacion'),
('PRODUCT', 'Cassette de cuatro vias', 'DEMO-CA-01', 'Equipo empotrable de distribucion de aire.', 'Climatizacion'),
('PRODUCT', 'Extractor para conductos', 'DEMO-EX-01', 'Equipo para extraccion y renovacion de aire.', 'Ventilacion'),
('PRODUCT', 'Unidad condensadora', 'DEMO-UC-01', 'Unidad exterior para sistemas de climatizacion.', 'Climatizacion'),
('PRODUCT', 'Unidad manejadora de aire', 'DEMO-UMA-01', 'Equipo de tratamiento y distribucion de aire.', 'Ventilacion'),
('SERVICE', 'Revision de ventilacion', NULL, 'Evaluacion de conductos y renovacion de aire.', 'Diagnostico');
