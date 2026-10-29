# ms-pedidos · AgroRed S.A.

Redes y Servicios Multimedia · UAO · Módulo 3 · Taller 1. Microservicio de **pedidos** de AgroRed,
con **Node.js + Express** organizado en capas. Datos en memoria; en el Taller 2 pasan a MySQL.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3004/health y http://localhost:3004/pedidos

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/pedidos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/pedidos.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/pedidos.service.js | Lógica de negocio | Validaciones y reglas; no conoce HTTP ni la base de datos |
| src/repositories/pedidos.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/pedido.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Contrato de la API (borrador)

Así responde `GET /pedidos/1`:

```json
{
  "id": 1,
  "cliente_id": 1,
  "producto_id": 1,
  "cantidad": 120,
  "centro_distribucion": "Bogotá",
  "estado": "recibido",
  "fecha": "2026-10-26"
}
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| cliente_id | entero | Sí | Entero positivo; referencia a un cliente de ms-clientes |
| producto_id | entero | Sí | Entero positivo; referencia a un producto de ms-productos |
| cantidad | entero | Sí | Entero positivo |
| centro_distribucion | texto | Sí | `Bogotá` o `Cali` |
| estado | texto | No (por defecto `recibido`) | `recibido`, `despachado` o `entregado` |
| fecha | texto | No (por defecto, la de hoy) | Formato AAAA-MM-DD y fecha real |

Los campos que no estén en la tabla se descartan al crear un pedido.

En el Taller 3 la respuesta traerá además los objetos relacionados
`cliente: {id, nombre}` y `producto: {id, nombre, precio}`, que este servicio pedirá por REST
a ms-clientes y ms-productos. Aquí solo se guardan los ids.

## Endpoints (Taller 1)

| Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|
| GET | /health | 200 `{"servicio":"ms-pedidos","estado":"ok"}` | — |
| GET | /pedidos | 200, arreglo de pedidos | — |
| GET | /pedidos/:id | 200, el pedido | 400 id no numérico · 404 no existe |
| POST | /pedidos | 201, el pedido creado con su id + cabecera Location | 400 datos inválidos |

Ejemplo de cuerpo para POST:

```json
{
  "cliente_id": 2,
  "producto_id": 1,
  "cantidad": 50,
  "centro_distribucion": "Cali"
}
```

## Formato de los errores

```json
{
  "error": "Datos inválidos",
  "detalles": ["cantidad es obligatoria y debe ser un entero positivo"]
}
```

La lista `detalles` aparece solo en los errores de validación.