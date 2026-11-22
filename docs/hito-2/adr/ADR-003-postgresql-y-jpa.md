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

PostgreSQL 16 para ejecución con Docker Compose y Spring Data JPA para persistencia de productos, pedidos y detalles. H2 se usa con `@DataJpaTest`. El modelo declara PK, `UNIQUE`, `NOT NULL` y FK. Las PK y restricciones de unicidad respaldan la búsqueda por ID y por clave de idempotencia.

## Consecuencias y trade-offs

- **Positivas:** ACID, FKs, importes GIRC en `BigDecimal/NUMERIC(12,2)` y soporte de bloqueos.
- **Negativas:** `data.sql` usa `ON CONFLICT` de PostgreSQL. La prueba con H2 desactiva ese script porque prepara sus propios datos.
- **Riesgo:** `ddl-auto=update` agrega o actualiza el esquema según los mapeos y conserva tablas preexistentes. La depuración de instalaciones previas requiere una migración controlada.
- **Verificación:** las pruebas JPA con H2 comprueban el modo de bloqueo aplicado por el repositorio, la persistencia en cascada y la búsqueda y unicidad de idempotencia. El motor PostgreSQL y la concurrencia quedan pendientes de verificación.
- **Siguiente paso:** adoptar Flyway/Liquibase, versionar DDL e índices y ejecutar pruebas de integración contra PostgreSQL en CI.
