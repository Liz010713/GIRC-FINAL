INSERT IGNORE INTO productos (sku, nombre_producto, precio_unitario, stock_actual, stock_minimo, estado)
VALUES
    ('GIRC-TEC-001', 'Auriculares inalámbricos', 89900.00, 24, 5, 'DISPONIBLE'),
    ('GIRC-ACC-002', 'Teclado mecánico compacto', 159900.00, 12, 4, 'DISPONIBLE'),
    ('GIRC-HOG-003', 'Lámpara de escritorio LED', 54900.00, 4, 5, 'CRITICO'),
    ('GIRC-TEC-004', 'Cargador USB-C 30W', 39900.00, 0, 3, 'AGOTADO');

INSERT IGNORE INTO usuarios (nombre_completo, email, password, rol, fecha_creacion)
VALUES
    ('Administrador GIRC', 'admin@girc.com', '$2a$10$om4d3EwNE.aQOkSTELWkTeI3uNCkq/05HnZKzw.2BXYQleLb1ci5i', 'ADMINISTRADOR', CURRENT_TIMESTAMP),
    ('Operador GIRC', 'usuario@girc.com', '$2a$10$MWqOkD/2y0In52gwLi6bvulSlIG7iFg4ZvQCxDoFux4Rgr9YyZEiq', 'USUARIO', CURRENT_TIMESTAMP);
