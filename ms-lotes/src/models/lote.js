// Modelo Lote: define los atributos de un lote y cómo se validan.
const RESULTADOS = ['pendiente', 'aprobado', 'rechazado'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function validarLote(datos = {}) {
  const errores = [];
  if (typeof datos.codigo_lote !== 'string' || datos.codigo_lote.trim() === '')
    errores.push('codigo_lote es obligatorio');
  if (!Number.isInteger(datos.producto_id) || datos.producto_id <= 0)
    errores.push('producto_id es obligatorio y debe ser un entero positivo');
  if (typeof datos.fecha_produccion !== 'string' || !FECHA.test(datos.fecha_produccion))
    errores.push('fecha_produccion es obligatoria con formato AAAA-MM-DD');
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0)
    errores.push('cantidad es obligatoria y debe ser un entero mayor que 0');
  if (!RESULTADOS.includes(datos.resultado_calidad))
    errores.push(`resultado_calidad debe ser uno de: ${RESULTADOS.join(', ')}`);
  return errores;
}

function construirLote(datos) {
  return {
    codigo_lote: datos.codigo_lote.trim(),
    producto_id: datos.producto_id,
    fecha_produccion: datos.fecha_produccion,
    cantidad: datos.cantidad,
    resultado_calidad: datos.resultado_calidad,
  };
}

module.exports = { validarLote, construirLote };
