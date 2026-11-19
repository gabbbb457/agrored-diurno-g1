// =====================================================================
// ACCESO A DATOS DEL FRONTEND (un solo lugar)
// Las páginas solo llaman Api.listar / crear / actualizar / eliminar.
// Taller 2: trabajan sobre los JSON de ejemplo (los cambios duran
// mientras la pestaña esté abierta).
// Taller 3: las mismas funciones hacen fetch a la API real con el token,
// sin cambiar ninguna página.
// =====================================================================
const Api = {
  async listar(recurso) {
    if (CONFIG.USAR_DATOS_EJEMPLO) return [...(await datosEjemplo(recurso))];
    return pedirApi('GET', `/${recurso}`);
  },

  async crear(recurso, datos) {
    if (CONFIG.USAR_DATOS_EJEMPLO) {
      const lista = await datosEjemplo(recurso);
      const id = lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;
      const nuevo = { id, ...datos };
      lista.push(nuevo);
      guardarEjemplo(recurso, lista);
      return nuevo;
    }
    return pedirApi('POST', `/${recurso}`, datos);
  },

  async actualizar(recurso, id, datos) {
    if (CONFIG.USAR_DATOS_EJEMPLO) {
      const lista = await datosEjemplo(recurso);
      const i = lista.findIndex((x) => x.id === id);
      lista[i] = { ...lista[i], ...datos, id };
      guardarEjemplo(recurso, lista);
      return lista[i];
    }
    return pedirApi('PUT', `/${recurso}/${id}`, datos);
  },

  async eliminar(recurso, id) {
    if (CONFIG.USAR_DATOS_EJEMPLO) {
      const lista = (await datosEjemplo(recurso)).filter((x) => x.id !== id);
      guardarEjemplo(recurso, lista);
      return;
    }
    return pedirApi('DELETE', `/${recurso}/${id}`);
  },
};

// ---- Taller 3: petición real con el token en la cabecera Authorization
// Todas las pantallas pasan por aquí, así que los errores se muestran igual
// en toda la aplicación: error.message ya trae un texto listo para el usuario.
async function pedirApi(metodo, ruta, cuerpo) {
  let respuesta;
  try {
    respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Sesion.token()}`,
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (e) {
    throw errorDeApi(0, null); // sin red o servidor apagado
  }
  if (respuesta.status === 401) {
    Sesion.cerrar(); // sin sesión o token vencido: volver a entrar
    throw errorDeApi(401, null);
  }
  if (respuesta.status === 204) return null;

  let json = null;
  try {
    json = await respuesta.json();
  } catch (e) {
    /* respuesta sin JSON (por ejemplo, el 503 que genera Apache) */
  }
  if (!respuesta.ok) throw errorDeApi(respuesta.status, json);
  return json;
}

// Convierte el código HTTP y el cuerpo de error de la API en un mensaje claro
function errorDeApi(status, json) {
  const detalle = json && json.error ? json.error : '';
  const lista = json && Array.isArray(json.detalles) && json.detalles.length
    ? ` (${json.detalles.join('; ')})` : '';
  let mensaje;
  if (status === 0) {
    mensaje = 'No se pudo conectar con el servidor. Revisa la conexión e inténtalo de nuevo.';
  } else if (status === 400) {
    mensaje = `Datos no válidos (400): ${detalle || 'revisa la información enviada'}${lista}`;
  } else if (status === 401) {
    mensaje = 'Tu sesión terminó (401). Inicia sesión de nuevo.';
  } else if (status === 403) {
    mensaje = `No tienes permiso para realizar esta acción (403).${detalle ? ' ' + detalle : ''}`;
  } else if (status === 404) {
    mensaje = `No se encontró lo que buscabas (404).${detalle ? ' ' + detalle : ''}`;
  } else if (status === 409) {
    mensaje = `Conflicto (409): ${detalle || 'ya existe un registro con esos datos'}`;
  } else if (status === 502 || status === 503 || status === 504) {
    mensaje = `El servicio no está disponible en este momento (${status}). Inténtalo de nuevo más tarde.${detalle ? ' ' + detalle : ''}`;
  } else {
    mensaje = detalle || `Error ${status}`;
  }
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// ---- Taller 2: datos de ejemplo (frontend/data/<recurso>.json)
async function datosEjemplo(recurso) {
  const guardados = leerGuardados();
  if (guardados[recurso]) return guardados[recurso];
  const respuesta = await fetch(`data/${recurso}.json`);
  const lista = await respuesta.json();
  guardarEjemplo(recurso, lista);
  return lista;
}

function leerGuardados() {
  try {
    return JSON.parse(sessionStorage.getItem('datos')) || {};
  } catch (e) {
    return {};
  }
}

function guardarEjemplo(recurso, lista) {
  const todos = leerGuardados();
  todos[recurso] = lista;
  try {
    sessionStorage.setItem('datos', JSON.stringify(todos));
  } catch (e) {
    /* sin almacenamiento: los cambios duran hasta recargar */
  }
}