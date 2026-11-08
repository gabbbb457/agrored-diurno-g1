# ms-productos · AgroRed S.A.

Redes y Servicios Multimedia · UAO · Microservicio de **productos** (los que fabrica o
comercializa AgroRed), con **Node.js + Express + MySQL** organizado en capas.

- **Responsable:** Daniela Valverde Moreno (GitHub: Danix5925)
- **Puerto:** 3002
- **Base de datos:** `productos_db` (propia de este microservicio)

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`) y MySQL 8.

**1. Crear la base de datos** (como administrador `root`, en Workbench o en la consola):

```sql
CREATE DATABASE productos_db;
CREATE USER 'productos_user'@'localhost' IDENTIFIED BY 'cambie-esta-clave';
GRANT ALL PRIVILEGES ON productos_db.* TO 'productos_user'@'localhost';
```

**2. Crear la tabla y los datos iniciales** (conectados como `productos_user`):

```sql
USE productos_db;
SOURCE db/schema.sql;
```

En Workbench también sirve abrir `db/schema.sql` (File → Open SQL Script) y ejecutarlo.

**3. Instalar y arrancar** (desde la carpeta `ms-productos`):

```
npm install                 # descarga las dependencias en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Antes de arrancar, abra el archivo `.env` y escriba en `DB_PASSWORD` la clave del usuario `productos_user`. El archivo `.env` no se sube al repositorio.

| Variable | Qué es | Ejemplo |
|---|---|---|
| PORT | Puerto donde escucha | 3002 |
| HOST | Dirección donde escucha (127.0.0.1 = solo este equipo) | 127.0.0.1 |
| DB_HOST | Servidor de MySQL | localhost |
| DB_PORT | Puerto de MySQL | 3306 |
| DB_NAME | Base de datos | productos_db |
| DB_USER | Usuario de la base de datos | productos_user |
| DB_PASSWORD | Clave del usuario | (la suya) |

Prueben en el navegador: http://localhost:3002/health y http://localhost:3002/productos

## Representación y atributos

```json
{
  "id": 4,
  "nombre": "Papaya Hawaiana",
  "categoria": "fruta",
  "unidad": "kg",
  "precio": 4200
}
```

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | entero | no (lo asigna la base de datos) | entero positivo |
| nombre | texto | sí | no vacío y único (sin distinguir mayúsculas) |
| categoria | texto | sí | fruta, hortaliza o procesado |
| unidad | texto | sí | kg o caja |
| precio | número | sí | mayor que 0 |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Salud | GET | /health | — | 200 `{"servicio":"ms-productos","estado":"ok"}` | — |
| Listar | GET | /productos | — | 200 + arreglo | — |
| Filtrar | GET | /productos?categoria=fruta | — | 200 + arreglo filtrado | — |
| Consultar por lotes | GET | /productos?ids=1,3 | — | 200 + arreglo con esos productos | 400 ids inválidos |
| Obtener | GET | /productos/:id | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | /productos | JSON sin id | 201 + objeto + cabecera Location | 400 · 409 |
| Actualizar | PUT | /productos/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 404 · 409 |
| Eliminar | DELETE | /productos/:id | — | 204 sin cuerpo | 400 · 404 |

**Ejemplo: crear** (`POST /productos`)

Petición:

```json
{ "nombre": "Papaya Hawaiana", "categoria": "fruta", "unidad": "kg", "precio": 4200 }
```

Respuesta: `201 Created` con la cabecera `Location: /productos/4` y el cuerpo:

```json
{ "id": 4, "nombre": "Papaya Hawaiana", "categoria": "fruta", "unidad": "kg", "precio": 4200 }
```

**Ejemplo: listar** (`GET /productos`)

Respuesta: `200 OK`

```json
[
  { "id": 1, "nombre": "Mango Tommy", "categoria": "fruta", "unidad": "kg", "precio": 3500 },
  { "id": 2, "nombre": "Tomate Chonto", "categoria": "hortaliza", "unidad": "kg", "precio": 2800 },
  { "id": 3, "nombre": "Pulpa de Maracuyá", "categoria": "procesado", "unidad": "caja", "precio": 45000 }
]
```

Los errores devuelven un JSON con el mensaje, por ejemplo `400`:
`{ "error": "Datos inválidos", "detalles": ["precio es obligatorio y debe ser un número mayor que 0"] }`

## Relaciones

ms-productos **no guarda referencias** a otros microservicios: es un servicio consultado.

**Quién me consulta y qué se compromete a mantener este servicio:**

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-pedidos | GET /productos/:id · GET /productos?ids=… | id, nombre |
| ms-lotes | GET /productos/:id · GET /productos?ids=… | id, nombre |

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/productos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/productos.controller.js | Presentación | Lee la petición (params, query, body), llama al servicio y arma la respuesta |
| src/services/productos.service.js | Lógica de negocio | Validaciones y regla de nombre único; no conoce HTTP ni la base de datos |
| src/repositories/productos.repository.js | Acceso a datos | Consultas SQL a MySQL |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con los datos del `.env` |
| src/models/producto.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |
| db/schema.sql | Base de datos | Tabla `productos` y datos iniciales |