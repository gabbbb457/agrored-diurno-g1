SET NAMES utf8mb4; -- para que las tildes y la ñ se guarden bien

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(30) NOT NULL,
  unidad VARCHAR(10) NOT NULL,
  precio DECIMAL(12,2) NOT NULL
);

INSERT INTO productos (nombre, categoria, unidad, precio) VALUES
  ('Mango Tommy', 'fruta', 'kg', 3500),
  ('Tomate Chonto', 'hortaliza', 'kg', 2800),
  ('Pulpa de Maracuyá', 'procesado', 'caja', 45000);