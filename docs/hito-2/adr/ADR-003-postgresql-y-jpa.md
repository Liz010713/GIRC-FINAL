# ADR-003: PostgreSQL y Spring Data JPA

- **Estado:** Aceptada
- **Fecha:** 2026-11-21

## Contexto y problema

El sistema necesita relaciones referenciales entre pedidos, detalles y productos, unicidad de SKU/idempotencia y transacciones con bloqueo de filas. También se busca una base embebida para pruebas.

## Alternativas evaluadas

1. PostgreSQL + Spring Data JPA/Hibernate.
2. MySQL/MariaDB + JPA.
3. Base documental con consistencia de stock gestionada por aplicación.

## Decisión tomada

PostgreSQL 16 para ejecución con Docker Compose y Spring Data JPA para persistencia. H2 se usa con `@DataJpaTest`. Las entidades declaran PK, `UNIQUE`, `NOT NULL`, FKs e índices de las consultas heredadas de reservas.

## Consecuencias y trade-offs

- **Positivas:** ACID, FKs, importes GIRC en `BigDecimal/NUMERIC(12,2)` y soporte de bloqueos.
- **Negativas:** `data.sql` usa SQL PostgreSQL (`ON CONFLICT`, `setval`), por lo que se desactiva en pruebas H2; pueden existir diferencias de dialecto.
- **Riesgo:** `ddl-auto=update` no es migración reproducible para producción.
- **Verificación:** la prueba JPA con H2 cubre consultas heredadas y mostró CHECK generados para los mínimos de stock. El catálogo físico de PostgreSQL y el comportamiento concurrente del flujo GIRC quedan pendientes de verificación.
- **Siguiente paso:** adoptar Flyway/Liquibase, versionar DDL e índices y ejecutar pruebas de integración contra PostgreSQL en CI.
