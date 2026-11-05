# AquaChile — Sistema de Gestión de Evaluaciones Psicolaborales

## 1. Descripción general

AquaChile es una aplicación web orientada a la gestión y seguimiento de solicitudes de evaluaciones psicolaborales de candidatos a procesos de selección.

El sistema busca centralizar la información de los candidatos, la recepción de sus currículums, la administración de solicitudes y el seguimiento de las evaluaciones, permitiendo que el equipo encargado gestione el proceso desde una plataforma única.

El proyecto se desarrolla por etapas. En esta entrega, el objetivo principal es implementar y validar el flujo funcional correspondiente al Producto Mínimo Viable (MVP).

## 2. Objetivo del proyecto

Desarrollar una aplicación web que permita:

- Registrar solicitudes de evaluación psicolaboral.
- Almacenar los datos de los candidatos.
- Adjuntar y almacenar currículums vitae.
- Consultar las solicitudes desde un Dashboard.
- Gestionar el estado de las solicitudes.
- Registrar y consultar los resultados de las evaluaciones.

## 3. Alcance del MVP

El MVP contempla los siguientes requerimientos funcionales:

| Código | Requerimiento | Descripción |
|---|---|---|
| RF01 | Autenticación y roles | Considera el acceso diferenciado según el tipo de usuario. |
| RF02 | Gestión de candidatos | Registrar, editar y consultar información de candidatos. |
| RF03 | Crear solicitudes | Generar solicitudes de evaluación psicolaboral. |
| RF04 | Información de solicitud | Registrar cargo, familia de cargo, fecha y responsable. |
| RF05 | Listado de solicitudes | Visualizar las solicitudes registradas. |
| RF06 | Detalle de solicitud | Consultar información específica de cada solicitud. |
| RF07 | Filtros y búsqueda | Filtrar por estado, fecha, cargo y candidato. |
| RF08 | Estados del proceso | Gestionar el avance de las solicitudes. |
| RF09 | Evaluaciones | Registrar fecha, resultado y observaciones. |
| RF10 | Dashboard | Visualizar indicadores y distribución de solicitudes. |

### Flujo principal del MVP

1. Ingreso de una solicitud de evaluación.
2. Registro de los datos del candidato.
3. Adjuntar el currículum vitae.
4. Almacenar la información en la base de datos.
5. Visualizar la solicitud en el Dashboard.
6. Consultar y gestionar la solicitud.
7. Actualizar el estado del proceso.
8. Registrar el resultado de la evaluación.

## 4. Arquitectura tecnológica

La solución utiliza una arquitectura de aplicación web basada en React y un servicio Backend as a Service (BaaS) proporcionado por Supabase.

### Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React 18 | Desarrollo de la interfaz de usuario. |
| JavaScript / JSX | Implementación de componentes y lógica de interfaz. |
| React Router DOM | Navegación entre vistas y rutas. |
| CSS | Estilos y presentación visual. |
| Supabase | Servicios de persistencia y almacenamiento. |
| PostgreSQL | Motor de base de datos utilizado por Supabase. |
| Supabase Storage | Almacenamiento de archivos CV. |
| Vitest | Ejecución de pruebas automatizadas. |
| React Testing Library | Pruebas de componentes e interacción. |
| Git y GitHub | Control de versiones y colaboración. |

### Componentes de la arquitectura

**Frontend — React**

Responsable de presentar la interfaz, gestionar los formularios, controlar los estados de los componentes y permitir la navegación entre las distintas secciones del sistema.

**Capa de servicios**

Centraliza las operaciones de acceso a datos. Permite separar la lógica de comunicación con Supabase de los componentes visuales.

Archivo principal:

`src/services/solicitudesService.js`

**Cliente de Supabase**

Configura la conexión con el proyecto remoto utilizando las variables de entorno.

Archivo:

`src/lib/supabaseClient.js`

**Base de datos — PostgreSQL**

Almacena las solicitudes y las evaluaciones asociadas.

**Almacenamiento — Supabase Storage**

Permite guardar los archivos CV asociados a las solicitudes.

