# ms-lotes · Microservicio de lotes de producción

Redes y Servicios Multimedia · UAO · Módulo 3 · AgroRed S.A.

Microservicio de **lotes** de la planta de AgroRed, hecho con **Node.js + Express** y organizado en capas. Es la versión del Taller 1: los datos viven en memoria y hay tres operaciones. En el Taller 2 pasará a MySQL con CRUD completo.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Pruebe en el navegador: http://localhost:3005/health y http://localhost:3005/lotes

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/lotes.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/lotes.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/lotes.service.js | Lógica de negocio | Validaciones y reglas (codigo_lote único); no conoce HTTP ni la base de datos |
| src/repositories/lotes.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/lote.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Atributos de un lote

| Atributo | Tipo | Regla |
|---|---|---|
| id | entero | Lo asigna el servicio |
| codigo_lote | texto | Obligatorio y único (409 si se repite) |
| producto_id | entero | Obligatorio, entero positivo (que exista en ms-productos se valida en el Taller 3) |
| fecha_produccion | texto | Obligatorio, formato AAAA-MM-DD |
| cantidad | entero | Obligatorio, mayor que 0 |
| resultado_calidad | texto | pendiente, aprobado o rechazado |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-lotes","estado":"ok"}` |
| GET | /lotes | 200 arreglo de lotes |
| GET | /lotes/:id | 200 lote · 400 id inválido · 404 no existe |
| POST | /lotes | 201 lote creado · 400 datos inválidos · 409 código repetido |

Ejemplo de cuerpo para POST:
`{"codigo_lote": "L-2026-004", "producto_id": 2, "fecha_produccion": "2026-10-25", "cantidad": 250, "resultado_calidad": "pendiente"}`

Ejemplo de respuesta (hoy solo trae `producto_id`; el objeto `producto` se agrega en el Taller 3):
`{"id": 4, "codigo_lote": "L-2026-004", "producto_id": 2, "fecha_produccion": "2026-10-25", "cantidad": 250, "resultado_calidad": "pendiente"}`

Puerto: 3005. Escucha solo en 127.0.0.1.