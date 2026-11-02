// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Pedido de AgroRed y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// cliente_id y producto_id son referencias (ids) a registros que viven en
// ms-clientes y ms-productos: aquí solo se guarda el id, nunca una copia.
// created_at y updated_at los pone el servicio: el cliente no los envía.
// =====================================================================

const CENTROS = ['Bogotá', 'Cali'];
const ESTADOS = ['recibido', 'despachado', 'entregado'];

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}

// Fecha y hora actuales (hora local del equipo) como AAAA-MM-DDTHH:MM:SS
function ahora() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Devuelve una lista de errores de validación (vacía si todo está bien).
// Al crear, estado es opcional. Al actualizar (PUT reemplaza el pedido
// completo) se pasa { completo: true } y estado pasa a ser obligatorio.
function validarPedido(datos, { completo = false } = {}) {
  const errores = [];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del pedido'];
  }
  if (!esEnteroPositivo(datos.cliente_id)) {
    errores.push('cliente_id es obligatorio y debe ser un entero positivo');
  }
  if (!esEnteroPositivo(datos.producto_id)) {
    errores.push('producto_id es obligatorio y debe ser un entero positivo');
  }
  if (!esEnteroPositivo(datos.cantidad)) {
    errores.push('cantidad es obligatoria y debe ser un entero positivo');
  }
  if (!CENTROS.includes(datos.centro_distribucion)) {
    errores.push(`centro_distribucion debe ser uno de: ${CENTROS.join(', ')}`);
  }
  if (completo || datos.estado !== undefined) {
    if (!ESTADOS.includes(datos.estado)) {
      errores.push(`estado${completo ? ' es obligatorio y' : ''} debe ser uno de: ${ESTADOS.join(', ')}`);
    }
  }
  return errores;
}

// Construye un pedido nuevo "limpio" solo con los campos permitidos
function construirPedido(datos) {
  const momento = ahora();
  return {
    cliente_id: datos.cliente_id,
    producto_id: datos.producto_id,
    cantidad: datos.cantidad,
    centro_distribucion: datos.centro_distribucion,
    estado: datos.estado === undefined ? 'recibido' : datos.estado,
    created_at: momento,
    updated_at: momento,
  };
}

// Construye el pedido actualizado: conserva created_at y renueva updated_at
function construirActualizacion(datos, existente) {
  return {
    cliente_id: datos.cliente_id,
    producto_id: datos.producto_id,
    cantidad: datos.cantidad,
    centro_distribucion: datos.centro_distribucion,
    estado: datos.estado,
    created_at: existente.created_at,
    updated_at: ahora(),
  };
}

module.exports = { ESTADOS, validarPedido, construirPedido, construirActualizacion };