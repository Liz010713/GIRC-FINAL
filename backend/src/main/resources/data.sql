INSERT INTO jugadores (id, nombre, email)
VALUES (1, 'Usuario Demo', 'usuario@girc.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO canchas (id, nombre, tipo_cancha, tarifa_hora, activa)
VALUES
    (1, 'Cancha Pádel 1 - Panorámica', 'PADEL', 80000.0, true),
    (2, 'Cancha Fútbol 5 - Sintética Norte', 'FUTBOL_5', 140000.0, true),
    (3, 'Cancha Tenis 1 - Polvo de Ladrillo', 'TENIS', 95000.0, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('jugadores', 'id'), COALESCE((SELECT MAX(id) FROM jugadores), 1));
SELECT setval(pg_get_serial_sequence('canchas', 'id'), COALESCE((SELECT MAX(id) FROM canchas), 1));

INSERT INTO productos (sku, nombre_producto, precio_unitario, stock_actual, stock_minimo, estado)
VALUES
    ('GIRC-TEC-001', 'Auriculares inalámbricos', 89900.00, 24, 5, 'Disponible'),
    ('GIRC-ACC-002', 'Teclado mecánico compacto', 159900.00, 12, 4, 'Disponible'),
    ('GIRC-HOG-003', 'Lámpara de escritorio LED', 54900.00, 4, 5, 'Crítico'),
    ('GIRC-TEC-004', 'Cargador USB-C 30W', 39900.00, 0, 3, 'Agotado')
ON CONFLICT (sku) DO NOTHING;
