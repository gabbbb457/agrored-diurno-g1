# ms-productos · AgroRed S.A.

Redes y Servicios Multimedia · UAO · Microservicio de **productos** (los que fabrica o
comercializa AgroRed), con **Node.js + Express + MySQL** organizado en capas y protegido con tokens JWT.

- **Responsable:** Daniela Valverde Moreno (GitHub: Danix5925)
- **Puerto:** 3002
- **Base de datos:** `productos_db` (propia de este microservicio)
- **Lo consultan:** ms-pedidos y ms-lotes

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`), MySQL 8 y **ms-usuarios corriendo** (puerto 3001) para obtener el token.

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

Antes de arrancar, abra el archivo `.env` y escriba en `DB_PASSWORD` la clave del usuario `productos_user`
y en `JWT_SECRET` la clave del grupo. El archivo `.env` no se sube al repositorio y solo se lee al arrancar
(si lo cambia, reinicie el servicio).

| Variable | Qué es | Ejemplo |
|---|---|---|
| PORT | Puerto donde escucha | 3002 |
| HOST | Dirección donde escucha (127.0.0.1 = solo este equipo) | 127.0.0.1 |
| DB_HOST | Servidor de MySQL | localhost |
| DB_PORT | Puerto de MySQL | 3306 |
| DB_NAME | Base de datos | productos_db |
| DB_USER | Usuario de la base de datos | productos_user |
| DB_PASSWORD | Clave del usuario | (la suya) |
| JWT_SECRET | Clave con la que se verifican los tokens; **la misma en todos los microservicios del grupo** | (la del grupo, no se sube) |

Prueben en el navegador: http://localhost:3002/health (público). Las rutas `/productos` exigen token,
así que desde el navegador responden 401: se prueban en Postman (ver **Pruebas**).

En la terminal donde corre el servicio se registra cada petición que llega (hora, método, URI, código,
tiempo y origen). Las que hacen ms-pedidos y ms-lotes aparecen con origen `node`.

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

## Seguridad

Todas las rutas de `/productos` exigen un token JWT en la cabecera:

```
Authorization: Bearer <token>
```

El token se obtiene en ms-usuarios con `POST http://localhost:3001/usuarios/login` y
`{"email": "...", "password": "..."}`. Lleva `{ id, nombre, rol }` y ms-productos verifica su firma con
`JWT_SECRET`, sin consultar a ms-usuarios. `/health` es público.

| Operación | administrador | produccion | comercial |
|---|---|---|---|
| Consultar (GET) | ✔ | ✔ | ✔ |
| Crear, actualizar y eliminar (POST, PUT, DELETE) | ✔ | ✔ | ✘ (403) |

| Situación | Respuesta |
|---|---|
| Sin token, token modificado, inventado o vencido | 401 |
| Token válido, pero el rol no tiene permiso para la operación | 403 |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Salud | GET | /health | — | 200 `{"servicio":"ms-productos","estado":"ok"}` | — |
| Listar | GET | /productos | — | 200 + arreglo | 401 |
| Filtrar | GET | /productos?categoria=fruta | — | 200 + arreglo filtrado | 401 |
| Consultar por lotes | GET | /productos?ids=1,3 | — | 200 + arreglo con esos productos | 400 ids inválidos · 401 |
| Obtener | GET | /productos/:id | — | 200 + objeto | 400 id inválido · 401 · 404 |
| Crear | POST | /productos | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 409 |
| Actualizar | PUT | /productos/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /productos/:id | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

**Ejemplo: crear** (`POST /productos`, con token de administrador o produccion)

Petición:

```json
{ "nombre": "Papaya Hawaiana", "categoria": "fruta", "unidad": "kg", "precio": 4200 }
```

Respuesta: `201 Created` con la cabecera `Location: /productos/4` y el cuerpo:

```json
{ "id": 4, "nombre": "Papaya Hawaiana", "categoria": "fruta", "unidad": "kg", "precio": 4200 }
```

**Ejemplo: listar** (`GET /productos`, con token de cualquier rol)

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
| ms-pedidos | GET /productos/:id · GET /productos?ids=… | id, nombre, precio |
| ms-lotes | GET /productos/:id · GET /productos?ids=… | id, nombre |

- `GET /productos/:id` lo usan al crear y actualizar para **validar** que el producto exista (200 existe, 404 no existe).
- `GET /productos?ids=…` lo usan al consultar para **componer** sus respuestas con el nombre del producto, en una sola petición.
- Ambos reenvían el token del usuario en la cabecera `Authorization`, porque ms-productos también lo exige.

## Pruebas

Colección de Postman en `docs/ms-productos.postman_collection.json` (Collection v2.1):

1. En Postman: **Import** → seleccionar el archivo.
2. Tener corriendo ms-usuarios (3001, con `ROLES=administrador,comercial,produccion`) y ms-productos (3002), con la misma `JWT_SECRET`.
3. Correr primero la carpeta **0 · Preparar tokens** (login de administrador, crea los usuarios comercial y produccion y guarda sus tokens).
4. Correr las demás carpetas en orden. La carpeta de relaciones necesita además ms-clientes, ms-pedidos y ms-lotes corriendo.

Los tokens duran 8 horas; si vencen, se vuelve a correr la carpeta 0.

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Registro de peticiones, middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/productos.routes.js | Presentación | Método HTTP + URI → función del controlador, con los permisos por rol |
| src/controllers/productos.controller.js | Presentación | Lee la petición (params, query, body), llama al servicio y arma la respuesta |
| src/services/productos.service.js | Lógica de negocio | Validaciones y regla de nombre único; no conoce HTTP ni la base de datos |
| src/repositories/productos.repository.js | Acceso a datos | Consultas SQL a MySQL |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con los datos del `.env` |
| src/models/producto.js | Modelo | Atributos de la entidad y su validación |
| src/middlewares/auth.js | Seguridad | Verificación del token JWT y del rol (copiado sin cambios de ms-usuarios) |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |
| db/schema.sql | Base de datos | Tabla `productos` y datos iniciales |