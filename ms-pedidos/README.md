# ms-pedidos · AgroRed S.A.

Redes y Servicios Multimedia - UAO - Microservicio **pedidos** (los que hacen los clientes de AgroRed), organizado en capas.

- **Responsable:** María Paula Zambrano Fernández (GitHub: @ccdfmck)
- **Puerto:** 3004
- **Base de datos:** `pedidos_db` (propia de este microservicio)

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`) y MySQL 8 o superior.

**1. Crear la base de datos** (como administrador `root`, en Workbench o en la consola):

```sql
CREATE DATABASE pedidos_db;
CREATE USER 'pedidos_user'@'localhost' IDENTIFIED BY 'cambie-esta-clave';
GRANT ALL PRIVILEGES ON pedidos_db.* TO 'pedidos_user'@'localhost';
```

**2. Crear la tabla y los datos iniciales** (conectados como `pedidos_user`):

```sql
USE pedidos_db;
SOURCE db/schema.sql;
```

En Workbench también sirve abrir `db/schema.sql` (File → Open SQL Script) y ejecutarlo.

**3. Instalar y arrancar** (desde la carpeta `ms-pedidos`):

```
npm install                 # descarga las dependencias en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Antes de arrancar, abra el archivo `.env` y escriba en `DB_PASSWORD` la clave del usuario `pedidos_user`. El archivo `.env` no se sube al repositorio.

| Variable | Qué es | Ejemplo |
|---|---|---|
| PORT | Puerto donde escucha | 3004 |
| HOST | Dirección donde escucha (127.0.0.1 = solo este equipo) | 127.0.0.1 |
| DB_HOST | Servidor de MySQL | 127.0.0.1 |
| DB_PORT | Puerto de MySQL | 3306 |
| DB_NAME | Base de datos | pedidos_db |
| DB_USER | Usuario de la base de datos | pedidos_user |
| DB_PASSWORD | Clave del usuario | (la suya) |

Prueben en el navegador: http://localhost:3004/health y http://localhost:3004/pedidos

Las peticiones de prueba para Postman están en `docs/ms-pedidos.postman_collection.json`.

## Representación y atributos

```json
{
  "id": 1,
  "cliente_id": 1,
  "producto_id": 1,
  "cantidad": 120,
  "centro_distribucion": "Bogotá",
  "estado": "recibido",
  "created_at": "2026-10-26T09:30:00",
  "updated_at": "2026-10-26T09:30:00"
}
```

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | entero | no (lo asigna la base de datos) | entero positivo |
| cliente_id | entero | sí | entero positivo; referencia a un cliente de ms-clientes |
| producto_id | entero | sí | entero positivo; referencia a un producto de ms-productos |
| cantidad | entero | sí | entero mayor que 0 |
| centro_distribucion | texto | sí | Bogotá o Cali |
| estado | texto | no (por defecto recibido) | recibido, despachado o entregado |
| created_at | texto | no (lo asigna el servicio) | fecha y hora de creación, formato AAAA-MM-DDTHH:MM:SS; no se envía ni se modifica |
| updated_at | texto | no (lo asigna el servicio) | fecha y hora de la última modificación; al crear es igual a created_at |

Los campos que no están en la tabla se descartan.

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Salud | GET | /health | — | 200 `{"servicio":"ms-pedidos","estado":"ok"}` | — |
| Listar | GET | /pedidos | — | 200 + arreglo | — |
| Filtrar | GET | /pedidos?estado=despachado | — | 200 + arreglo filtrado | 400 estado inválido |
| Obtener | GET | /pedidos/:id | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | /pedidos | JSON sin id | 201 + objeto + cabecera Location | 400 |
| Actualizar | PUT | /pedidos/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 404 |
| Eliminar | DELETE | /pedidos/:id | — | 204 sin cuerpo | 400 · 404 |

No hay consulta por lotes (`?ids=`) porque ningún microservicio consulta a ms-pedidos, ni error 409 porque la entidad no tiene campos únicos.

El PUT reemplaza el pedido completo: el cuerpo lleva `cliente_id`, `producto_id`, `cantidad`, `centro_distribucion` y `estado`. El servicio conserva `created_at` y renueva `updated_at`.

**Ejemplo: crear** (`POST /pedidos`)

Petición:

```json
{ "cliente_id": 3, "producto_id": 2, "cantidad": 50, "centro_distribucion": "Cali" }
```

Respuesta: `201 Created` con la cabecera `Location: /pedidos/4` y el cuerpo:

```json
{
  "id": 4,
  "cliente_id": 3,
  "producto_id": 2,
  "cantidad": 50,
  "centro_distribucion": "Cali",
  "estado": "recibido",
  "created_at": "2026-11-02T17:20:00",
  "updated_at": "2026-11-02T17:20:00"
}
```

**Ejemplo: listar** (`GET /pedidos?estado=despachado`)

Respuesta: `200 OK`

```json
[
  {
    "id": 2,
    "cliente_id": 2,
    "producto_id": 3,
    "cantidad": 40,
    "centro_distribucion": "Cali",
    "estado": "despachado",
    "created_at": "2026-10-24T14:15:00",
    "updated_at": "2026-10-25T08:00:00"
  }
]
```

Los errores devuelven un JSON con el mensaje, por ejemplo `400`:
`{ "error": "Datos inválidos", "detalles": ["cantidad es obligatoria y debe ser un entero positivo"] }`

## Relaciones

ms-pedidos guarda solo los ids de cliente y producto, nunca una copia de sus datos. No hay llaves foráneas entre bases de datos: la existencia de cada referencia se valida por REST.

**A quién consulta este servicio y para qué:**

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| cliente_id | ms-clientes | GET /clientes/:id | GET /clientes?ids=… | id, nombre |
| producto_id | ms-productos | GET /productos/:id | GET /productos?ids=… | id, nombre, precio |

Para validar solo se usa el código de la respuesta (200 existe, 404 no existe). Al componer, la respuesta de ms-pedidos incluye los objetos `cliente: {id, nombre}` y `producto: {id, nombre, precio}`.

**Quién me consulta y qué se compromete a mantener este servicio:**

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| Ningún microservicio | — | — |

Ningún microservicio consulta a ms-pedidos por REST, por eso no tiene flechas entrantes en el diagrama de comunicación. El frontend sí lo consume, a través de los endpoints de la sección anterior.

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/pedidos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/pedidos.controller.js | Presentación | Lee la petición (params, query, body), llama al servicio y arma la respuesta |
| src/services/pedidos.service.js | Lógica de negocio | Validaciones y reglas; no conoce HTTP ni la base de datos |
| src/repositories/pedidos.repository.js | Acceso a datos | Consultas SQL a MySQL |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con los datos del `.env` |
| src/models/pedido.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |
| db/schema.sql | Base de datos | Tabla `pedidos` y datos iniciales |