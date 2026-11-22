# Diccionario de datos y mapeo ORM

Tipos esperados en PostgreSQL 16 a partir de JPA/Hibernate. **PK** = llave primaria, **FK** = llave foránea, **NN** = `NOT NULL`, **UQ** = `UNIQUE`. Las tres entidades usan `@Entity` y `@Table(name = "...", indexes = ...)`.

## Entidades y columnas de GIRC

| Tabla / columna | Atributo Java | Tipo SQL (PostgreSQL) | Restricciones y descripción funcional | Anotación ORM (JPA) |
|---|---|---|---|---|
| `productos.id` | `id` | `BIGINT` (`IDENTITY`) | PK, NN. Identificador único autogenerado del producto. | `@Id`, `@GeneratedValue(strategy = IDENTITY)` |
| `productos.sku` | `sku` | `VARCHAR(50)` | NN, UQ. Código único de catálogo del producto. | `@NotBlank`, `@Column(nullable = false, unique = true, length = 50)` |
| `productos.nombre_producto` | `nombreProducto` | `VARCHAR(150)` | NN. Nombre comercial visible en el inventario. | `@NotBlank`, `@Column(name = "nombre_producto", nullable = false, length = 150)` |
| `productos.precio_unitario` | `precioUnitario` | `NUMERIC(12,2)` | NN, `>= 0.0` (`BigDecimal`). Precio vigente del producto. | `@NotNull`, `@DecimalMin("0.0")`, `@Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)` |
| `productos.stock_actual` | `stockActual` | `INTEGER` | NN, `>= 0`. Unidades físicas disponibles para venta. | `@NotNull`, `@Min(0)`, `@Column(name = "stock_actual", nullable = false)` |
| `productos.stock_minimo` | `stockMinimo` | `INTEGER` | NN, `>= 1`. Umbral de alerta para pasar a estado crítico. | `@NotNull`, `@Min(1)`, `@Column(name = "stock_minimo", nullable = false)` |
| `productos.estado` | `estado` | `VARCHAR(20)` | NN. Enum `EstadoProducto` (`DISPONIBLE`, `CRITICO`, `AGOTADO`); serializa en JSON vía `@JsonValue` como `Disponible`, `Crítico` o `Agotado`. | `@NotNull`, `@Enumerated(EnumType.STRING)`, `@Column(nullable = false, length = 20)` |
| `pedidos.id` | `id` | `BIGINT` (`IDENTITY`) | PK, NN. Identificador único autogenerado del pedido. | `@Id`, `@GeneratedValue(strategy = IDENTITY)` |
| `pedidos.codigo_orden` | `codigoOrden` | `VARCHAR(40)` | NN, UQ. Código legible generado con prefijo `ORD-` + UUID en mayúsculas. | `@Column(name = "codigo_orden", nullable = false, unique = true, length = 40)` |
| `pedidos.id_usuario` | `idUsuario` | `BIGINT` | NN. Identificador del operador/usuario solicitante (escalar, sin FK en el MVP). | `@Column(name = "id_usuario", nullable = false)` |
| `pedidos.clave_idempotencia` | `claveIdempotencia` | `VARCHAR(100)` | NN, UQ global. Clave única que evita registrar pedidos duplicados. | `@Column(name = "clave_idempotencia", nullable = false, unique = true, length = 100)` |
| `pedidos.total_neto` | `totalNeto` | `NUMERIC(12,2)` | NN (`BigDecimal`). Suma total de los subtotales de las líneas del pedido. | `@Column(name = "total_neto", nullable = false, precision = 12, scale = 2)` |
| `pedidos.estado` | `estado` | `VARCHAR(30)` | NN. Enum `EstadoPedido` (`PENDIENTE`, `CONFIRMADO`, `CANCELADO`); inicia en `PENDIENTE` y serializa en JSON vía `@JsonValue` como `Pendiente`. | `@Enumerated(EnumType.STRING)`, `@Column(nullable = false, length = 30)` |
| `pedidos.fecha_creacion` | `fechaCreacion` | `TIMESTAMP WITH TIME ZONE` | NN (`OffsetDateTime`). Marca temporal del registro en UTC. | `@Column(name = "fecha_creacion", nullable = false)` |
| `detalles_pedido.id` | `id` | `BIGINT` (`IDENTITY`) | PK, NN. Identificador único autogenerado de la línea de detalle. | `@Id`, `@GeneratedValue(strategy = IDENTITY)` |
| `detalles_pedido.pedido_id` | `pedido` | `BIGINT` | NN, FK a `pedidos.id`. Referencia obligatoria al pedido padre. | `@JsonIgnore`, `@ManyToOne(fetch = FetchType.LAZY, optional = false)`, `@JoinColumn(name = "pedido_id", nullable = false)` |
| `detalles_pedido.producto_id` | `producto` | `BIGINT` | NN, FK a `productos.id`. Referencia obligatoria al producto vendido. | `@ManyToOne(fetch = FetchType.LAZY, optional = false)`, `@JoinColumn(name = "producto_id", nullable = false)` |
| `detalles_pedido.cantidad_solicitada` | `cantidadSolicitada` | `INTEGER` | NN, `>= 1` en DTO. Unidades solicitadas del producto en esta línea. | `@Column(name = "cantidad_solicitada", nullable = false)` |
| `detalles_pedido.precio_unitario` | `precioUnitario` | `NUMERIC(12,2)` | NN (`BigDecimal`). Precio unitario capturado al momento de crear el pedido. | `@Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)` |
| `detalles_pedido.subtotal` | `subtotal` | `NUMERIC(12,2)` | NN (`BigDecimal`). Importe de la línea (`precio_unitario * cantidad_solicitada`). | `@Column(nullable = false, precision = 12, scale = 2)` |

