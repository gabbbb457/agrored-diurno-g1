# ms-lotes · Microservicio de lotes de producción

Redes y Servicios Multimedia · UAO · Módulo 3 · AgroRed S.A.

Gestiona los **lotes de producción** de la planta de AgroRed. Responsable: Gabriela Mellizo. Escucha en el puerto **3005**. Hecho con Node.js + Express, organizado en capas, con datos en MySQL, protegido con tokens JWT y conectado con **ms-productos**.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior, MySQL 8, y `ms-productos` corriendo (puerto 3002).

1. Crear la base de datos y su usuario (como administrador de MySQL):
   ```sql
   CREATE DATABASE lotes_db;
   CREATE USER 'lotes_user'@'localhost' IDENTIFIED BY 'su-clave';
   GRANT ALL PRIVILEGES ON lotes_db.* TO 'lotes_user'@'localhost';
   ```
2. Crear la tabla y los datos iniciales: ejecutar `db/schema.sql` dentro de `lotes_db`.
3. Crear el archivo `.env` a partir de `.env.example` (`copy .env.example .env`) y completar los valores.
4. Instalar y arrancar:
   ```
   npm install
   npm run dev
   ```

Variables del `.env`:

| Variable | Para qué sirve |
|---|---|
| PORT, HOST | Puerto y dirección donde escucha (3005 y 127.0.0.1) |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | Conexión a `lotes_db` |
| JWT_SECRET | Clave con la que se verifican los tokens; debe ser la misma en todos los servicios del grupo |
| PRODUCTOS_URL | Dirección de ms-productos (`http://127.0.0.1:3002`) |

## Representación de un lote

```json
{
  "id": 4,
  "codigo_lote": "L-2026-004",
  "producto_id": 1,
  "fecha_produccion": "2026-10-25",
  "cantidad": 250,
  "resultado_calidad": "pendiente",
  "producto": { "id": 1, "nombre": "Mango" }
}
```

El objeto `producto` **no se guarda** en la base de datos de lotes: ms-lotes lo pide a ms-productos cada vez que responde.

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No | Lo asigna el servicio; el cliente nunca lo envía |
| codigo_lote | texto | Sí | No vacío; se guarda sin espacios; único (si se repite: 409) |
| producto_id | entero | Sí | Entero positivo; debe existir en ms-productos (si no: 400) |
| fecha_produccion | texto | Sí | Formato AAAA-MM-DD, fecha real y no futura |
| cantidad | entero | Sí | Mayor que 0 |
| resultado_calidad | texto | Sí | `pendiente`, `aprobado` o `rechazado` |

## Seguridad

Todos los endpoints (salvo `/health`) exigen el token JWT en la cabecera `Authorization: Bearer <token>`, que se obtiene con `POST /usuarios/login` en ms-usuarios.

| Situación | Respuesta |
|---|---|
| Sin token, token inválido o vencido | 401 |
| Token válido pero rol sin permiso | 403 |

Permisos: cualquier usuario autenticado puede consultar (GET). Solo los roles **administrador** y **produccion** pueden crear, modificar y eliminar lotes.

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores |
|---|---|---|---|---|---|
| Salud | GET | /health | — | 200 `{"servicio":"ms-lotes","estado":"ok"}` | — |
| Listar | GET | /lotes | — | 200 + arreglo | 401 |
| Filtrar | GET | /lotes?resultado_calidad=aprobado | — | 200 + arreglo filtrado | 401 |
| Obtener | GET | /lotes/:id | — | 200 + objeto | 400 · 401 · 404 |
| Crear | POST | /lotes | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 409 · 503 |
| Actualizar | PUT | /lotes/:id | JSON completo sin id | 200 + objeto | 400 · 401 · 403 · 404 · 409 · 503 |
| Eliminar | DELETE | /lotes/:id | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Los errores responden `{"error": "...", "detalles": [...]}` (la lista `detalles` solo aparece en los errores de validación).

**Ejemplo: crear** — `POST /lotes`
```json
{
  "codigo_lote": "L-2026-004",
  "producto_id": 1,
  "fecha_produccion": "2026-10-25",
  "cantidad": 250,
  "resultado_calidad": "pendiente"
}
```
Responde `201` con el lote creado, su `id` y el objeto `producto`.

**Ejemplo: listar** — `GET /lotes` responde `200`:
```json
[
  {
    "id": 1, "codigo_lote": "L-2026-001", "producto_id": 2,
    "fecha_produccion": "2026-10-20", "cantidad": 500, "resultado_calidad": "pendiente",
    "producto": { "id": 2, "nombre": "Banano" }
  }
]
```

## Relaciones

ms-lotes guarda `producto_id`, que referencia a un producto de **ms-productos**. Nadie consulta ms-lotes, así que no tiene tabla de "me consultan".

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| producto_id | ms-productos | `GET /productos/:id` | `GET /productos?ids=…` | id, nombre |

- **Al escribir:** si el producto no existe responde 400; si ms-productos no responde, 503.
- **Al leer:** el listado hace **una sola** consulta por lotes a ms-productos. Si ms-productos no responde, la respuesta sale igual con `"producto": null` y un `aviso` (degradación controlada).
- El token del usuario se reenvía a ms-productos, que también lo exige.

## Pruebas

La colección de Postman con los casos 1 a 24 está en `docs/ms-lotes.postman_collection.json`.