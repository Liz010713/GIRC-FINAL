# Unidad 3 · Calidad de software y testing

## Guía de Pruebas Automatizadas · Backend Spring Boot

Referencia del curso suministrada por el equipo. Las pruebas deben seguir **AAA (Arrange, Act, Assert)** y ejecutarse con `mvn test` hasta obtener `BUILD SUCCESS`.

## Servicio · JUnit 5 y Mockito

Probar las reglas de negocio de forma aislada con repositorios simulados mediante `@Mock`.

- Verificar la creación, el cálculo de montos y el estado inicial. La guía usa el anticipo del 50 % de las reservas como ejemplo de cálculo.
- Límite de operaciones (RN-01, 422). Simular que el usuario alcanzó el máximo diario y verificar la excepción sin llamar a `repository.save()`.
- Anticipación (RN-02). Probar valores límite como 1 h 59 min y 2 h 01 min para una regla de dos horas.
- Disponibilidad (RNF-02, 409). Simular un recurso ocupado en la misma franja y comprobar la excepción de conflicto.
- Recurso inexistente o inactivo (404). Simular un ID ausente o deshabilitado y comprobar la excepción.
- Eventos (RNF-04). Comprobar publicación con `verify(..., times(1))` al confirmar y `never()` en errores.

## API · @WebMvcTest y MockMvc

- Enviar campos obligatorios nulos y valores fuera de rango para comprobar HTTP 400 antes de invocar el servicio. La guía cita `@NotNull`, `@Min` y `@Max`.
- Simular excepciones de negocio y comprobar HTTP 409 y 422 y el JSON `ErrorResponse` del `GlobalExceptionHandler`.

## Persistencia · @DataJpaTest con H2

Verificar consultas SQL o JPQL con una base embebida. La guía usa una reserva de 18:00 a 20:00 para comprobar el solapamiento de 19:00 a 21:00, la contigüidad de 20:00 a 21:00 y la exclusión de reservas canceladas.

**Mínimo por equipo:** 3 pruebas unitarias del servicio principal y 1 prueba MockMvc de su controlador.

[Contraste con el backend de GIRC](../docs/hito-2/Documento-Maestro-Parcial-2.md#8-pruebas-automatizadas-y-contraste-con-la-unidad-3).
