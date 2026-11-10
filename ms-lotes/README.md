# ms-lotes · Microservicio de lotes de producción

Redes y Servicios Multimedia · UAO · Módulo 3 · AgroRed S.A.

Gestiona los **lotes de producción** de la planta de AgroRed. Responsable: Gabriela Mellizo. Escucha en el puerto **3005**. Hecho con Node.js + Express, organizado en capas, con datos en MySQL.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior y MySQL 8.

1. Crear la base de datos y su usuario (como administrador de MySQL):
   ```sql
   CREATE DATABASE lotes_db;
   CREATE USER 'lotes_user'@'localhost' IDENTIFIED BY 'su-clave';
   GRANT ALL PRIVILEGES ON lotes_db.* TO 'lotes_user'@'localhost';
   ```
2. Crear la tabla y los datos iniciales: ejecutar `db/schema.sql` dentro de `lotes_db`.
3. Crear el archivo `.env` a partir de `.env.example` (`copy .env.example .env`) y poner la clave real en `DB_PASSWORD`.
4. Instalar y arrancar:
   ```
   npm install
   npm run dev
   ```

Variables del `.env`: `PORT`, `HOST`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

## Representación de un lote

```json
{
  "id": 4,
  "codigo_lote": "L-2026-004",
  "producto_id": 2,
  "fecha_produccion": "2026-10-25",
  "cantidad": 250,
  "resultado_calidad": "pendiente"
}
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No | Lo asigna el servicio; el cliente nunca lo envía |
| codigo_lote | texto | Sí | No vacío; se guarda sin espacios; único (si se repite: 409) |
| producto_id | entero | Sí | Entero positivo. Que exista en ms-productos se valida al integrar |
| fecha_produccion | texto | Sí | Formato AAAA-MM-DD, fecha real y no futura |
| cantidad | entero | Sí | Mayor que 0 |
| resultado_calidad | texto | Sí | `pendiente`, `aprobado` o `rechazado` |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores |
|---|---|---|---|---|---|
| Salud | GET | /health | — | 200 `{"servicio":"ms-lotes","estado":"ok"}` | — |
| Listar | GET | /lotes | — | 200 + arreglo | — |
| Filtrar | GET | /lotes?resultado_calidad=aprobado | — | 200 + arreglo filtrado | — |
| Obtener | GET | /lotes/:id | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | /lotes | JSON sin id | 201 + objeto + cabecera Location | 400 · 409 |
| Actualizar | PUT | /lotes/:id | JSON completo sin id | 200 + objeto | 400 · 404 · 409 |
| Eliminar | DELETE | /lotes/:id | — | 204 sin cuerpo | 400 · 404 |

Los errores responden `{"error": "...", "detalles": [...]}` (la lista `detalles` solo aparece en los errores de validación).

**Ejemplo: crear** — `POST /lotes`
```json
{
  "codigo_lote": "L-2026-004",
  "producto_id": 2,
  "fecha_produccion": "2026-10-25",
  "cantidad": 250,
  "resultado_calidad": "pendiente"
}
```
Responde `201` con el lote creado y su `id`.

**Ejemplo: listar** — `GET /lotes` responde `200`:
```json
[
  { "id": 1, "codigo_lote": "L-2026-001", "producto_id": 2, "fecha_produccion": "2026-10-20", "cantidad": 500, "resultado_calidad": "pendiente" },
  { "id": 2, "codigo_lote": "L-2026-002", "producto_id": 1, "fecha_produccion": "2026-10-21", "cantidad": 300, "resultado_calidad": "aprobado" }
]
```

## Relaciones

ms-lotes guarda `producto_id`, que referencia a un producto de **ms-productos**. Nadie consulta ms-lotes, así que no tiene tabla de "me consultan".

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| producto_id | ms-productos | `GET /productos/:id` | `GET /productos?ids=…` | id, nombre |

*(La validación y la composición se implementan en la semana 2 del Taller 2.)*

## Pruebas

La colección de Postman con los casos de prueba está en `docs/ms-lotes.postman_collection.json`.