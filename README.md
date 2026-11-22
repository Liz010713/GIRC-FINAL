# GIRC

**Sistema de Gestión Integral de Recursos y Comercialización**

GIRC permite consultar el inventario, revisar niveles de stock y registrar pedidos de varios productos desde una consola web. El backend calcula el total neto, valida disponibilidad bajo bloqueo transaccional, descuenta existencias y publica un evento de pedido creado.

## Tecnologías

- Java 21 y Spring Boot 3.4
- Spring Data JPA y PostgreSQL 16
- React 18, TypeScript y Vite
- JUnit 5, Mockito, MockMvc y H2
- Docker Compose

## Funcionalidad actual

- `GET /api/v1/productos`: listado de productos con SKU, precio, existencias, mínimo y estado.
- `POST /api/v1/pedidos`: crea pedidos con uno o más productos.
- Reglas de inventario: no permite solicitar más unidades que las disponibles; actualiza el producto a `Disponible`, `Crítico` o `Agotado`.
- Idempotencia: rechaza una clave reutilizada con HTTP 409.
- Errores estandarizados en `ErrorResponse`: 400 para validaciones, 404 para producto ausente y 422 para stock insuficiente.
- La interfaz permite buscar por nombre/SKU, filtrar por estado, armar el pedido y ver su confirmación.

## Ejecutar localmente

### Backend

Configura PostgreSQL y las variables de entorno antes de iniciar la aplicación:

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/girc_db"
$env:SPRING_DATASOURCE_USERNAME = "girc"
$env:SPRING_DATASOURCE_PASSWORD = "<tu contraseña local>"
cd backend
mvn spring-boot:run
```

La aplicación publica su API en `http://localhost:8080`.

### Frontend

En otra terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abre la dirección que Vite indique, normalmente `http://localhost:5173`. Vite reenvía `/api/v1` al backend local.

## Ejecutar pruebas

Desde `backend`:

```powershell
mvn test
```

Desde `frontend`:

```powershell
npm ci
npm run build
```

## Docker Compose

Copia `.env.example` a `.env`, cambia `DB_PASSWORD` por una contraseña local propia y levanta los servicios:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

- Interfaz: `http://localhost`
- API: `http://localhost:8080/api/v1`
- PostgreSQL: `localhost:5432`

El archivo `.env` está excluido de Git. No uses las credenciales de ejemplo en un entorno publicado.

## Arquitectura y diseño — Parcial 2

- [Documento Maestro GIRC](docs/hito-2/Documento-Maestro-Parcial-2.md)
- [Documento consolidado PDF](docs/hito-2/Documento-Maestro-Parcial-2.pdf) · [Word](docs/hito-2/Documento-Maestro-Parcial-2.docx)
- [Diagramas C4 y UML renderizados](docs/hito-2/diagramas.md)
- [Diccionario de datos y mapeo JPA](docs/hito-2/persistencia/diccionario-datos.md)
- [ADRs](docs/hito-2/Documento-Maestro-Parcial-2.md#7-decisiones-arquitectónicas)
- [Guía de exportación PDF/Word](scripts/hito-2/README-exportacion.md)

## Estructura

El backend usa el paquete raíz `com.girc` y organiza el código por `controller`, `domain.entity`, `dto`, `exception`, `repository` y `service`. La aplicación gestiona inventario y pedidos comerciales. Una base de datos vacía se inicializa con las tres tablas de GIRC y el catálogo de demostración. Para una instalación previa, `ddl-auto=update` conserva las tablas existentes. La depuración del esquema requiere una migración independiente que preserve los datos de GIRC.
