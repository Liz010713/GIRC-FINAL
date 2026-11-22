# Documento Maestro — Parcial 2

**GIRC · Gestión Integral de Recursos y Comercialización**

| Dato | Equipo |
|---|---|
| Asignatura | Ingeniería de Software II |
| Docente | Yan Angarita Sanguino |
| Integrantes | Jackeline Pérez Parada y Juana Lizett González |
| Institución | Tecnológico de Antioquia (TdeA) – Institución Universitaria |
| Fecha de revisión | 22 de noviembre de 2026 |

Los datos de portada se tomaron de los Talleres 3 y 12. El material de curso consolidado incluye el enunciado aportado por el equipo. [Enunciado del Parcial 2](../../talleres/Parcial-2-Enunciado.md), [repositorio de GIRC en GitHub](https://github.com/jackelineperez/GIRC).

## 1. Alcance de la entrega

GIRC permite consultar existencias y registrar pedidos comerciales. El operador selecciona productos y cantidades en React. Spring Boot valida la solicitud, rechaza claves repetidas, bloquea filas de producto para evaluar el stock, calcula los importes, persiste el pedido y publica un evento de aplicación.

La plantilla original del profesor aporta las entidades Jugador, Cancha y Reserva, sus tablas, el flujo de disponibilidad y reservas, y sus pruebas. Las rutas heredadas son `GET /api/v1/canchas/disponibilidad` y `POST /api/v1/reservas`. El paquete `com.courtsync.pro` conserva el nombre histórico. [Controladores](../../backend/src/main/java/com/courtsync/pro/controller).

### Contrato HTTP implementado

| Método y ruta | Entrada y resultado |
|---|---|
| GET /api/v1/productos | 200 con lista de productos y stock. Llama a `findAll()`. El filtrado visible ocurre en React. |
| POST /api/v1/pedidos | JSON con `idUsuario`, `claveIdempotencia` e `items [{idProducto, cantidadSolicitada}]`. Devuelve 201 con la entidad Pedido serializada cuando termina la transacción correctamente. |

| HTTP | Cuándo se produce | Evidencia |
|---|---|---|
| 400 | JSON ilegible o falla de validación del DTO. MVC corta el flujo antes del servicio. | `PedidoControllerTest`, `GlobalExceptionHandler` |
| 404 | El producto consultado no existe. | `PedidoServiceTest` cubre la excepción. El advice define el HTTP 404. |
| 409 | La consulta inicial encuentra la clave de idempotencia. | `PedidoServiceTest`, `PedidoControllerTest` |
| 422 | Un ítem supera las existencias restantes de su producto. | `PedidoServiceTest`, `PedidoControllerTest` |
| 201 | Servicio y commit exitosos. El código de orden usa prefijo `ORD-` y UUID. | `PedidoControllerTest` con servicio simulado |

El advice construye `ErrorResponse(timestamp, status, error, message, path)`. La SPA usa el mensaje devuelto. Bloquea el botón mientras procesa el envío y genera un UUID nuevo por confirmación. Una clave repetida se rechaza con 409 si ya es visible en la consulta, sin reproducir la respuesta anterior. La carrera entre solicitudes con la misma clave se protege mediante UNIQUE, pero la violación concurrente carece de traducción explícita a 409. [React](../../frontend/src/App.tsx), [cliente HTTP](../../frontend/src/services/gircApi.ts), [advice](../../backend/src/main/java/com/courtsync/pro/exception/GlobalExceptionHandler.java).

### Contraste con las referencias del curso

| Referencia | Resultado del contraste |
|---|---|
| Talleres 1 y 2, dominio y reglas | El caso comercial de consultar existencias y registrar pedidos tiene implementación. Las reglas de gestión, despacho y auditoría requieren código adicional. |
| Taller 3, RNF | Se conserva cada ID y se indica si tiene mecanismo o medición en la matriz del anexo. El CHECK de stock de la propuesta requiere verificación física. |
| Taller 9 y Actividad 10, UI y mapeo REST | La SPA actual cubre inventario y pedidos. Portal de acceso, KPI, registro de productos por API, reportes y exportación siguen como propuestas. |
| Taller 11, contrato OpenAPI | El documento incluye JWT y rutas aún pendientes. Esta sección registra las rutas operativas y los cuatro errores del pedido. |
| Taller 12, C4 y arquitectura | Se conserva el estilo en capas. Las vistas actualizadas usan React, Nginx, Spring Boot y PostgreSQL y reflejan las dependencias del código. |
| db.pdf | El modelo previo propone roles, usuarios, categorías y movimientos de inventario. El núcleo JPA actual usa productos, pedidos y detalles y guarda el usuario como escalar sin FK. |
| Captura Mermaid de talleres | El flujo previo propone JWT, notificación SMTP y 409 cuando se agota el stock. El flujo actual devuelve 409 por clave existente y 422 por stock insuficiente, crea en estado Pendiente y publica un evento en memoria. |

La correspondencia con el contrato del Taller 11 es parcial.

| Historia y operación propuesta | Estado en el repositorio |
|---|---|
| HU-01 · POST /api/v1/auth/login | Brecha. Autenticación, JWT y bloqueo 429 pendientes. |
| HU-02 · GET /api/v1/admin/kpis | Brecha. Consola y API de indicadores pendientes. |
| HU-03 · POST /api/v1/productos | Brecha. El SKU es único en JPA. El alta HTTP queda pendiente. |
| Consulta de existencias · GET /api/v1/productos | Implementada. El Taller 11 la etiqueta HU-04 y la Actividad 10 la asocia a HU-03. |
| HU-04 · POST /api/v1/pedidos | Implementada en el alcance descrito arriba. Autorización JWT pendiente. |
| HU-05 · GET /api/v1/reportes/ventas y /exportar | Brecha. Consulta, auditoría y exportación comercial pendientes. |

Las reglas del Taller 2 tienen su propia numeración. El taller registra creación de pedido como HU-02 y el contrato del Taller 11 usa HU-04 para esa operación.

| Reglas de negocio del Taller 2 | Contraste con GIRC |
|---|---|
| RN-01.1 y RN-01.2 · SKU único y mínimo de stock positivo | `Producto` declara unicidad del SKU y `@Min(1)` para `stockMinimo`. El alta comercial por HTTP sigue pendiente. |
| RN-02.1 y RN-02.2 · Rechazo por falta de stock y descuento al confirmar | `PedidoServiceImpl` comprueba y descuenta existencias en la transacción. El estado inicial real es `Pendiente`. El taller proponía `Reservado`. |
| RN-03.1 y RN-03.2 · Motivo y saldo de ajustes manuales | El flujo de ajustes manuales queda pendiente. La validación de saldo del pedido pertenece a RN-02.1. |
| RN-04.1 y RN-04.2 · Umbral y agotamiento | El pedido cambia el producto a `Crítico` si queda stock hasta el mínimo y a `Agotado` si llega a cero. La alerta por canal externo queda pendiente. |
| RN-05.1 y RN-05.2 · Rango de fechas y estados para reportes | Los filtros y la generación de reportes comerciales quedan pendientes. |

[Entidad Producto](../../backend/src/main/java/com/courtsync/pro/domain/entity/Producto.java), [servicio de pedidos](../../backend/src/main/java/com/courtsync/pro/service/PedidoServiceImpl.java).

## 2. Estilo arquitectónico y atributos de calidad

El backend es un **monolito modular en capas**, con un solo proceso Spring Boot y separación lógica por `controller`, `service`, `repository`, `domain.entity`, `dto` y `exception`. Los paquetes son técnicos. La separación entre GIRC y plantilla es funcional dentro del mismo proceso. React se despliega aparte con Nginx. Una transacción local coordina las escrituras de stock, pedido y detalles.

Los microservicios repartirían despliegues y agregarían coordinación para sostener la integridad de stock. Una arquitectura hexagonal explícita aportaría puertos de dominio independientes de Spring Data y exigiría introducir adaptadores. En el alcance actual las capas permiten probar el servicio con dobles y desplegar una sola API. El escalado de la API se hace como unidad y el catálogo accede al repositorio directamente. [ADR de estilo](adr/ADR-001-monolito-modular-en-capas.md).

La integridad se apoya en transacciones, bloqueo y unicidad. La mantenibilidad se apoya en el DTO de entrada y las responsabilidades del flujo de pedido. Los objetivos de latencia, concurrencia y usabilidad de los talleres siguen pendientes de medición. [Trazabilidad RNF](Trazabilidad-RNF.md).

## 3. Modelo C4

| Vista | Lectura |
|---|---|
| Contexto | El operador comercial consulta existencias y registra pedidos. El límite representa GIRC como sistema completo. |
| Contenedores | SPA React/TypeScript en el navegador, Nginx como servidor y proxy, API Java 21/Spring Boot 3.4.3, PostgreSQL 16 mediante JDBC. |
| Componentes de la API | Spring MVC valida el DTO, los controladores reciben HTTP y `PedidoServiceImpl` ejecuta el caso de uso con los repositorios. El advice resuelve excepciones y el publisher emite el evento. |

[Vista de diagramas y fuentes Mermaid](diagramas.md).

## 4. UML

- **Clases.** `Pedido` compone 0..* detalles en el modelo de persistencia, cada detalle pertenece a un pedido y referencia un producto. El DTO exige 1..* ítems. La plantilla tiene una relación de muchas reservas a una cancha. Ambos identificadores de usuario son escalares. Las operaciones de stock están en el servicio. [Fuente](diagrams/uml-clases-dominio.mmd).
- **Secuencia.** Los bloques `alt` muestran los caminos excluyentes de 400, 409, 404, 422 y 201. Se toma un bloqueo por producto distinto en el orden de primera aparición, se comprueba el stock acumulado de líneas repetidas y se modifica inventario después de validar todas las líneas. `PedidoCreadoEvent` se publica durante la transacción antes del commit. El 201 requiere que el commit concluya. [Fuente](diagrams/uml-secuencia-crear-pedido.mmd).
- **Despliegue.** Compose publica Nginx (80), API (8080) y PostgreSQL (5432), con volumen `postgres_data` y healthcheck de la base que condiciona el arranque de la API. Vite usa 5173 y su propio proxy en desarrollo. La vista también muestra la topología de producción propuesta para el parcial: un VPS con Nginx como único punto público HTTPS y API y PostgreSQL en red privada. TLS, secretos externos y copias de seguridad siguen pendientes. [Fuente](diagrams/uml-despliegue.mmd), [Compose](../../docker-compose.yml), [configuración Vite](../../frontend/vite.config.ts).

## 5. Diseño de datos y persistencia

`productos`, `pedidos` y `detalles_pedido` forman el núcleo comercial. El esquema declara PK identity, SKU/código de orden/clave únicos y dos FKs obligatorias de detalle. Los importes usan `BigDecimal` y precisión 12,2. Las dos relaciones de detalle son LAZY. GIRC usa estados String, mientras el legado usa enums persistidos como texto. Los índices compuestos explícitos apoyan consultas heredadas de reservas. Hibernate actualiza el esquema y ejecuta semilla PostgreSQL. Las migraciones versionadas y la inspección física del DDL quedan pendientes. [Diccionario de datos y ORM](persistencia/diccionario-datos.md).

## 6. Código limpio, SOLID y patrones

El caso de pedido separa HTTP, reglas, acceso a datos y errores. `@RequiredArgsConstructor` inyecta contratos y el DIP es parcial porque el servicio usa tipos de Spring. El DTO aísla el contrato de entrada. Los repositorios abstraen CRUD y consultas. `@Transactional` delimita la unidad de trabajo. El publisher desacopla la emisión del evento de su consumo. El código de GIRC carece de consumidor de pedidos. El listener de la plantilla recibe exclusivamente `ReservaCreadaEvent` y escribe un log después del commit. [Fragmentos comentados](Evidencia-SOLID-y-patrones.md).

## 7. Decisiones arquitectónicas

1. [ADR-001 · Monolito modular en capas](adr/ADR-001-monolito-modular-en-capas.md), aceptada.
2. [ADR-002 · Transacciones y bloqueo pesimista](adr/ADR-002-transacciones-y-bloqueo-pesimista.md), aceptada.
3. [ADR-003 · PostgreSQL y JPA](adr/ADR-003-postgresql-y-jpa.md), aceptada.
4. [ADR-004 · Autenticación y autorización](adr/ADR-004-seguridad-y-autenticacion.md), propuesta.

## 8. Pruebas automatizadas y contraste con la Unidad 3

La **Guía de Pruebas Automatizadas de la Unidad 3**, suministrada por el equipo, fija un mínimo de **3 pruebas unitarias del servicio principal y 1 prueba MockMvc de su controlador**. GIRC supera esa meta con **4 pruebas de `PedidoServiceTest` y 6 de `PedidoControllerTest`**. Una prueba adicional de `ProductoControllerTest` lleva el total de GIRC a 11. La guía se usa aquí como evidencia complementaria al enunciado del Parcial 2, que centra la entrega en arquitectura, modelado, persistencia y código limpio. [Enunciado del examen](../../talleres/Parcial-2-Enunciado.md), [guía de la Unidad 3](../../talleres/Unidad-3-Guia-de-Pruebas-Automatizadas.md).

### Ejecución en verde

El 22 de noviembre de 2026, Maven ejecutó la fase `test` con Java 21 desde el repositorio: **BUILD SUCCESS, 21 pruebas, 0 fallos, 0 errores y 0 omitidas**. Maven deja los informes de Surefire en `backend/target/surefire-reports/`.

```powershell
mvn -f backend/pom.xml test
```

El frontend también pasó `npm ci` y `npm run build` en la verificación previa. Ese trabajo valida TypeScript y el empaquetado de Vite. [Flujo de CI](../../.github/workflows/ci.yml).

### Cobertura por criterio

| Criterio de la guía | GIRC · 11 pruebas | Plantilla del profesor · 10 pruebas |
|---|---|---|
| Servicio · JUnit 5 y Mockito | `PedidoServiceTest` (4). Cálculo, descuento y publicación. También verifica los rechazos por falta de stock, producto ausente y clave repetida. | `ReservaServiceTest` (5). Creación, anticipo, anticipación, choque de horarios y límite de reservas. |
| API · `@WebMvcTest` y MockMvc | `PedidoControllerTest` (6): tres validaciones 400, 409, 422 y 201. `ProductoControllerTest` (1): 200 y campos de inventario. Controladores con servicio o repositorio simulado mediante `@MockitoBean`. | `ReservaControllerIntegrationTest` (2): 400 de validación y 409 por choque de horario, con servicio simulado. |
| Persistencia · `@DataJpaTest` y H2 | Pendiente una prueba de repositorio o consulta específica para productos y pedidos. | `ReservaRepositoryDataJpaTest` (3): solapamiento parcial, horarios contiguos y exclusión de reservas canceladas. Usa BD embebida y `TestEntityManager`. |

### Correspondencia con los escenarios de la guía

| Escenario | Evidencia del backend activo |
|---|---|
| Camino feliz y estado inicial | El servicio GIRC calcula el total, descuenta el stock y comprueba el estado `Pendiente`. MockMvc comprueba el HTTP 201. El anticipo del 50 % se prueba en el servicio de reservas heredado. |
| Límite diario y anticipación | La plantilla prueba el límite de dos reservas activas y la regla temporal. A 1 h 59 min rechaza antes de buscar la cancha. A 2 h 01 min supera la regla temporal y la prueba termina con cancha ausente. Estos escenarios corresponden a reservas. |
| Disponibilidad y conflictos | La plantilla prueba el choque de horario y su HTTP 409. En GIRC, stock insuficiente se traduce a 422 y clave de idempotencia existente a 409. |
| Recurso inexistente o inactivo | GIRC comprueba la excepción por producto ausente en el servicio. El catálogo carece de un campo de activación del producto. |
| Eventos | GIRC verifica una publicación de `PedidoCreadoEvent` en el camino feliz y ninguna en cada rechazo probado. La comprobación observa el publicador simulado. |
| Entrada 400 y formato de errores | MockMvc comprueba cantidad cero, campos obligatorios ausentes o inválidos y lista vacía, sin llamadas al servicio. Los casos 409 y 422 verifican el código HTTP y campos de `ErrorResponse`. |
| Consultas de solapamiento | Las tres pruebas JPQL con H2 corresponden al módulo heredado de reservas. |

### Ejemplo AAA en GIRC

En `PedidoServiceTest.crearPedido_CaminoFeliz_CalculaTotalYDescuentaStock`, la fase **Arrange** prepara stock de 10, un pedido de 4 unidades y respuestas simuladas de los repositorios. **Act** llama a `pedidoService.crearPedido(request)`. **Assert** comprueba total de 50,00, stock restante de 6, estado del producto `Crítico`, una llamada a `save` y una publicación de `PedidoCreadoEvent`. Los casos de excepción agrupan Act y Assert con `assertThatThrownBy`. Las pruebas web de GIRC agrupan la llamada y las comprobaciones HTTP con `perform(...).andExpect(...)`. [Servicio](../../backend/src/test/java/com/courtsync/pro/service/PedidoServiceTest.java), [API pedidos](../../backend/src/test/java/com/courtsync/pro/controller/PedidoControllerTest.java), [API productos](../../backend/src/test/java/com/courtsync/pro/controller/ProductoControllerTest.java), [JPA de la plantilla](../../backend/src/test/java/com/courtsync/pro/repository/ReservaRepositoryDataJpaTest.java).

### Brechas de cobertura

- **Contrato HTTP.** El servicio unitario cubre `RecursoNoEncontradoException` y el advice define HTTP 404. Falta un caso MockMvc que verifique ese estado y su cuerpo para pedidos.
- **Persistencia GIRC.** Falta probar las consultas de producto y pedido, el guardado en cascada y las restricciones del esquema. El test JPA existente usa H2 para reservas heredadas.
- **Transacción en PostgreSQL.** Falta probar el bloqueo real con solicitudes concurrentes, rollback del pedido y stock, y duplicados simultáneos. Mockito verifica invocaciones a colaboradores, mientras MockMvc comprueba el contrato web con esos colaboradores simulados.
- **Flujo completo.** Falta verificar la serialización del pedido persistido con OSIV apagado y medir los escenarios de carga definidos por los RNF.

## 9. Brechas antes de producción

| Área | Trabajo pendiente |
|---|---|
| Identidad | Autenticación, autorización, origen confiable de `idUsuario`, CORS restringido y TLS. |
| Integridad | Controlar duplicados concurrentes en la respuesta HTTP, definir orden estable de bloqueos y probar PostgreSQL. Validar tamaños y elementos nulos del DTO. |
| API y datos | DTOs de salida, migraciones, verificación de CHECK e índices, paginación de catálogo según perfil de uso. |
| Eventos | Adoptar consumo después de commit y entrega durable si el caso lo exige. El proyecto carece de SMTP real y de integración de pagos. |
| Operación | Secretos externos, restauración de backups, métricas y pruebas de carga. |

La entrega consta del PDF o el Word consolidado y del repositorio con las fuentes de los diagramas y los ADRs en `docs/hito-2`. [Repositorio de la entrega](https://github.com/jackelineperez/GIRC).

| Requisito del examen | Dónde se acredita |
|---|---|
| Estilo y RNF, tres vistas C4 | Secciones 2–3 y anexos de diagramas y trazabilidad RNF |
| Tres vistas UML, incluidos errores y producción | Sección 4 y anexo de diagramas. Producción se presenta como propuesta. |
| Diccionario y ORM/JPA | Sección 5 y anexo de datos |
| Código limpio, patrones y mínimo tres ADRs | Secciones 6–7 y anexos de código y decisiones. Hay tres ADRs aceptados y uno propuesto. |
| Documento consolidado y repositorio | PDF o Word consolidado, fuentes Mermaid y ADRs en `docs/hito-2`, y código Spring Boot en `backend` |
