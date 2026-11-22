# ADR-002: Transacciones y bloqueo pesimista de existencias

- **Estado:** Aceptada
- **Fecha:** 2026-11-21

## Contexto y problema

En la creación de pedidos comerciales, dos o más transacciones simultáneas pueden competir por las últimas unidades de un mismo producto. Sin control de concurrencia y atomicidad, el sistema podría aprobar ventas por encima del stock real (sobreventa) o dejar un pedido guardado sin descontar existencias ante un fallo intermedio. Además, un reintento de red con la misma solicitud no debe duplicar la orden.

## Alternativas evaluadas

1. Transacción local `@Transactional` con bloqueo pesimista JPA (`LockModeType.PESSIMISTIC_WRITE`) y verificación previa de clave de idempotencia.
2. Bloqueo optimista con `@Version` en `Producto` y lógica de reintentos ante `OptimisticLockException`.
3. Actualización SQL condicional (`UPDATE productos SET stock_actual = stock_actual - :cant WHERE id = :id AND stock_actual >= :cant`) comprobando filas afectadas.

## Decisión tomada

`PedidoServiceImpl.crearPedido()` se ejecuta bajo `@Transactional`. Al iniciar, valida que `claveIdempotencia` no exista con `PedidoRepository.existsByClaveIdempotencia()`. Para cada producto distinto del pedido, invoca `ProductoRepository.findByIdWithLock()`, aplicando `LockModeType.PESSIMISTIC_WRITE` sobre la fila hasta concluir la transacción. El servicio valida todas las líneas acumulando el consumo si un producto se repite, descuenta existencias, recalcula `EstadoProducto` (`DISPONIBLE`, `CRITICO`, `AGOTADO`), guarda `Pedido` en cascada con sus `DetallePedido` en estado `EstadoPedido.PENDIENTE` y publica `PedidoCreadoEvent`. Ante cualquier excepción de negocio, Spring revierte toda la transacción.

## Consecuencias y trade-offs

- **Positivas:** garantiza atomicidad ACID entre inventario, pedido y detalles; evita sobreventa manteniendo la fila bloqueada durante la validación y actualización; simplifica el servicio al no requerir bucles de reintento manual.
- **Negativas:** reduce el paralelismo cuando muchas transacciones compiten simultáneamente por el mismo producto caliente; el evento `PedidoCreadoEvent` se publica en memoria antes del commit y carece aún de consumidor persistente.
- **Riesgos y pendientes:** los bloqueos se adquieren en el orden de aparición de los ítems del request, por lo que pedidos multi-ítem en orden opuesto podrían causar interbloqueo (*deadlock*) hasta ordenar los IDs antes de bloquear. Asimismo, la violación concurrente de la restricción `UNIQUE` de `clave_idempotencia` requiere traducción explícita a HTTP 409.
- **Verificación:** `PedidoServiceTest` verifica con Mockito las reglas de negocio y que ante error no se invoque `save()` ni `publishEvent()`, y `InventarioYPedidosDataJpaTest` verifica en H2 el modo `PESSIMISTIC_WRITE` y la restricción `UNIQUE`. La prueba concurrente sobre PostgreSQL real queda pendiente para la fase de carga.
