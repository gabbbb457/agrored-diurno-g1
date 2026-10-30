# agrored-diurno-g1

**AgroRed S.A.** · Grupo 1 · Jornada diurna · Redes y Servicios Multimedia · Módulo 3 · UAO
Aplicación web de AgroRed S.A. (agroindustria y distribución) que gestiona productos, clientes, pedidos y lotes de producción mediante microservicios REST en Node.js y Express, organizados en capas.

## Integrantes
- Daniela Valverde: Danix5925 (ms-productos)
- Miguel Angel Vanegas: MDvanegas (ms-clientes)
- Maria Paula Zambrano: ccdfmck (ms-pedidos)
- Gabriela Mellizo: gabbbb457 (ms-lotes)

## Tabla de Microservicios
| Carpeta | Entidad | Responsable | Puerto | Depende de |
|---|---|---|---|---|
| ms-usuarios | Usuario | Docente | 3001 | — |
| ms-productos | Producto | Daniela Valverde | 3002 | — |
| ms-clientes | Cliente | Miguel Ángel Vanegas | 3003 | — |
| ms-pedidos | Pedido | María Paula Zambrano | 3004 | ms-clientes, ms-productos |
| ms-lotes | Lote | Gabriela Mellizo | 3005 | ms-productos |

Las dependencias son referencias por id que se validan por REST a partir del Taller 3.

## Estructura del repositorio
- `README.md`: este archivo.
- `ms-usuarios/`: microservicio de usuarios entregado por la docente; nadie lo modifica.
- `ms-productos/`, `ms-clientes/`, `ms-pedidos/`, `ms-lotes/`: un microservicio por integrante, cada uno en su carpeta.
- `postman/`: colecciones de Postman con las pruebas.
- `frontend/` y `deploy/`: se agregarán en los siguientes talleres (interfaz web y archivos de despliegue).

## Cómo ejecutar un microservicio
Requisitos: Node.js LTS 22.9 o superior (`node -v`).
```
cd ms-productos            # la carpeta del microservicio que quieras correr
npm install                # descarga las dependencias
copy .env.example .env     # en Windows (en Linux o Mac: cp .env.example .env)
npm run dev                # inicia el servicio y se reinicia al guardar cambios
```
Luego abre `http://localhost:<puerto>/health` (por ejemplo, `http://localhost:3002/health` para ms-productos).
