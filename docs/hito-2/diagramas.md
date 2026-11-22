# Diagramas C4 y UML de GIRC

| Vista | Fuente Mermaid | Figura |
|---|---|---|
| C4 · Contexto | [Mermaid](diagrams/c4-contexto.mmd) | [SVG](rendered/c4-contexto.svg) |
| C4 · Contenedores | [Mermaid](diagrams/c4-contenedores.mmd) | [SVG](rendered/c4-contenedores.svg) |
| C4 · Componentes del backend | [Mermaid](diagrams/c4-componentes-backend.mmd) | [SVG](rendered/c4-componentes-backend.svg) |
| UML · Clases | [Mermaid](diagrams/uml-clases-dominio.mmd) | [SVG](rendered/uml-clases-dominio.svg) |
| UML · Secuencia de pedido | [Mermaid](diagrams/uml-secuencia-crear-pedido.mmd) | [SVG](rendered/uml-secuencia-crear-pedido.svg) |
| UML · Despliegue local y propuesta de producción | [Mermaid](diagrams/uml-despliegue.mmd) | [SVG](rendered/uml-despliegue.svg) |

La vista de clases muestra `Producto`, `Pedido`, `DetallePedido` y el servicio que registra el pedido. La vista de secuencia se lee de arriba abajo. Después de validar el JSON, el servicio comprueba la clave y, por cada línea, existencia y stock. El primer rechazo termina el trabajo de la transacción. La figura de despliegue separa Compose local de la topología propuesta para producción. [Documento Maestro](Documento-Maestro-Parcial-2.md).