## 5. Modelo de datos

El sistema utiliza dos tablas principales:

### Tabla: solicitudes

Almacena la información de cada solicitud de evaluación.

| Campo | Descripción |
|---|---|
| id | Identificador único de la solicitud. |
| candidato | Nombre del candidato. |
| familia_cargo | Familia o área del cargo. |
| cargo | Cargo al que postula. |
| cv_path | Ruta del archivo CV almacenado. |
| estado | Estado actual de la solicitud. |
| fecha_solicitud | Fecha de creación de la solicitud. |
| created_at | Fecha y hora de registro. |

### Tabla: evaluaciones

Almacena la información correspondiente a la evaluación psicolaboral.

| Campo | Descripción |
|---|---|
| id | Identificador de la evaluación. |
| solicitud_id | Referencia a la solicitud correspondiente. |
| resultado | Resultado de la evaluación. |
| informe | Observaciones e información del informe. |
| created_at | Fecha y hora de registro. |

La relación entre ambas tablas es de uno a uno: una solicitud puede tener una evaluación asociada.

### Almacenamiento de documentos

Los archivos CV se almacenan en el bucket `cvs` de Supabase Storage.

La base de datos conserva la ruta del archivo mediante el campo `cv_path`, evitando almacenar el documento directamente dentro de la tabla.

## 6. Flujo técnico de registro de solicitudes

El proceso de registro se ejecuta de la siguiente manera:

1. El usuario completa el formulario de solicitud.
2. Se validan los campos mediante las funciones de validación.
3. El componente `SolicitudEvaluacionForm.jsx` ejecuta la función `crearSolicitud()`.
4. El servicio carga el archivo CV en Supabase Storage, cuando corresponde.
5. Se inserta la información del candidato en la tabla `solicitudes`.
6. Supabase devuelve el identificador generado.
7. La aplicación muestra una confirmación del registro.

El servicio también contempla la eliminación del archivo CV si ocurre un error al insertar la solicitud, evitando dejar archivos huérfanos en ese escenario.

### Flujo técnico del Dashboard

1. Se carga el componente `Dashboard.jsx`.
2. Se ejecuta `listarSolicitudes()`.
3. El servicio consulta los registros almacenados en Supabase.
4. Los datos recibidos se guardan en el estado del componente mediante `useState`.
5. El Dashboard calcula los indicadores y presenta las solicitudes.
6. Los filtros y el buscador permiten localizar registros según los criterios disponibles.

### Flujo técnico de evaluación

El servicio dispone de la función `guardarEvaluacion()`, que permite almacenar o actualizar una evaluación asociada a una solicitud y actualizar su estado a `Completada`.

## 7. Estructura del proyecto

```text
AquaChile/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── EvaluacionDetalle/
│   │   └── SolicitudEvaluacionForm/
│   │
│   ├── constants/
│   │
│   ├── lib/
│   │   └── supabaseClient.js
│   │
│   ├── services/
│   │   └── solicitudesService.js
│   │
│   ├── utils/
│   │   └── validaciones.js
│   │
│   └── App.jsx
│
├── supabase/
│   └── schema.sql
│
├── .env
├── package.json
└── README.md
```

**Descripción de las carpetas principales:**

- `components/`: componentes visuales y módulos funcionales de la aplicación.
- `Dashboard/`: panel de indicadores, búsqueda y listado de solicitudes.
- `SolicitudEvaluacionForm/`: formulario de ingreso de solicitudes y carga de CV.
- `EvaluacionDetalle/`: módulo de consulta y gestión de evaluaciones.
- `constants/`: constantes y opciones utilizadas por la aplicación.
- `lib/`: configuración de clientes y conexiones externas.
- `services/`: operaciones de acceso a datos y comunicación con Supabase.
- `utils/`: funciones auxiliares y validaciones.
- `supabase/`: estructura SQL de la base de datos.

## 8. Instalación y ejecución

### Requisitos previos

- Node.js instalado.
- npm.
- Git.
- Acceso al proyecto compartido de Supabase.
- Visual Studio Code o un editor compatible.

