-- db/schema.sql
SET NAMES utf8mb4; -- para que las tildes y la ñ se guarden bien

USE pedidos_db;

DROP TABLE IF EXISTS pedidos; -- permite volver a ejecutar el script

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  centro_distribucion VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'recibido',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pedidos (cliente_id, producto_id, cantidad, centro_distribucion, estado, created_at, updated_at) VALUES
(1, 1, 120, 'Bogotá', 'recibido',   '2026-10-26 09:30:00', '2026-10-26 09:30:00'),
(2, 3, 40,  'Cali',   'despachado', '2026-10-24 14:15:00', '2026-10-25 08:00:00'),
(1, 2, 75,  'Cali',   'entregado',  '2026-10-20 11:00:00', '2026-10-22 16:45:00');