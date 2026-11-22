INSERT INTO productos (sku, nombre_producto, precio_unitario, stock_actual, stock_minimo, estado)
VALUES
    ('GIRC-TEC-001', 'Auriculares inalámbricos', 89900.00, 24, 5, 'Disponible'),
    ('GIRC-ACC-002', 'Teclado mecánico compacto', 159900.00, 12, 4, 'Disponible'),
    ('GIRC-HOG-003', 'Lámpara de escritorio LED', 54900.00, 4, 5, 'Crítico'),
    ('GIRC-TEC-004', 'Cargador USB-C 30W', 39900.00, 0, 3, 'Agotado')
ON CONFLICT (sku) DO NOTHING;
