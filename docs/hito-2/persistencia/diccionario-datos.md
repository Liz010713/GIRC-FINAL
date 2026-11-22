# Diccionario de datos y mapeo ORM

Tipos esperados en PostgreSQL 16 a partir de JPA/Hibernate. NN = NOT NULL, UQ = UNIQUE. Las tres entidades llevan `@Entity` y `@Table(name = "...")`. Cada `id` usa `Long`, `@Id` y `@GeneratedValue(strategy = IDENTITY)`, mapeado a `BIGINT` generado, PK y NN.

## GIRC

| Tabla / columna | Atributo Java | Tipo SQL | Restricciones y significado |
|---|---|---|---|
| productos.sku | sku | VARCHAR(50) | NN, UQ, código de catálogo |
| productos.nombre_producto | nombreProducto | VARCHAR(150) | NN, nombre visible |
| productos.precio_unitario | precioUnitario | NUMERIC(12,2) | NN, BigDecimal, precio vigente |
| productos.stock_actual | stockActual | INTEGER | NN, unidades disponibles |
| productos.stock_minimo | stockMinimo | INTEGER | NN, umbral de alerta |
| productos.estado | estado | VARCHAR(20) | NN, String. Disponible, Crítico o Agotado según el servicio |
| pedidos.codigo_orden | codigoOrden | VARCHAR(40) | NN, UQ, ORD- seguido de UUID en mayúsculas |
| pedidos.id_usuario | idUsuario | BIGINT | NN, dato del cliente, sin FK |
| pedidos.clave_idempotencia | claveIdempotencia | VARCHAR(100) | NN, UQ global |
| pedidos.total_neto | totalNeto | NUMERIC(12,2) | NN, BigDecimal, suma de subtotales |
| pedidos.estado | estado | VARCHAR(30) | NN, String, Pendiente al crear |
| pedidos.fecha_creacion | fechaCreacion | TIMESTAMP WITH TIME ZONE | NN, OffsetDateTime, se crea en UTC |
| detalles_pedido.pedido_id | pedido | BIGINT | NN, FK a pedidos.id |
| detalles_pedido.producto_id | producto | BIGINT | NN, FK a productos.id |
| detalles_pedido.cantidad_solicitada | cantidadSolicitada | INTEGER | NN, unidades de la línea |
| detalles_pedido.precio_unitario | precioUnitario | NUMERIC(12,2) | NN, precio capturado al pedir |
| detalles_pedido.subtotal | subtotal | NUMERIC(12,2) | NN, precio por cantidad |

- `Pedido.detalles`: `@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)`, LAZY por defecto. La cascada es ORM. La solicitud exige al menos una línea, mientras la FK admite un pedido sin hijos en BD.
- `DetallePedido.pedido` y `DetallePedido.producto`: `@ManyToOne(fetch = FetchType.LAZY, optional = false)` y `@JoinColumn(nullable = false)` con el nombre de columna correspondiente. `@JsonIgnore` en `pedido` evita el retorno cíclico durante serialización.
- `Producto` aplica `@DecimalMin("0.0")` al precio, `@Min(0)` al stock actual y `@Min(1)` al mínimo. El DTO aplica `@Min(1)` a cantidad. Estas anotaciones son reglas de validación. El repositorio carece de migraciones o `@Check` explícitos para stock, cantidades, estados o totales. El DDL de Hibernate observado en `InventarioYPedidosDataJpaTest` con H2 incluyó `CHECK (stock_actual >= 0)` y `CHECK (stock_minimo >= 1)`. La presencia de esos CHECK en PostgreSQL queda por comprobar. Los valores iniciales de Lombok son de Java.
- Se permite repetir un producto en varias líneas del mismo pedido. El servicio acumula el consumo antes de actualizar existencias. No hay UQ compuesta `(pedido_id, producto_id)`.

## Consultas e índices

| Consulta | Índice o apoyo declarado | Observación |
|---|---|---|
| Búsqueda de producto por ID | PK de productos | `findByIdWithLock` aplica `@Lock(PESSIMISTIC_WRITE)` a la consulta, dentro de la transacción |
| Detección de duplicado | UQ de pedidos.clave_idempotencia | `existsByClaveIdempotencia` |
| Inventario | `findAll()` | Sin filtro, índice compuesto ni paginación declarados |
| Detalles por pedido o producto | FKs | Sin índice secundario explícito en las columnas FK de detalles |

PostgreSQL respalda PK y UQ con índices. El modelo actual no declara índices compuestos. Evaluar nuevos índices requiere `EXPLAIN` con datos representativos.

Fuentes: [entidades](../../../backend/src/main/java/com/girc/domain/entity), [repositorios](../../../backend/src/main/java/com/girc/repository), [configuración JPA](../../../backend/src/main/resources/application.yml) y [datos semilla](../../../backend/src/main/resources/data.sql). `ddl-auto=update` deja el esquema a Hibernate. `data.sql` carga productos de demostración mediante `ON CONFLICT (sku) DO NOTHING`. El esquema físico de PostgreSQL y sus CHECK efectivos quedan por verificar en una instancia real.
