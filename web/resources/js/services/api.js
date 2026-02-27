/**
 * servicio centralizado para peticiones http a la api
 * maneja autenticación csrf y respuestas json
 */
import axios from 'axios';

// configuración base de axios
const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});

// interceptor para añadir token csrf
api.interceptors.request.use(config => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// interceptor para manejar errores de autenticación
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// funciones de autenticación
export const autenticacion = {
    iniciarSesion: (email, contrasena) => 
        api.post('/login', { email, password: contrasena }),
    
    cerrarSesion: () => 
        api.post('/logout'),
    
    recuperarContrasena: (email) => 
        api.post('/forgot-password', { email }),
    
    restablecerContrasena: (datos) => 
        api.post('/reset-password', datos)
};

// funciones de fichaje
export const fichaje = {
    entrada: (hora) => 
        api.post('/fichaje/entrada', { hora }),
    
    salida: (hora) => 
        api.post('/fichaje/salida', { hora }),
    
    abrirPausa: (idRegistro) => 
        api.post(`/fichaje/${idRegistro}/pausa/abrir`, { inicio: new Date().toISOString() }),
    
    cerrarPausa: (idPausa) => 
        api.post(`/fichaje/pausa/${idPausa}/cerrar`, { fin: new Date().toISOString() }),
    
    solicitarCorreccion: (idRegistro, datos) => 
        api.post(`/fichaje/${idRegistro}/correcciones`, datos),
    
    resolverCorreccion: (idCorreccion, estado) => 
        api.post(`/fichaje/correcciones/${idCorreccion}/resolver`, { estado })
};

// funciones de ausencias
export const ausencias = {
    crear: (datos) => 
        api.post('/ausencias', datos),
    
    resolver: (idSolicitud, decision) => 
        api.post(`/ausencias/${idSolicitud}/resolver`, { decision })
};

// funciones de timesheets
export const timesheets = {
    crear: (datos) => 
        api.post('/timesheets', datos),
    
    enviar: (idTimesheet) => 
        api.post(`/timesheets/${idTimesheet}/enviar`),
    
    revisar: (idTimesheet, decision, comentario = '') => 
        api.post(`/timesheets/${idTimesheet}/revisar`, { decision, comentario })
};

// funciones de calendario
export const calendario = {
    obtenerEventos: () => 
        api.get('/calendario/mis-eventos'),
    
    obtenerAusencias: () => 
        api.get('/calendario/mis-ausencias'),
    
    crearEvento: (datos) => 
        api.post('/calendario/eventos', datos)
};

// funciones de chat
export const chat = {
    obtenerDatos: () => 
        api.get('/chat/datos'),
    
    obtenerMensajes: () => 
        api.get('/chat/mensajes'),
    
    obtenerMensajesContacto: (contactoId) => 
        api.get(`/chat/mensajes/${contactoId}`),
    
    enviar: (idDestinatario, mensaje) => 
        api.post('/chat', { id_destinatario: idDestinatario, mensaje }),
    
    seleccionarContacto: (contactoId) => 
        api.post('/chat/seleccionar', { contacto_id: contactoId }),
    
    nuevoContacto: (contactoId) => 
        api.post('/chat/nuevo', { contacto_id: contactoId })
};

// funciones de notificaciones
export const notificaciones = {
    marcarLeida: (idNotificacion) => 
        api.post(`/notificaciones/${idNotificacion}/leer`),
    
    marcarTodas: () => 
        api.post('/notificaciones/leer-todas')
};

// funciones de proyectos
export const proyectos = {
    crear: (datos) => 
        api.post('/proyectos', datos),
    
    actualizar: (idProyecto, datos) => 
        api.put(`/proyectos/${idProyecto}`, datos),
    
    eliminar: (idProyecto) => 
        api.delete(`/proyectos/${idProyecto}`),
    
    asignar: (idProyecto, idEmpleado) => 
        api.post(`/proyectos/${idProyecto}/asignar`, { id_empleado: idEmpleado }),
    
    desasignar: (idProyecto, idEmpleado) => 
        api.post(`/proyectos/${idProyecto}/desasignar`, { id_empleado: idEmpleado }),
    
    cambiarEstado: (idProyecto, estado) => 
        api.post(`/proyectos/${idProyecto}/estado`, { estado })
};

// funciones de tareas
export const tareas = {
    crear: (datos) => 
        api.post('/tareas', datos),
    
    actualizar: (idTarea, datos) => 
        api.put(`/tareas/${idTarea}`, datos),
    
    eliminar: (idTarea) => 
        api.delete(`/tareas/${idTarea}`),
    
    asignar: (idTarea, empleadosIds) => 
        api.post(`/tareas/${idTarea}/asignar`, { empleados: Array.isArray(empleadosIds) ? empleadosIds : [empleadosIds].filter(Boolean) }),
    
    imputarTiempo: (idTarea, datos = {}) => 
        api.post(`/tareas/${idTarea}/imputar`, {
            inicio: datos.inicio || new Date().toISOString(),
            fin: datos.fin || null,
        }),
    
    cerrarTimer: (idTiempo) => 
        api.post(`/tiempos/${idTiempo}/cerrar`, { fin: new Date().toISOString() })
};

// funciones de empleados (equipo)
export const empleados = {
    crear: (datos) => 
        api.post('/equipo', datos),
    
    actualizar: (idEmpleado, datos) => 
        api.put(`/equipo/${idEmpleado}`, datos)
};

// funciones de empresa
export const empresa = {
    actualizar: (datos) => 
        api.post('/empresa', datos)
};

// funciones de departamentos
export const departamentos = {
    crear: (datos) => 
        api.post('/departamentos', datos),
    
    actualizar: (idDepartamento, datos) => 
        api.put(`/departamentos/${idDepartamento}`, datos),
    
    eliminar: (idDepartamento) => 
        api.delete(`/departamentos/${idDepartamento}`)
};

// funciones de tipos de ausencia
export const tiposAusencia = {
    crear: (datos) => 
        api.post('/tipos-ausencia', datos),
    
    actualizar: (idTipo, datos) => 
        api.put(`/tipos-ausencia/${idTipo}`, datos),
    
    eliminar: (idTipo) => 
        api.delete(`/tipos-ausencia/${idTipo}`)
};

// funciones de festivos
export const festivos = {
    crear: (datos) =>
        api.post('/festivos', datos),

    actualizar: (idFestivo, datos) =>
        api.put(`/festivos/${idFestivo}`, datos),

    eliminar: (idFestivo) =>
        api.delete(`/festivos/${idFestivo}`)
};

// funciones de perfil del usuario autenticado
export const perfil = {
    actualizar: (datos) =>
        api.put('/perfil', datos)
};

// funciones de setup
export const setup = {
    crear: (datos) => 
        api.post('/setup', datos)
};

// funciones de exportación csv
export const exportacion = {
    fichajes: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.inicio) params.append('inicio', filtros.inicio);
        if (filtros.fin) params.append('fin', filtros.fin);
        if (filtros.id_empleado) params.append('id_empleado', filtros.id_empleado);
        return `/exportar/fichajes?${params.toString()}`;
    },
    proyectos: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.inicio) params.append('inicio', filtros.inicio);
        if (filtros.fin) params.append('fin', filtros.fin);
        if (filtros.id_proyecto) params.append('id_proyecto', filtros.id_proyecto);
        return `/exportar/proyectos?${params.toString()}`;
    },
    ausencias: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.inicio) params.append('inicio', filtros.inicio);
        if (filtros.fin) params.append('fin', filtros.fin);
        if (filtros.id_empleado) params.append('id_empleado', filtros.id_empleado);
        if (filtros.id_tipo) params.append('id_tipo', filtros.id_tipo);
        return `/exportar/ausencias?${params.toString()}`;
    },
};

