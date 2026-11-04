-- db/schema.sql · ms-clientes (AgroRed)
-- Antes de ejecutarlo, como administrador (root), una sola vez:
--   CREATE DATABASE clientes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
--   GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
-- Luego, desde la carpeta ms-clientes:
--   mysql -u clientes_user -p clientes_db
--   mysql> SOURCE db/schema.sql;

SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

DROP TABLE IF EXISTS clientes; -- permite volver a ejecutar el script

CREATE TABLE clientes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  nit            VARCHAR(15)  NOT NULL UNIQUE,
  email          VARCHAR(120) NOT NULL,
  telefono       VARCHAR(20)  NOT NULL,
  ciudad         VARCHAR(60)  NOT NULL,
  fecha_registro DATE         NOT NULL,
  activo         BOOLEAN      NOT NULL DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO clientes (nombre, nit, email, telefono, ciudad, fecha_registro, activo) VALUES
  ('Distribuidora El Valle',     '900123456-1', 'contacto@elvalle.com',   '3001234567', 'Cali',         '2026-10-01', TRUE),
  ('Comercial Andina',           '800987654-3', 'ventas@andina.com',      '3109876543', 'Medellín',     '2026-10-05', TRUE),
  ('Supermercados del Pacífico', '901234567-8', 'info@superpacifico.com', '3205558899', 'Buenaventura', '2026-10-12', FALSE);
