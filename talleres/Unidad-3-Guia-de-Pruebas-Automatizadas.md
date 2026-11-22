# Unidad 3 · Calidad de software y testing

## Guía de Pruebas Automatizadas · Backend Spring Boot

Aplicación a GIRC de la guía del curso suministrada por el equipo. Las pruebas deben seguir **AAA (Arrange, Act, Assert)** y ejecutarse con `mvn test` hasta obtener `BUILD SUCCESS`.

## Servicio · JUnit 5 y Mockito

Probar las reglas de negocio de forma aislada con repositorios simulados mediante `@Mock`.

- Verificar la creación del pedido, el total, el descuento de stock y el estado inicial `Pendiente`.
- Comprobar los rechazos por stock insuficiente (422), clave de idempotencia repetida (409) y producto ausente (404). Verificar que el servicio no guarde el pedido ante el rechazo.
- Comprobar publicación de `PedidoCreadoEvent` con `verify(..., times(1))` al confirmar y `never()` en los rechazos probados.

## API · @WebMvcTest y MockMvc

- Enviar campos obligatorios nulos, una cantidad menor a uno o un pedido sin ítems. Comprobar HTTP 400 y ausencia de llamadas al servicio.
- Simular excepciones de negocio y comprobar HTTP 404, 409 y 422 y el JSON `ErrorResponse`. Verificar 201 en el camino exitoso y 200 en la consulta del catálogo.

## Persistencia · @DataJpaTest con H2

Verificar con una base embebida la consulta JPQL de producto y su modo de bloqueo, el guardado de detalles en cascada y la búsqueda y unicidad de la clave de idempotencia. La concurrencia en PostgreSQL requiere una prueba en ese motor.

**Mínimo por equipo:** 3 pruebas unitarias del servicio principal y 1 prueba MockMvc de su controlador.

[Contraste con el backend de GIRC](../docs/hito-2/Documento-Maestro-Parcial-2.md#8-pruebas-automatizadas-y-contraste-con-la-unidad-3).