/**
 * carga datos de una página desde la api
 * se usa cuando la navegación es client-side y __DATOS_PAGINA__ está obsoleto
 */
export const datosPagina = {
    panel: () => api.get('/api/datos/panel'),
    fichaje: () => api.get('/api/datos/fichaje'),
    ausencias: () => api.get('/api/datos/ausencias'),
    timesheets: () => api.get('/api/datos/timesheets'),
    calendario: () => api.get('/api/datos/calendario'),
    notificaciones: (pagina = 1) => api.get(`/api/datos/notificaciones?pagina=${pagina}`),
    proyectos: () => api.get('/api/datos/proyectos'),
    tareas: () => api.get('/api/datos/tareas'),
    equipo: () => api.get('/api/datos/equipo'),
    empresa: () => api.get('/api/datos/empresa'),
    departamentos: () => api.get('/api/datos/departamentos'),
    tiposAusencia: () => api.get('/api/datos/tipos-ausencia'),
    revisiones: () => api.get('/api/datos/revisiones'),
    reporting: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.inicio) params.append('inicio', filtros.inicio);
        if (filtros.fin) params.append('fin', filtros.fin);
        const query = params.toString();
        return api.get(`/api/datos/reporting${query ? '?' + query : ''}`);
    },
    contadores: () => api.get('/api/datos/contadores'),
    perfil: () => api.get('/api/datos/perfil'),
    festivos: () => api.get('/api/datos/festivos'),
};

export default api;
