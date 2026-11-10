SET NAMES utf8mb4;
CREATE TABLE lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_lote VARCHAR(30) NOT NULL UNIQUE,
  producto_id INT NOT NULL,
  fecha_produccion DATE NOT NULL,
  cantidad INT NOT NULL,
  resultado_calidad VARCHAR(20) NOT NULL DEFAULT 'pendiente'
);
INSERT INTO lotes (codigo_lote, producto_id, fecha_produccion, cantidad, resultado_calidad) VALUES
  ('L-2026-001', 2, '2026-10-20', 500, 'pendiente'),
  ('L-2026-002', 1, '2026-10-21', 300, 'aprobado'),
  ('L-2026-003', 3, '2026-10-22', 120, 'rechazado');