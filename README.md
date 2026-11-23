# agrored-diurno-g1

AgroRed S.A. · Grupo 1 · Jornada diurna · Redes y Servicios Multimedia · Módulo 3 · UAO

Aplicación web de AgroRed S.A. (agroindustria y distribución) que gestiona productos, clientes, pedidos y lotes de producción mediante microservicios REST en Node.js y Express, organizados en capas. Los microservicios, el frontend y las bases de datos se despliegan en dos servidores y se acceden a través de un gateway Apache.

## Integrantes

| Integrante | GitHub | Microservicio |
|---|---|---|
| Daniela Valverde | Danix5925 | ms-productos |
| Miguel Ángel Vanegas | MDvanegas | ms-clientes |
| María Paula Zambrano | ccdfmck | ms-pedidos |
| Gabriela Mellizo | gabbbb457 | ms-lotes |

## Tabla de microservicios

| Carpeta | Entidad | Responsable | Puerto | Depende de |
|---|---|---|---|---|
| ms-usuarios | Usuario | Docente | 3001 | — |
| ms-productos | Producto | Daniela Valverde | 3002 | — |
| ms-clientes | Cliente | Miguel Ángel Vanegas | 3003 | — |
| ms-pedidos | Pedido | María Paula Zambrano | 3004 | ms-clientes, ms-productos |
| ms-lotes | Lote | Gabriela Mellizo | 3005 | ms-productos |

Las dependencias son referencias por id que se validan por REST entre microservicios (por ejemplo, `GET /productos?ids=1,3` para consultar varios productos en una sola petición).

## Estructura del repositorio

- `README.md`: este archivo.
- `ms-usuarios/`: microservicio de usuarios entregado por la docente; no se modifica, salvo los roles de AgroRed en su `.env.example`.
- `ms-productos/`, `ms-clientes/`, `ms-pedidos/`, `ms-lotes/`: un microservicio por integrante, cada uno en su carpeta.
- `frontend/`: interfaz web (HTML, CSS y JavaScript sin frameworks). Usa la API a través del gateway (`/api`). Más detalles en `frontend/README.md`.
- `deploy/`: archivos de despliegue: el host virtual de Apache (`app.conf`), un servicio de systemd por microservicio (`ms-*.service`) y los scripts SQL que crean las bases y los usuarios de MySQL (`db-productos.sql`, `ms-lotes-db.sql`). No contienen contraseñas.
- `postman/` y la carpeta `docs/` o `postman/` de cada microservicio: colecciones de Postman con las pruebas.

## Arquitectura de despliegue

| Equipo | IP | Qué corre |
|---|---|---|
| servidor1 | 172.17.1.18 | DNS (bind9, zona `agrored.com`), proxy (squid) y MySQL 8.0 |
| servidor2 | 172.17.1.19 | Apache (gateway y frontend) y los cinco microservicios de Node.js 22 como servicios de systemd |

- El navegador entra por `http://app.agrored.com`. Apache sirve el frontend y reenvía `/api/<recurso>` al microservicio correspondiente en `127.0.0.1:<puerto>` (`ProxyPass` y `ProxyPassReverse`).
- Los microservicios escuchan solo en `127.0.0.1`; desde fuera de servidor2 únicamente se llega por Apache. En servidor2 el firewall solo deja abiertos los puertos 22 y 80.
- Cada microservicio tiene su propia base en MySQL (servidor1) y su propio usuario, que solo puede conectarse desde servidor2. El puerto 3306 no se alcanza desde otros equipos.
- Los servicios corren con un usuario sin privilegios (`nodeapps`), leen su configuración de un archivo `.env` (no se sube al repositorio) y se reinician solos si fallan.
- Todos los microservicios verifican los tokens JWT con la misma clave (`JWT_SECRET`), que se define en cada `.env`.
- Roles de usuario: `administrador`, `comercial` y `produccion`. Cada pantalla y cada ruta aplica la tabla de permisos del grupo.
- El gateway no publica `/api/health`; cada microservicio tiene su propio `/health` en su puerto (solo accesible desde servidor2).

## Cómo ejecutar un microservicio en un equipo de desarrollo

Requisitos: Node.js LTS 22.9 o superior (`node -v`) y MySQL con la base del microservicio creada (ver `db/` de cada carpeta).

```
cd ms-productos            # la carpeta del microservicio que quieras correr
npm install                # descarga las dependencias
copy .env.example .env     # en Windows (en Linux o Mac: cp .env.example .env)
npm run dev                # inicia el servicio y se reinicia al guardar cambios
```

Edita el `.env` con tus datos (puerto, base de datos, usuario, contraseña y `JWT_SECRET`) antes de iniciar. Luego abre `http://localhost:<puerto>/health` (por ejemplo, `http://localhost:3002/health` para ms-productos).

## Pruebas con Postman

Las colecciones de cada microservicio están en su carpeta (`docs/` o `postman/`). Para probar el sistema desplegado, las variables de URL apuntan al gateway (`http://app.agrored.com/api`); para probar en un equipo de desarrollo se cambian a `http://127.0.0.1:<puerto>`. Los tokens se guardan como variables secretas y se obtienen corriendo primero la carpeta **0 · Preparar tokens**.
