# frontend · AgroRed G1 diurno

HTML, CSS y JavaScript sin frameworks. En el Taller 2 usa datos de ejemplo (`data/*.json`) con la misma forma que los contratos de cada microservicio.

## Cómo abrirlo

Los datos se cargan con `fetch`, así que **no funciona con doble clic** (file://). Usen la extensión **Live Server** de VS Code: clic derecho en `frontend/index.html` → *Open with Live Server*, o el botón **Go Live** de la barra inferior.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Inicio de sesión (simulado: se elige el rol) |
| `inicio.html` | Panel general del administrador con los totales |
| `<entidad>.html` + `js/<entidad>.js` | Pantalla de cada entidad (lista, crear, editar, eliminar) |
| `js/config.js` | **Único lugar** con la dirección de la API, la tabla de permisos y el menú de cada rol |
| `js/api.js` | **Único lugar** que pide datos y envía el token (`Api.listar / crear / actualizar / eliminar`) |
| `js/sesion.js` | Sesión, rol, token y permisos |
| `js/layout.js` | Encabezado con nombre y rol, menú y cerrar sesión |
| `css/estilos.css` | Estilos comunes y diseño para celular |
| `data/*.json` | Datos de ejemplo, incluidos los objetos relacionados (`cliente`, `producto`) |

## Paso al Taller 3

1. En `js/config.js`: `USAR_DATOS_EJEMPLO: false` y `API_URL` con la dirección del gateway.
2. En `index.html`: reemplazar el login simulado por `POST /usuarios/login` y guardar el `token` que responde.

Las páginas no cambian: siguen llamando las mismas funciones de `Api`.

## Responsables

| Pantalla | Responsable |
|---|---|
| Estructura común, login, panel | Grupo |
| clientes.html | Miguel Ángel Vanegas |
| productos.html | Daniela Valverde |
| pedidos.html | María Paula Zambrano |
| lotes.html | Gabriela Mellizo |
