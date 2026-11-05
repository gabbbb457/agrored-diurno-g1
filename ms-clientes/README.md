# ms-clientes · AgroRed S.A. · Taller 2 (Módulo 3)

Redes y Servicios Multimedia · UAO · Grupo 1 diurno

Microservicio de **clientes** de AgroRed con Node.js + Express, organizado en capas y con persistencia en MySQL.

| Dato | Valor |
|---|---|
| Entidad | Cliente (empresas que compran a AgroRed) |
| Responsable | Miguel Ángel Vanegas Daza (MDvanegas) |
| Puerto | 3003 |
| Base de datos | clientes_db (usuario clientes_user) |
| Lo consulta | ms-pedidos |

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior (`node -v`) y MySQL 8 (o MariaDB de XAMPP) corriendo en el puerto 3306.

1. Crear la base de datos y el usuario, como root (Workbench, consola `mysql -u root -p` o phpMyAdmin):

```sql
CREATE DATABASE clientes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
```

2. Crear la tabla y los registros iniciales, desde la carpeta `ms-clientes`:

```
mysql -u clientes_user -p clientes_db
mysql> SOURCE db/schema.sql;
```

3. Configurar y arrancar:

```
npm install
copy .env.example .env      # Windows (Linux/Mac: cp .env.example .env)
                            # editar .env: DB_PASSWORD y JWT_SECRET del grupo
npm run dev
```

Prueba rápida: http://localhost:3003/health

### Variables del .env

| Variable | Ejemplo | Uso |
|---|---|---|
| PORT | 3003 | Puerto del servicio |
| HOST | 127.0.0.1 | Solo acepta conexiones locales |
| DB_HOST | 127.0.0.1 | Servidor MySQL (en el Taller 3: IP de servidor1) |
| DB_PORT | 3306 | Puerto de MySQL |
| DB_NAME | clientes_db | Base de datos del servicio |
| DB_USER | clientes_user | Usuario propio del servicio |
| DB_PASSWORD | (no se sube) | Clave del usuario |
| JWT_SECRET | (no se sube) | Clave compartida por el grupo para verificar tokens |

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador, permisos por rol |
| src/controllers/clientes.controller.js | Presentación | Lee params, query y body; llama al servicio; arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y regla del NIT único; no conoce HTTP ni la base de datos |
| src/repositories/clientes.repository.js | Acceso a datos | Consultas SQL parametrizadas sobre clientes_db |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL |
| src/models/cliente.js | Modelo | Atributos de la entidad y su validación |
| src/middlewares/auth.js | Seguridad | Verificación del token JWT y del rol (copiado de ms-usuarios) |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Representación y atributos

```json
{
  "id": 1,
  "nombre": "Distribuidora El Valle",
  "nit": "900123456-1",
  "email": "contacto@elvalle.com",
  "telefono": "3001234567",
  "ciudad": "Cali",
  "fecha_registro": "2026-10-01",
  "activo": true
}
```

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna MySQL) | Positivo y único |
| nombre | texto | Sí | No vacío |
| nit | texto | Sí | Formato `900123456-1`; único (si se repite: 409) |
| email | texto | Sí | Correo válido; se guarda en minúsculas (400 si no) |
| telefono | texto | Sí | No vacío |
| ciudad | texto | Sí | No vacía |
| fecha_registro | texto AAAA-MM-DD | No (la asigna el servicio) | Fecha de creación; no cambia con PUT |
| activo | booleano | No (por defecto true) | Solo true o false |

## Endpoints

Todas las rutas de `/clientes` exigen la cabecera `Authorization: Bearer <token>`.
Consultan todos los roles autenticados; crean, modifican y eliminan `administrador` y `comercial`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /clientes | — | 200 + arreglo | 401 |
| Filtrar | GET | /clientes?ciudad=Cali | — | 200 + arreglo filtrado | 401 |
| Consultar por lotes | GET | /clientes?ids=1,3 | — | 200 + arreglo con esos registros | 400 ids inválidos · 401 |
| Obtener | GET | /clientes/:id | — | 200 + objeto | 400 id inválido · 401 · 404 |
| Crear | POST | /clientes | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 409 |
| Actualizar | PUT | /clientes/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /clientes/:id | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Ejemplo crear:

```
POST /clientes
Content-Type: application/json

{ "nombre": "Ferretería Central", "nit": "900555111-2", "email": "ferre@central.com", "telefono": "3151112233", "ciudad": "Palmira" }

→ 201 Created · Location: /clientes/4
{ "id": 4, "nombre": "Ferretería Central", "nit": "900555111-2", "email": "ferre@central.com",
  "telefono": "3151112233", "ciudad": "Palmira", "fecha_registro": "2026-11-03", "activo": true }
```

Ejemplo listar por lotes:

```
GET /clientes?ids=1,3
→ 200 [ { "id": 1, "nombre": "Distribuidora El Valle", ... }, { "id": 3, "nombre": "Supermercados del Pacífico", ... } ]
```

Formato de error: `{ "error": "mensaje", "detalles": ["..."] }`

## Relaciones

ms-clientes no guarda referencias a otros microservicios. Es consultado por:

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-pedidos | GET /clientes/:id · GET /clientes?ids=… | id, nombre |

ms-pedidos usa `GET /clientes/:id` al crear y actualizar un pedido (200 existe, 404 no existe) y `GET /clientes?ids=…` al listar y obtener pedidos para mostrar el nombre del cliente.

## Pruebas

Colección de Postman en `docs/ms-clientes.postman_collection.json` (Export → Collection v2.1). Variables de la colección: `base_url`, `token`, `token_comercial`, `token_produccion`, `nuevo_id`.
