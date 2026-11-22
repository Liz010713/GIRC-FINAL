# ADR-002 · Transacciones y bloqueo pesimista de existencias

**Estado:** aceptada  
**Fecha de registro:** 2026-11-21

## Contexto y alternativas

Dos transacciones pueden competir por las últimas unidades. Se evaluó el bloqueo pesimista con JPA, el bloqueo optimista con `@Version` y reintentos, y la actualización SQL condicional con comprobación de filas afectadas.

## Decisión

`PedidoServiceImpl.crearPedido()` usa `@Transactional` y comprueba primero la existencia de la clave de idempotencia. `ProductoRepository.findByIdWithLock()` toma un bloqueo `PESSIMISTIC_WRITE` por ID distinto. El servicio valida todas las líneas y considera el consumo acumulado cuando un producto aparece varias veces. Después modifica entidades administradas, guarda el agregado y publica `PedidoCreadoEvent` antes del commit. Una excepción de negocio provoca rollback.

## Consecuencias

- Stock, pedido y detalles comparten una transacción local. El bloqueo mantiene estable la fila durante la validación y escritura.
- Los locks siguen el orden de aparición de los productos. Pedidos multítem en orden opuesto pueden provocar interbloqueos. El orden estable y la prueba de concurrencia en PostgreSQL están pendientes.
- La restricción UNIQUE protege claves duplicadas concurrentes. El 409 explícito corresponde a la detección previa y queda pendiente traducir la violación de unicidad concurrente.
- El evento es local, en memoria y carece de listener GIRC. Si se necesita entrega durable, queda por evaluar un Outbox transaccional.
- Los tests del servicio usan Mockito. Verifican las ramas de negocio y que ante stock insuficiente no se invoque `save` ni el publisher.
