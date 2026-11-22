# Trazabilidad de requisitos no funcionales

Se conservan los IDs del Taller 3. El Taller 12 reutiliza RNF-04 para idempotencia y RNF-05 para auditoría.

| RNF del Taller 3 | Objetivo propuesto | Mecanismo observado | Verificación pendiente |
|---|---|---|---|
| RNF-01 · Rendimiento | Catálogo P95 < 300 ms con 150 consultas concurrentes | `GET /productos` llama `findAll()`, la SPA filtra en cliente | Carga sobre la ruta real, paginación, proyecciones e índices según resultados |
| RNF-02 · Concurrencia | Cero sobreventa y rechazo < 200 ms | Transacción, bloqueo pesimista, validación con stock acumulado | Prueba concurrente PostgreSQL, latencia, CHECK físico y orden de locks |
| RNF-03 · Seguridad | 429 < 150 ms y bloqueo de 15 min tras 5 fallos | Validación de entrada, CORS abierto para API local | Implementar identidad y control de acceso antes de medir el escenario |
| RNF-04 · Resiliencia | Confirmación < 500 ms, cero rollbacks por SMTP y hasta 3 reintentos | Publicación de evento en memoria dentro de la transacción | Listener de pedido, transporte, política de reintentos y prueba de fallos |
| RNF-05 · Usabilidad | Botón deshabilitado < 100 ms y máximo un POST con latencia > 300 ms | Estado de envío y botón deshabilitado en React | E2E con doble clic y latencia, conservación de la clave ante reintentos |

| Uso adicional en Taller 12 | Estado observado |
|---|---|
| RNF-01 · KPI en menos de 300 ms | Endpoint de KPI pendiente |
| RNF-04 · Idempotencia | Consulta previa, UQ y 409 si la clave existe. Falta traducir la violación concurrente y reutilizar la clave en un reintento desde la SPA. |
| RNF-05 · Auditoría | Filtro de ventas y exportaciones XLSX/PDF pendientes. |
