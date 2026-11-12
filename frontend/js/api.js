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
async function pedirApi(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Sesion.token()}`,
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (respuesta.status === 401) Sesion.cerrar(); // token vencido: volver a entrar
  if (respuesta.status === 204) return null;
  const json = await respuesta.json();
  if (!respuesta.ok) throw new Error(json.error || `Error ${respuesta.status}`);
  return json;
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
