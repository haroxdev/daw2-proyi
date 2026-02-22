// página de gestión de proyectos (admin)
// crud completo con tareas y asignación de empleados
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Modal, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { proyectos, tareas, datosPagina } from '../services/api';

// formulario vacío por defecto
const formularioVacio = { nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' };
const formularioTareaVacio = { id_proyecto: '', id_empleado: '', titulo: '', descripcion: '', prioridad: 'media', estado: 'pendiente' };

export default function PaginaProyectos() {
    const [listaProyectos, setListaProyectos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // modales
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [modalTarea, setModalTarea] = useState(false);

    // datos de formularios
    const [formulario, setFormulario] = useState({ ...formularioVacio });
    const [formularioTarea, setFormularioTarea] = useState({ ...formularioTareaVacio });
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

    // filtro de estado
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const cargarDatos = async () => {
        try {
            const res = await datosPagina.proyectos();
            setListaProyectos(res.data.proyectos || []);
            setEmpleados(res.data.empleados || []);
        } catch (e) {
            console.error('error cargando proyectos:', e);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const manejarCambioTarea = (e) => {
        const { name, value } = e.target;
        setFormularioTarea(prev => ({ ...prev, [name]: value }));
    };

    // --- crud proyectos ---

    const crearProyecto = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await proyectos.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Proyecto creado correctamente' });
            setFormulario({ ...formularioVacio });
            setModalCrear(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear proyecto' });
        } finally {
            setCargando(false);
        }
    };

    const editarProyecto = async (e) => {
        e.preventDefault();
        if (!proyectoSeleccionado) return;
        setCargando(true);
        setMensaje(null);
        try {
            await proyectos.actualizar(proyectoSeleccionado.id_proyecto, formulario);
            setMensaje({ tipo: 'exito', texto: 'Proyecto actualizado correctamente' });
            setModalEditar(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al actualizar proyecto' });
        } finally {
            setCargando(false);
        }
    };

    const eliminarProyecto = async () => {
        if (!proyectoSeleccionado) return;
        setCargando(true);
        setMensaje(null);
        try {
            await proyectos.eliminar(proyectoSeleccionado.id_proyecto);
            setMensaje({ tipo: 'exito', texto: 'Proyecto eliminado correctamente' });
            setModalEliminar(false);
            setProyectoSeleccionado(null);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al eliminar proyecto' });
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (proyecto, estado) => {
        setCargando(true);
        try {
            await proyectos.cambiarEstado(proyecto.id_proyecto, estado);
            await cargarDatos();
            // actualiza detalle si está abierto
            if (proyectoSeleccionado?.id_proyecto === proyecto.id_proyecto) {
                setProyectoSeleccionado(prev => ({ ...prev, estado }));
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al cambiar estado' });
        } finally {
            setCargando(false);
        }
    };

    // --- asignación de empleados ---

    const asignarEmpleado = async (idProyecto, idEmpleado) => {
        if (!idEmpleado) return;
        setCargando(true);
        try {
            await proyectos.asignar(idProyecto, idEmpleado);
            await cargarDatos();
            // actualiza el detalle abierto
            if (proyectoSeleccionado?.id_proyecto === idProyecto) {
                const res = await datosPagina.proyectos();
                const actualizado = (res.data.proyectos || []).find(p => p.id_proyecto === idProyecto);
                if (actualizado) setProyectoSeleccionado(actualizado);
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al asignar empleado' });
        } finally {
            setCargando(false);
        }
    };

    const desasignarEmpleado = async (idProyecto, idEmpleado) => {
        setCargando(true);
        try {
            await proyectos.desasignar(idProyecto, idEmpleado);
            await cargarDatos();
            if (proyectoSeleccionado?.id_proyecto === idProyecto) {
                const res = await datosPagina.proyectos();
                const actualizado = (res.data.proyectos || []).find(p => p.id_proyecto === idProyecto);
                if (actualizado) setProyectoSeleccionado(actualizado);
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al desasignar empleado' });
        } finally {
            setCargando(false);
        }
    };

    // --- tareas desde proyecto ---

    const crearTarea = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await tareas.crear({ ...formularioTarea, id_proyecto: proyectoSeleccionado.id_proyecto });
            setMensaje({ tipo: 'exito', texto: 'Tarea creada correctamente' });
            setFormularioTarea({ ...formularioTareaVacio });
            setModalTarea(false);
            await cargarDatos();
            // refresca detalle
            const res = await datosPagina.proyectos();
            const actualizado = (res.data.proyectos || []).find(p => p.id_proyecto === proyectoSeleccionado.id_proyecto);
            if (actualizado) setProyectoSeleccionado(actualizado);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear tarea' });
        } finally {
            setCargando(false);
        }
    };

    const eliminarTarea = async (idTarea) => {
        setCargando(true);
        try {
            await tareas.eliminar(idTarea);
            await cargarDatos();
            const res = await datosPagina.proyectos();
            const actualizado = (res.data.proyectos || []).find(p => p.id_proyecto === proyectoSeleccionado.id_proyecto);
            if (actualizado) setProyectoSeleccionado(actualizado);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al eliminar tarea' });
        } finally {
            setCargando(false);
        }
    };

    // --- helpers ---

    const abrirEdicion = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setFormulario({
            nombre: proyecto.nombre || '',
            descripcion: proyecto.descripcion || '',
            fecha_inicio: proyecto.fecha_inicio || '',
            fecha_fin: proyecto.fecha_fin || '',
            estado: proyecto.estado || 'activo'
        });
        setModalEditar(true);
    };

    const abrirDetalle = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setModalDetalle(true);
    };

    const abrirEliminar = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setModalEliminar(true);
    };

    const abrirCrearTarea = () => {
        setFormularioTarea({ ...formularioTareaVacio, id_proyecto: proyectoSeleccionado.id_proyecto });
        setModalTarea(true);
    };

    // filtrado
    const proyectosFiltrados = filtroEstado === 'todos'
        ? listaProyectos
        : listaProyectos.filter(p => p.estado === filtroEstado);

    // paginación sobre los filtrados
    const { itemsPaginados: proyectosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(proyectosFiltrados, 6);

    // empleados no asignados al proyecto seleccionado
    const empleadosDisponibles = proyectoSeleccionado
        ? empleados.filter(e => !proyectoSeleccionado.empleados?.some(pe => pe.id_empleado === e.id_empleado))
        : empleados;

    const opcionesEstado = [
        { valor: 'activo', texto: 'Activo' },
        { valor: 'en_pausa', texto: 'En pausa' },
        { valor: 'finalizado', texto: 'Finalizado' }
    ];

    const opcionesPrioridad = [
        { valor: 'baja', texto: 'Baja' },
        { valor: 'media', texto: 'Media' },
        { valor: 'alta', texto: 'Alta' }
    ];

    const opcionesEstadoTarea = [
        { valor: 'pendiente', texto: 'Pendiente' },
        { valor: 'en_proceso', texto: 'En proceso' },
        { valor: 'finalizada', texto: 'Finalizada' }
    ];

    const formatearFecha = (fecha) => {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            {/* cabecera con filtros y botón crear */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-sm text-gray-500 mt-1">{listaProyectos.length} proyectos en total</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* filtro de estado */}
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        {['todos', 'activo', 'en_pausa', 'finalizado'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFiltroEstado(estado)}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                    filtroEstado === estado
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {estado === 'todos' ? 'Todos' : estado === 'en_pausa' ? 'En pausa' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Boton onClick={() => { setFormulario({ ...formularioVacio }); setModalCrear(true); }}>
                        + Nuevo proyecto
                    </Boton>
                </div>
            </div>

            {/* grid de tarjetas de proyecto */}
            {proyectosPaginados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {proyectosPaginados.map(proyecto => (
                        <div
                            key={proyecto.id_proyecto}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-5">
                                {/* cabecera tarjeta */}
                                <div className="flex items-start justify-between mb-3">
                                    <h3
                                        className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-red-600 transition-colors"
                                        onClick={() => abrirDetalle(proyecto)}
                                    >
                                        {proyecto.nombre}
                                    </h3>
                                    {etiquetaEstado(proyecto.estado)}
                                </div>

                                {/* descripción */}
                                {proyecto.descripcion && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{proyecto.descripcion}</p>
                                )}

                                {/* fechas */}
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatearFecha(proyecto.fecha_inicio)} → {formatearFecha(proyecto.fecha_fin)}
                                    </span>
                                </div>

                                {/* estadísticas */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {proyecto.empleados?.length || 0} miembros
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {proyecto.tareas_count ?? proyecto.tareas?.length ?? 0} tareas
                                    </div>
                                </div>

                                {/* avatares del equipo */}
                                {proyecto.empleados?.length > 0 && (
                                    <div className="flex -space-x-2 mb-4">
                                        {proyecto.empleados.slice(0, 5).map(emp => (
                                            <div
                                                key={emp.id_empleado}
                                                className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center"
                                                title={emp.nombre}
                                            >
                                                <span className="text-xs font-medium text-red-700">
                                                    {emp.nombre?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                        {proyecto.empleados.length > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-500">+{proyecto.empleados.length - 5}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* acciones */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <Boton tamano="pequeno" variante="contorno" onClick={() => abrirDetalle(proyecto)}>
                                        Ver
                                    </Boton>
                                    <Boton tamano="pequeno" variante="contorno" onClick={() => abrirEdicion(proyecto)}>
                                        Editar
                                    </Boton>
                                    <Boton tamano="pequeno" variante="peligro" onClick={() => abrirEliminar(proyecto)}>
                                        Eliminar
                                    </Boton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Tarjeta>
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-3 text-sm font-medium text-gray-900">Sin proyectos</h3>
                        <p className="mt-1 text-sm text-gray-500">Crea tu primer proyecto para empezar.</p>
                        <div className="mt-4">
                            <Boton onClick={() => { setFormulario({ ...formularioVacio }); setModalCrear(true); }}>
                                + Nuevo proyecto
                            </Boton>
                        </div>
                    </div>
                </Tarjeta>
            )}

            {/* paginador */}
            <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambiarPagina={setPaginaActual}
            />

            {/* modal crear proyecto */}
            <Modal abierto={modalCrear} onCerrar={() => setModalCrear(false)} titulo="Nuevo proyecto">
                <form onSubmit={crearProyecto} className="space-y-4">
                    <CampoFormulario etiqueta="Nombre" tipo="text" nombre="nombre" valor={formulario.nombre} onChange={manejarCambio} requerido />
                    <CampoFormulario etiqueta="Descripción" tipo="textarea" nombre="descripcion" valor={formulario.descripcion} onChange={manejarCambio} filas={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <CampoFormulario etiqueta="Fecha inicio" tipo="date" nombre="fecha_inicio" valor={formulario.fecha_inicio} onChange={manejarCambio} />
                        <CampoFormulario etiqueta="Fecha fin" tipo="date" nombre="fecha_fin" valor={formulario.fecha_fin} onChange={manejarCambio} />
                    </div>
                    <CampoFormulario etiqueta="Estado" tipo="select" nombre="estado" valor={formulario.estado} onChange={manejarCambio} opciones={opcionesEstado} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Boton variante="contorno" onClick={() => setModalCrear(false)}>Cancelar</Boton>
                        <Boton tipo="submit" cargando={cargando}>Crear proyecto</Boton>
                    </div>
                </form>
            </Modal>

            {/* modal editar proyecto */}
            <Modal abierto={modalEditar} onCerrar={() => setModalEditar(false)} titulo="Editar proyecto">
                <form onSubmit={editarProyecto} className="space-y-4">
                    <CampoFormulario etiqueta="Nombre" tipo="text" nombre="nombre" valor={formulario.nombre} onChange={manejarCambio} requerido />
                    <CampoFormulario etiqueta="Descripción" tipo="textarea" nombre="descripcion" valor={formulario.descripcion} onChange={manejarCambio} filas={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <CampoFormulario etiqueta="Fecha inicio" tipo="date" nombre="fecha_inicio" valor={formulario.fecha_inicio} onChange={manejarCambio} />
                        <CampoFormulario etiqueta="Fecha fin" tipo="date" nombre="fecha_fin" valor={formulario.fecha_fin} onChange={manejarCambio} />
                    </div>
                    <CampoFormulario etiqueta="Estado" tipo="select" nombre="estado" valor={formulario.estado} onChange={manejarCambio} opciones={opcionesEstado} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Boton variante="contorno" onClick={() => setModalEditar(false)}>Cancelar</Boton>
                        <Boton tipo="submit" cargando={cargando}>Guardar cambios</Boton>
                    </div>
                </form>
            </Modal>

            {/* modal confirmar eliminación */}
            <Modal abierto={modalEliminar} onCerrar={() => setModalEliminar(false)} titulo="Eliminar proyecto">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                        <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <p className="font-medium text-red-800">¿Eliminar "{proyectoSeleccionado?.nombre}"?</p>
                            <p className="text-sm text-red-600 mt-1">Se eliminarán todas las tareas, tiempos y asignaciones asociadas. Esta acción no se puede deshacer.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Boton variante="contorno" onClick={() => setModalEliminar(false)}>Cancelar</Boton>
                        <Boton variante="peligro" onClick={eliminarProyecto} cargando={cargando}>Eliminar</Boton>
                    </div>
                </div>
            </Modal>

            {/* modal detalle del proyecto */}
            <Modal abierto={modalDetalle} onCerrar={() => setModalDetalle(false)} titulo={proyectoSeleccionado?.nombre || ''} anchura="extragrande">
                {proyectoSeleccionado && (
                    <div className="space-y-6">
                        {/* info general */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Estado</p>
                                <div className="mt-1">{etiquetaEstado(proyectoSeleccionado.estado)}</div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Inicio</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatearFecha(proyectoSeleccionado.fecha_inicio)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Fin</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatearFecha(proyectoSeleccionado.fecha_fin)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Tareas</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{proyectoSeleccionado.tareas?.length || 0}</p>
                            </div>
                        </div>

                        {proyectoSeleccionado.descripcion && (
                            <p className="text-sm text-gray-600">{proyectoSeleccionado.descripcion}</p>
                        )}

                        {/* cambio de estado rápido */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Cambiar estado:</span>
                            {opcionesEstado.map(op => (
                                <Boton
                                    key={op.valor}
                                    tamano="pequeno"
                                    variante={proyectoSeleccionado.estado === op.valor ? 'primario' : 'contorno'}
                                    onClick={() => cambiarEstado(proyectoSeleccionado, op.valor)}
                                    deshabilitado={cargando}
                                >
                                    {op.texto}
                                </Boton>
                            ))}
                        </div>

                        {/* equipo */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">Equipo ({proyectoSeleccionado.empleados?.length || 0})</h4>
                            </div>

                            {/* empleados asignados */}
                            {proyectoSeleccionado.empleados?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {proyectoSeleccionado.empleados.map(emp => (
                                        <span
                                            key={emp.id_empleado}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-red-700">{emp.nombre?.charAt(0)?.toUpperCase()}</span>
                                            </span>
                                            {emp.nombre}
                                            <button
                                                onClick={() => desasignarEmpleado(proyectoSeleccionado.id_proyecto, emp.id_empleado)}
                                                className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                                                title="Quitar del proyecto"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* selector para añadir empleado */}
                            {empleadosDisponibles.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <select
                                        className="flex-1 max-w-xs px-3 py-1.5 text-sm rounded-md bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        onChange={(e) => { asignarEmpleado(proyectoSeleccionado.id_proyecto, e.target.value); e.target.value = ''; }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>+ Añadir miembro...</option>
                                        {empleadosDisponibles.map(emp => (
                                            <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* tareas del proyecto */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">Tareas ({proyectoSeleccionado.tareas?.length || 0})</h4>
                                <Boton tamano="pequeno" onClick={abrirCrearTarea}>+ Tarea</Boton>
                            </div>

                            {proyectoSeleccionado.tareas?.length > 0 ? (
                                <div className="space-y-2">
                                    {proyectoSeleccionado.tareas.map(tarea => (
                                        <div
                                            key={tarea.id_tarea}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{tarea.titulo}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {tarea.empleado?.nombre || 'Sin asignar'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {etiquetaEstado(tarea.prioridad)}
                                                {etiquetaEstado(tarea.estado || 'pendiente')}
                                                <button
                                                    onClick={() => eliminarTarea(tarea.id_tarea)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    title="Eliminar tarea"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">Sin tareas aún. Crea la primera.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* modal crear tarea desde proyecto */}
            <Modal abierto={modalTarea} onCerrar={() => setModalTarea(false)} titulo={`Nueva tarea — ${proyectoSeleccionado?.nombre || ''}`}>
                <form onSubmit={crearTarea} className="space-y-4">
                    <CampoFormulario etiqueta="Título" tipo="text" nombre="titulo" valor={formularioTarea.titulo} onChange={manejarCambioTarea} requerido />
                    <CampoFormulario etiqueta="Descripción" tipo="textarea" nombre="descripcion" valor={formularioTarea.descripcion} onChange={manejarCambioTarea} filas={3} />
                    <CampoFormulario
                        etiqueta="Asignar a"
                        tipo="select"
                        nombre="id_empleado"
                        valor={formularioTarea.id_empleado}
                        onChange={manejarCambioTarea}
                        opciones={[
                            { valor: '', texto: 'Sin asignar' },
                            ...(proyectoSeleccionado?.empleados || []).map(e => ({ valor: e.id_empleado, texto: e.nombre }))
                        ]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <CampoFormulario etiqueta="Prioridad" tipo="select" nombre="prioridad" valor={formularioTarea.prioridad} onChange={manejarCambioTarea} opciones={opcionesPrioridad} />
                        <CampoFormulario etiqueta="Estado" tipo="select" nombre="estado" valor={formularioTarea.estado} onChange={manejarCambioTarea} opciones={opcionesEstadoTarea} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Boton variante="contorno" onClick={() => setModalTarea(false)}>Cancelar</Boton>
                        <Boton tipo="submit" cargando={cargando}>Crear tarea</Boton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}