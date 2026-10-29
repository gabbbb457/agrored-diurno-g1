// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Cliente y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIT_VALIDO = /^\d{6,10}-\d$/; // ej. 900123456-1

function textoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarCliente(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del cliente'];
  }
  if (!textoNoVacio(datos.nombre)) {
    errores.push('nombre es obligatorio');
  }
  if (typeof datos.nit !== 'string' || !NIT_VALIDO.test(datos.nit.trim())) {
    errores.push('nit es obligatorio y debe tener el formato 900123456-1');
  }
  if (typeof datos.email !== 'string' || !EMAIL_VALIDO.test(datos.email.trim())) {
    errores.push('email es obligatorio y debe tener un formato válido');
  }
  if (!textoNoVacio(datos.telefono)) {
    errores.push('telefono es obligatorio');
  }
  if (!textoNoVacio(datos.ciudad)) {
    errores.push('ciudad es obligatoria');
  }
  if (datos.activo !== undefined && typeof datos.activo !== 'boolean') {
    errores.push('activo debe ser true o false');
  }
  return errores;
}

// Construye un cliente "limpio" solo con los campos permitidos.
// id lo asigna el repositorio; fecha_registro la asigna el servicio al crear.
function construirCliente(datos) {
  return {
    nombre: datos.nombre.trim(),
    nit: datos.nit.trim(),
    email: datos.email.trim().toLowerCase(),
    telefono: datos.telefono.trim(),
    ciudad: datos.ciudad.trim(),
    fecha_registro: new Date().toISOString().slice(0, 10),
    activo: datos.activo === undefined ? true : datos.activo,
  };
}

module.exports = { validarCliente, construirCliente };