### Relaciones y reglas de integridad ORM

- **`Pedido.detalles`:** `@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)`, con carga `LAZY` por defecto. La cascada persiste las líneas junto con la cabecera. La API exige al menos un ítem en `CrearPedidoRequest`.
- **`DetallePedido.pedido` y `DetallePedido.producto`:** ambas relaciones usan `@ManyToOne(fetch = FetchType.LAZY, optional = false)` y `@JoinColumn(nullable = false)`. `@JsonIgnore` en `pedido` evita recursión infinita al serializar JSON.
- **Enumeraciones seguras (`@Enumerated(EnumType.STRING)`):** `EstadoProducto` (`com.girc.domain.enums.EstadoProducto`) y `EstadoPedido` (`com.girc.domain.enums.EstadoPedido`) persisten el nombre simbólico (`DISPONIBLE`, `CRITICO`, `AGOTADO`, `PENDIENTE`, etc.) en vez de índices ordinales frágiles, y conservan `@JsonValue` para mantener el contrato JSON en español consumido por React.
- **Validaciones y restricciones `CHECK`:** `Producto` aplica `@DecimalMin("0.0")` en `precioUnitario`, `@Min(0)` en `stockActual` y `@Min(1)` en `stockMinimo`. El DTO aplica `@Min(1)` en `cantidadSolicitada`. Hibernate genera restricciones `CHECK` en H2 para las enumeraciones y mínimos; la verificación física del DDL mediante migraciones versionadas en PostgreSQL sigue planificada para producción.
- **Múltiples líneas del mismo producto:** se permite repetir un producto en varias líneas del mismo pedido; el servicio acumula el consumo total antes de descontar existencias. No hay restricción `UNIQUE(pedido_id, producto_id)`.

## Consultas e índices declarados

| Consulta / acceso frecuente | Índice o apoyo declarado | Definición JPA / BD | Observación |
|---|---|---|---|
| Búsqueda de producto por ID con bloqueo | PK de `productos` (`id`) | `@Id` + `@Lock(PESSIMISTIC_WRITE)` | `findByIdWithLock` bloquea la fila durante la transacción. |
| Filtrado/alertas por estado y stock | Índice compuesto `idx_productos_estado_stock` | `@Index(name = "idx_productos_estado_stock", columnList = "estado, stock_actual")` | Acelera consultas de productos `CRITICO` o `AGOTADO` ordenados por stock. |
| Detección de duplicados por idempotencia | Índice `UNIQUE` en `pedidos.clave_idempotencia` | `@Column(unique = true)` | Respalda `existsByClaveIdempotencia` y la unicidad global. |
| Historial de pedidos por usuario y fecha | Índice compuesto `idx_pedidos_usuario_fecha` | `@Index(name = "idx_pedidos_usuario_fecha", columnList = "id_usuario, fecha_creacion")` | Prepara consultas cronológicas por usuario/operador. |
| Acceso a líneas por pedido | Índice de FK `idx_detalles_pedido_pedido_id` | `@Index(name = "idx_detalles_pedido_pedido_id", columnList = "pedido_id")` | Evita escaneos secuenciales en joins `pedidos -> detalles_pedido` (PostgreSQL no indexa FKs automáticamente). |
| Consultas de ventas por producto | Índice de FK `idx_detalles_pedido_producto_id` | `@Index(name = "idx_detalles_pedido_producto_id", columnList = "producto_id")` | Acelera reportes y auditorías por producto. |

Fuentes: [entidades](../../../backend/src/main/java/com/girc/domain/entity), [enumeraciones](../../../backend/src/main/java/com/girc/domain/enums), [repositorios](../../../backend/src/main/java/com/girc/repository), [configuración JPA](../../../backend/src/main/resources/application.yml) y [datos semilla](../../../backend/src/main/resources/data.sql). `ddl-auto=update` deja la evolución del esquema a Hibernate y `data.sql` inserta el catálogo inicial con estados `DISPONIBLE`, `CRITICO` y `AGOTADO` mediante `ON CONFLICT (sku) DO NOTHING`.
