-- Base de datos y usuario de ms-productos en servidor1. Ejecutar con: sudo mysql
-- Reemplazar CAMBIAR_CLAVE por la contraseña de producción (solo letras y números).
CREATE DATABASE productos_db;
CREATE USER 'productos_user'@'172.17.1.19' IDENTIFIED BY 'CAMBIAR_CLAVE';
GRANT ALL PRIVILEGES ON productos_db.* TO 'productos_user'@'172.17.1.19';