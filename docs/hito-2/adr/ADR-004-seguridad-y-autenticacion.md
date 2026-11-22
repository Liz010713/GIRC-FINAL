# ADR-004: Autenticación y autorización de operadores

- **Estado:** Propuesta / brecha identificada
- **Fecha:** 2026-11-21

## Contexto y problema

GIRC recibe `idUsuario` en el request de pedido, pero actualmente no tiene Spring Security, JWT, sesión ni autorización por rol. CORS permite `*`. El `idUsuario` enviado por el cliente no autentica identidad y es manipulable.

## Alternativas evaluadas

1. Spring Security stateless con JWT/OIDC.
2. Sesión web con cookie segura.
3. Mantener API pública, solo para demo local sin datos sensibles.

## Decisión tomada

El MVP académico conserva ejecución local sin autenticación, pero se declara **no apto para publicar con acceso abierto**. Para producción se propone integrar proveedor OIDC/JWT, definir roles (`ADMIN_INVENTARIO`, `VENDEDOR`), tomar el usuario del principal autenticado, retirar CORS wildcard y proteger operaciones de escritura.

## Consecuencias y trade-offs

- **Positivas del MVP:** tests MockMvc y demostración local simples.
- **Negativas:** cualquier cliente que alcance la API puede intentar crear pedidos; el usuario del body no es confiable; faltan auditoría y autorización.
- **Criterios futuros:** tests 401/403, roles probados, secretos externos y CORS restringido a orígenes permitidos.
