# Evidencia comentada de SOLID, patrones y persistencia

Los extractos omiten imports y partes señaladas. Los comentarios explican el código existente.

## SRP y DIP

```java
@RequiredArgsConstructor // Lombok genera el constructor para el campo final.
public class PedidoController {
    private final PedidoService pedidoService; // Contrato que usa el controlador.

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody CrearPedidoRequest request) {
        Pedido pedidoCreado = pedidoService.crearPedido(request); // Delega el caso de uso.
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado); // Contrato HTTP.
    }
}
```

El servicio también usa `@RequiredArgsConstructor` e inyecta `ProductoRepository`, `PedidoRepository` y `ApplicationEventPublisher`. La inversión de dependencias se observa entre controlador y servicio. La capa de aplicación conserva dependencia de Spring Data y Spring Events. `ProductoController` consulta el repositorio directamente. [Controlador](../../backend/src/main/java/com/courtsync/pro/controller/PedidoController.java), [servicio](../../backend/src/main/java/com/courtsync/pro/service/PedidoServiceImpl.java).

## DTO y validación de entrada

```java
@NotEmpty(message = "El pedido debe contener al menos un ítem")
@Valid // Valida los objetos Item contenidos en la lista.
List<Item> items
```

`CrearPedidoRequest` es un record. Exige usuario no nulo, clave no blanca, lista no vacía, ID de producto y cantidad no nulos y cantidad mínima de 1. La longitud máxima de la clave está en JPA y falta en el DTO. El tipo de elemento de la lista tampoco declara `@NotNull`. La respuesta retorna una entidad JPA y queda pendiente verificar su serialización integral con OSIV apagado. [DTO](../../backend/src/main/java/com/courtsync/pro/dto/CrearPedidoRequest.java).

## Repository y bloqueo

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) // Bloqueo de la fila durante la transacción.
    @Query("SELECT p FROM Producto p WHERE p.id = :id")
    Optional<Producto> findByIdWithLock(@Param("id") Long id);
}
```

`PedidoRepository` hereda `save` y agrega la consulta derivada `existsByClaveIdempotencia`. La prueba unitaria verifica las interacciones. La semántica del bloqueo debe verificarse con dos transacciones PostgreSQL. [ProductoRepository](../../backend/src/main/java/com/courtsync/pro/repository/ProductoRepository.java), [PedidoRepository](../../backend/src/main/java/com/courtsync/pro/repository/PedidoRepository.java).

## Transacción y evento de aplicación

```java
@Override
@Transactional // Une cambios de stock, pedido y detalles.
public Pedido crearPedido(CrearPedidoRequest request) {
    // Se omiten consulta de clave, validaciones y construcción de las entidades.
    Pedido pedidoGuardado = pedidoRepository.save(pedido);
    // Publicación durante la transacción, antes de que Spring intente el commit.
    eventPublisher.publishEvent(new PedidoCreadoEvent(
            pedidoGuardado.getId(),
            pedidoGuardado.getCodigoOrden(),
            pedidoGuardado.getIdUsuario(),
            pedidoGuardado.getTotalNeto(),
            pedidoGuardado.getFechaCreacion()));

    return pedidoGuardado;
}
```

Hibernate sincroniza los cambios de productos administrados y la cascada persiste el detalle. La unidad de trabajo revierte ante las excepciones de negocio. La publicación en memoria corresponde al lado emisor de Observer. El evento de pedido carece de consumidor y de garantía de entrega durable. El listener heredado observa reservas después del commit y registra un log. [Servicio](../../backend/src/main/java/com/courtsync/pro/service/PedidoServiceImpl.java), [evento](../../backend/src/main/java/com/courtsync/pro/service/PedidoCreadoEvent.java), [listener heredado](../../backend/src/main/java/com/courtsync/pro/service/NotificacionListener.java).

## Manejo centralizado de errores

```java
@RestControllerAdvice // Spring MVC descubre los manejadores de excepción.
public class GlobalExceptionHandler {
    // Se omiten los demás manejadores y la construcción común de ErrorResponse.
    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(
                    StockInsuficienteException ex,
                    HttpServletRequest request
    ) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "STOCK_INSUFICIENTE", ex.getMessage(), request);
    }
}
```

El servicio expresa el rechazo mediante una excepción y el advice determina HTTP 422. Los demás manejadores cubren entrada inválida, producto ausente y clave existente. El Builder de Lombok facilita crear entidades. La implementación carece de Factory de dominio explícita y Strategy en este flujo. [Advice](../../backend/src/main/java/com/courtsync/pro/exception/GlobalExceptionHandler.java).
