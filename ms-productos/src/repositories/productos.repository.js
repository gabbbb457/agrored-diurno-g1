// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión en memoria (se pierden al reiniciar).
// Se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const productos = [
  { id: 1, nombre: 'Mango Tommy', categoria: 'fruta', unidad: 'kg', precio: 3500 },
  { id: 2, nombre: 'Tomate Chonto', categoria: 'hortaliza', unidad: 'kg', precio: 2800 },
  { id: 3, nombre: 'Pulpa de Maracuyá', categoria: 'procesado', unidad: 'caja', precio: 45000 },
];
let siguienteId = 4;

// filtros opcionales: { categoria, ids }
async function findAll(filtros = {}) {
  let resultado = productos;

  if (filtros.categoria) {
    resultado = resultado.filter((p) => p.categoria === filtros.categoria);
  }

  if (filtros.ids) {
    resultado = resultado.filter((p) => filtros.ids.includes(p.id));
  }

  return resultado;
}

async function findById(id) {
  return productos.find((p) => p.id === id) || null;
}

// Busca por nombre sin distinguir mayúsculas (para la regla de nombre único)
async function findByNombre(nombre) {
  const buscado = nombre.toLowerCase();
  return productos.find((p) => p.nombre.toLowerCase() === buscado) || null;
}

async function create(producto) {
  const nuevo = { id: siguienteId++, ...producto };
  productos.push(nuevo);
  return nuevo;
}


// Reemplaza los datos del producto, conservando su id
async function update(id, datos) {
  const posicion = productos.findIndex((p) => p.id === id);
  if (posicion === -1) return null;
  productos[posicion] = { id, ...datos };
  return productos[posicion];
}

// Elimina el producto. Devuelve true si existía, false si no
async function remove(id) {
  const posicion = productos.findIndex((p) => p.id === id);
  if (posicion === -1) return false;
  productos.splice(posicion, 1);
  return true;
}


module.exports = { findAll, findById, findByNombre, create, update, remove };