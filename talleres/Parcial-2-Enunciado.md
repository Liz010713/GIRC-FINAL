Parcial 2: Arquitectura de Software, Modelado
C4 y UML, Diseño de Datos y Código Limpio
Objetivo del Taller:
Consolidar la arquitectura técnica y el diseño interno del proyecto formativo
desarrollado por cada equipo, integrando de manera coherente la selección y
justificación del estilo arquitectónico, los tres niveles del Modelo C4, el modelado
UML esencial para producción, el diseño de persistencia (Diccionario de Datos y
mapeo ORM/JPA), la aplicación de principios de diseño limpio (SOLID y Patrones
de Diseño) y los registros de decisiones arquitectónicas (ADRs).
Modalidad de Trabajo:
• Modalidad: Grupal (según los equipos de proyecto previamente conformados).
• Alcance: Evaluación integral aplicada a la totalidad de los módulos críticos del
sistema propuesto por cada grupo, manteniendo trazabilidad estricta con los
requerimientos, historias de usuario, RNF y contratos OpenAPI definidos
previamente.
Componentes y Requisitos del Parcial 2:
1. Vista Arquitectónica y Modelo C4 (Diagrams as Code)
Se debe definir y representar la estructura macro y micro del sistema siguiendo el
estándar del Modelo C4 y su conexión directa con los Atributos de Calidad (RNF):
• Justificación del Estilo Arquitectónico: Seleccionar y argumentar
técnicamente el estilo arquitectónico adoptado por el equipo (Arquitectura en
Capas, Monolito Modular o Arquitectura Hexagonal / Clean Architecture),
explicando cómo responde a los RNF críticos del proyecto (concurrencia,
rendimiento, seguridad y mantenibilidad).
• Nivel 1 – Diagrama de Contexto: Representa el sistema como una unidad
central rodeada por los actores (roles de usuario) y los sistemas externos con
los que interactúa (pasarelas de pago, servicios de correo, APIs de terceros).
• Nivel 2 – Diagrama de Contenedores: Descompone el sistema en sus
unidades desplegables y almacenes de datos independientes (ej. SPA en React,
API REST en Spring Boot, Base de Datos PostgreSQL), especificando
tecnologías y protocolos de comunicación.
• Nivel 3 – Diagrama de Componentes: Detalla la organización interna de
paquetes y módulos dentro del contenedor Backend (filtros de seguridad,
controladores REST, servicios de negocio, repositorios y escuchas de eventos).
Herramientas válidas: Los diagramas deben elaborarse preferiblemente mediante
diagramación como código (Mermaid.js o PlantUML) integrados en el repositorio, o
en Draw.io en alta resolución.
2. Modelado UML Esencial para Producción
Elaborar las tres vistas UML clave que respaldan la implementación del código, las
pruebas de integración y la infraestructura de despliegue:
• Diagrama de Clases de Dominio: Modelado completo de las entidades del
negocio con sus atributos tipados, enumeraciones de estado (Enum), métodos
de dominio relevantes y cardinalidades exactas (1:1, 1:N, N:M).
• Diagrama de Secuencia Full Stack: Representación cronológica completa del
flujo transaccional más crítico del proyecto, trazando la comunicación de extremo
a extremo (Frontend React -> Controller -> Service -> Repository -> Base de
Datos). Debe incluir obligatoriamente bloques alternativos (alt / opt) que
evidencien el manejo de excepciones y respuestas HTTP de error (ej. 409
Conflict, 422 Unprocessable Entity).
• Diagrama de Despliegue (Deployment Diagram): Representación física o en
la nube de la arquitectura de producción (nodos de servidor/VPS, proxy inverso
con SSL, contenedores Docker para Frontend, Backend y motor de Base de
Datos).
3. Diseño de Persistencia, Diccionario de Datos y Mapeo
ORM (JPA)
Documentar e implementar la capa de persistencia garantizando integridad
referencial, rendimiento y coherencia total con los campos de los contratos API:
• Diccionario de Datos: Tabla técnica detallada de las entidades principales del
sistema especificando: nombre de columna, tipo de dato SQL exacto
(PostgreSQL/MySQL), restricciones (PK, FK, NOT NULL, UNIQUE, CHECK),
índices compuestos para consultas frecuentes, descripción funcional y anotación
de mapeo ORM correspondiente.
• Mapeo Objeto-Relacional (ORM / Spring Data JPA): Implementación en el
código fuente del backend de las clases @Entity y sus interfaces JpaRepository,
aplicando buenas prácticas como carga perezosa (FetchType.LAZY), mapeo
seguro de enumeraciones (@Enumerated(EnumType.STRING)) y definición de
índices.
4. Diseño Limpio (SOLID / Patrones) y Registros de
Decisiones Arquitectónicas (ADRs)
Aplicación de Principios SOLID y Patrones de Diseño: El código fuente del
backend debe evidenciar separación estricta de responsabilidades entre paquetes
(controller, service, repository, domain, dto, exception), inyección de dependencias
por constructor, manejo centralizado de errores (@RestControllerAdvice) y la
aplicación explícita de al menos un patrón de diseño (DTO, Repository, Strategy,
Factory u Observer/EventListener).
Registros de Decisiones Arquitectónicas (ADRs): Redactar mínimo tres (3)
ADRs documentando las decisiones técnicas más relevantes del proyecto (ej.
elección del estilo arquitectónico, estrategia de control de concurrencia o
transacciones, esquema de autenticación/seguridad o selección de motor de base
de datos). Cada ADR debe contener: Título y Estado, Contexto y Problema,
Alternativas Evaluadas, Decisión Tomada y Consecuencias (Trade-offs positivos y
negativos).
Entregables
Cada equipo deberá realizar una única entrega consolidada que contenga:
• 1. Documento Maestro del Parcial 2 (PDF o Word): Portada con nombre del
proyecto e integrantes; justificación del estilo arquitectónico; los 3 diagramas del
Modelo C4; los 3 diagramas UML (Clases, Secuencia con flujos alternos y
Despliegue); el Diccionario de Datos completo; los 3 ADRs documentados; y
capturas o fragmentos comentados donde se evidencie la aplicación de SOLID
y patrones de diseño.
• 2. Repositorio de GitHub y Anexos Técnicos: Enlace público al repositorio de
GitHub del proyecto que contenga: (a) la carpeta /docs/hito-2 con los archivos
fuente de los diagramas (Mermaid/PlantUML/Draw.io) y ADRs, y (b) el código
fuente actualizado del backend (Java/Spring Boot) con las entidades @Entity,
repositorios, DTOs, servicios y controladores estructurados por capas.