### Clonar el repositorio

```bash
git clone https://github.com/K4USTIC/AquaChile.git
cd AquaChile
git checkout rama-base
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_SUPABASE_URL=URL_DEL_PROYECTO_SUPABASE
REACT_APP_SUPABASE_ANON_KEY=CLAVE_PUBLICA_DEL_PROYECTO
```

Las variables permiten establecer la conexión entre el frontend y el proyecto Supabase compartido.

**Importante:** no subir el archivo `.env` al repositorio ni publicar claves privadas o credenciales administrativas. El frontend utiliza únicamente la clave pública correspondiente al cliente.

### Iniciar la aplicación

```bash
npm start
```

La aplicación estará disponible en:

`http://localhost:3000`

## 9. Base de datos y configuración de Supabase

La estructura de la base de datos se encuentra documentada en:

`supabase/schema.sql`

Este archivo define las tablas principales, sus relaciones, restricciones y configuración de acceso.

Para utilizar el sistema, el proyecto Supabase debe contar con:

- Tabla `solicitudes`.
- Tabla `evaluaciones`.
- Bucket de almacenamiento `cvs`.
- Políticas de acceso correspondientes.
- Variables de conexión configuradas en el entorno local.

La base de datos es compartida por el equipo, por lo que los registros almacenados permanecen disponibles para los integrantes que utilizan el mismo proyecto y tienen una configuración válida.

## 10. Pruebas automatizadas

El proyecto incorpora Vitest como herramienta de ejecución de pruebas.

Los comandos disponibles son:

**Ejecutar todas las pruebas:**

```bash
npm test
```

**Ejecutar pruebas en modo interactivo:**

```bash
npm run test:watch
```

**Ejecutar pruebas con cobertura:**

```bash
npm run test:coverage
```

Las pruebas permiten verificar el comportamiento de servicios y componentes, detectar errores y comprobar que las funcionalidades implementadas se comporten según lo esperado.

## 11. Construcción para producción

Para generar una versión compilada de la aplicación:

```bash
npm run build
```

Este comando utiliza React Scripts y genera los archivos optimizados para su posterior despliegue.

## 12. Validación funcional realizada

Durante las pruebas de integración se verificó el siguiente comportamiento:

- Conexión del frontend con el proyecto Supabase compartido.
- Envío del formulario de solicitudes.
- Registro persistente de una solicitud en PostgreSQL.
- Generación de un identificador de solicitud.
- Visualización del registro en la tabla de Supabase.
- Consulta de solicitudes desde el Dashboard.
- Actualización del estado de una solicitud y persistencia del cambio.

La validación de estas operaciones permitió comprobar la comunicación entre la interfaz, la capa de servicios y la base de datos.

## 13. Consideraciones de seguridad y evolución

La configuración actual está orientada a la etapa de desarrollo y demostración del MVP.

Debido a que el sistema administra currículums y resultados de evaluaciones psicolaborales, una implementación productiva requiere reforzar los controles de seguridad.

Entre las mejoras necesarias se consideran:

- Implementación y validación de autenticación.
- Roles y permisos diferenciados.
- Políticas RLS restrictivas por usuario y rol.
- Protección de documentos y datos personales.
- Control de acceso a los informes de evaluación.
- Auditoría de modificaciones y cambios de estado.
- Gestión segura de credenciales y variables de entorno.

## 14. Próximas etapas

Como parte de la evolución del proyecto se consideran:

- Completar la gestión de usuarios y roles.
- Fortalecer la administración de candidatos.
- Completar el flujo de asignación de responsables.
- Consolidar el registro de evaluaciones e informes.
- Ampliar los indicadores y filtros del Dashboard.
- Fortalecer las pruebas automatizadas.
- Preparar el despliegue de la aplicación.

## 15. Repositorio

**Proyecto:** AquaChile — Sistema de Gestión de Evaluaciones Psicolaborales.

**Repositorio GitHub:**  
https://github.com/K4USTIC/AquaChile

**Rama de presentación:** `rama-base`

---

**Documento técnico del proyecto AquaChile.**
