# ms-clientes · Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **clientes** con **Node.js + Express**
organizado en capas. Versión del Taller 1: datos en memoria y tres operaciones.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3003/health y http://localhost:3003/clientes

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/clientes.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y reglas (NIT único); no conoce HTTP ni la base de datos |
| src/repositories/clientes.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/cliente.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Contrato de la API

Representación de un cliente (`GET /clientes/1`):

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

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna el servicio) | Positivo y único |
| nombre | texto | Sí | No vacío; sin espacios al inicio/final |
| nit | texto | Sí | Formato `900123456-1`; único (si se repite: 409) |
| email | texto | Sí | Correo válido; se guarda en minúsculas |
| telefono | texto | Sí | No vacío |
| ciudad | texto | Sí | No vacía |
| fecha_registro | texto (AAAA-MM-DD) | No (la asigna el servicio) | Fecha de creación |
| activo | booleano | No (por defecto `true`) | Solo true o false |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-clientes","estado":"ok"}` |
| GET | /clientes | 200 arreglo de clientes |
| GET | /clientes/:id | 200 cliente · 400 id inválido · 404 no existe |
| POST | /clientes | 201 cliente creado + cabecera Location · 400 datos inválidos · 409 NIT repetido |

Cuerpo para POST:

```json
{ "nombre": "Ferretería Central", "nit": "900555111-2", "email": "ferre@central.com", "telefono": "3151112233", "ciudad": "Palmira" }
```
