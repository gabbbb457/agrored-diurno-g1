# ms-productos · AgroRed S.A.

Redes y Servicios Multimedia · UAO · Microservicio de **productos** (los que fabrica o
comercializa AgroRed), con **Node.js + Express** organizado en capas.

Esta es la versión del Taller 1: datos en memoria y tres operaciones. La persistencia en
MySQL y el CRUD completo se agregan en el Taller 2.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3002/health y http://localhost:3002/productos

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/productos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/productos.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/productos.service.js | Lógica de negocio | Validaciones y reglas (nombre único); no conoce HTTP ni la base de datos |
| src/repositories/productos.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/producto.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Atributos (contrato)

| Atributo | Tipo | Regla |
|---|---|---|
| id | entero | lo asigna el servicio |
| nombre | texto | obligatorio y único |
| categoria | texto | fruta, hortaliza o procesado |
| unidad | texto | kg o caja |
| precio | número | mayor que 0 |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-productos","estado":"ok"}` |
| GET | /productos | 200 arreglo de productos |
| GET | /productos/:id | 200 producto · 400 id inválido · 404 no existe |
| POST | /productos | 201 producto creado · 400 datos inválidos · 409 nombre repetido |

Ejemplo de cuerpo para POST:
`{"nombre": "Papaya Hawaiana", "categoria": "fruta", "unidad": "kg", "precio": 4200}`