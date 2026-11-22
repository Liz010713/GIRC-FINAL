# ADR-001: Monolito modular con arquitectura en capas

- **Estado:** Aceptada
- **Fecha:** 2026-11-21

## Contexto y problema

GIRC es un MVP académico con un flujo transaccional de consulta de inventario y creación de pedidos. Se requiere separar la API, reglas de negocio y persistencia sin añadir infraestructura distribuida difícil de probar. La mantenibilidad pide aislar cambios de reglas; la integridad exige transacciones para pedido y stock.

## Alternativas evaluadas

1. Arquitectura en capas en un monolito modular.
2. Microservicios separados para catálogo, inventario y pedidos.
3. Arquitectura hexagonal/Clean completa con puertos y adaptadores.

## Decisión tomada

Adoptar un **monolito modular organizado en capas**. React es un cliente SPA separado y Spring Boot es el backend desplegable. El paquete raíz `com.girc` agrupa los casos de catálogo y pedidos.

## Consecuencias y trade-offs

- **Positivas:** despliegue y pruebas simples; una transacción JPA protege pedido y existencias; límites entendibles para el equipo.
- **Negativas:** el escalado se hace para toda la API; un despliegue afecta a todos los módulos; las capas no garantizan por sí solas bajo acoplamiento.
- **Desviación actual:** `PedidoController -> PedidoService -> repositories` respeta el flujo. `ProductoController` accede directamente a `ProductoRepository`; para aplicar estrictamente service layer debe introducirse `ProductoService`.
- No se declara arquitectura hexagonal: no existen puertos/adaptadores para persistencia, correo o pagos.
