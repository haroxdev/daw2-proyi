// página de tareas (admin) — crear, gestionar tareas e imputar/ver tiempos
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Modal, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { tareas, datosPagina } from '../services/api';
import { calcularHorasTotales, formatearDuracion, formatearFecha, formatearHora } from '../utils';

export default function PaginaTareas() {
    const [listaTareas, setListaTareas] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [formulario, setFormulario] = useState({
        id_proyecto: '',
        empleados: [],
        titulo: '',
        descripcion: '',
        prioridad: '',
        estado: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // modal de tiempos
    const [modalTiempos, setModalTiempos] = useState(false);
    const [tareaActiva, setTareaActiva] = useState(null);

    // modal imputar
    const [modalImputar, setModalImputar] = useState(false);
    const [formImputar, setFormImputar] = useState({ fecha: '', horas: '1', minutos: '0' });

    // modal de asignación múltiple
    const [modalAsignar, setModalAsignar] = useState(false);
    const [tareaAsignar, setTareaAsignar] = useState(null);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);

    // modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    const [tareaEditando, setTareaEditando] = useState(null);
    const [formEditar, setFormEditar] = useState({});

    // paginación
    const { itemsPaginados: tareasPaginadas, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaTareas, 5);

    const cargarDatos = async () => {
        try {
            const res = await datosPagina.tareas();
            setListaTareas(res.data.tareas || []);
            setProyectos(res.data.proyectos || []);
            setEmpleados(res.data.empleados || []);
        } catch (e) {
            console.error('error cargando tareas:', e);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const manejarCambio = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'empleados') {
            const id = parseInt(value);
            setFormulario(prev => ({
                ...prev,
                empleados: checked
                    ? [...prev.empleados, id]
                    : prev.empleados.filter(eId => eId !== id)
            }));
            return;
        }
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await tareas.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Tarea creada correctamente' });
            setFormulario({ id_proyecto: '', empleados: [], titulo: '', descripcion: '', prioridad: '', estado: '' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear tarea' });
        } finally {
            setCargando(false);
        }
    };

    // abre modal de asignación múltiple
    const abrirAsignar = (tarea) => {
        setTareaAsignar(tarea);
        setEmpleadosSeleccionados(tarea.empleados?.map(e => e.id_empleado) || []);
        setModalAsignar(true);
    };

    // guarda asignación múltiple
    const guardarAsignacion = async () => {
        if (!tareaAsignar) return;
        setCargando(true);
        try {
            await tareas.asignar(tareaAsignar.id_tarea, empleadosSeleccionados);
            setMensaje({ tipo: 'exito', texto: 'Asignación actualizada' });
            setModalAsignar(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al asignar tarea' });
        } finally {
            setCargando(false);
        }
    };

    // abre modal de edición con datos de la tarea
    const abrirEditar = (tarea) => {
        setTareaEditando(tarea);
        setFormEditar({
            id_proyecto: tarea.id_proyecto || '',
            titulo: tarea.titulo || '',
            descripcion: tarea.descripcion || '',
            prioridad: tarea.prioridad || '',
            estado: tarea.estado || '',
        });
        setModalEditar(true);
    };

    // maneja cambios en el formulario de edición
    const manejarCambioEditar = (e) => {
        const { name, value } = e.target;
        setFormEditar(prev => ({ ...prev, [name]: value }));
    };

    // guarda cambios de la tarea editada
    const manejarGuardarEdicion = async (e) => {
        e.preventDefault();
        if (!tareaEditando) return;

        setCargando(true);
        setMensaje(null);
        try {
            await tareas.actualizar(tareaEditando.id_tarea, formEditar);
            setMensaje({ tipo: 'exito', texto: 'Tarea actualizada correctamente' });
            setModalEditar(false);
            setTareaEditando(null);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al actualizar tarea' });
        } finally {
            setCargando(false);
        }
    };

    // elimina una tarea
    const manejarEliminar = async (idTarea) => {
        if (!confirm('¿Eliminar esta tarea? Se borrarán también sus registros de tiempo.')) return;

        setCargando(true);
        setMensaje(null);
        try {
            await tareas.eliminar(idTarea);
            setMensaje({ tipo: 'exito', texto: 'Tarea eliminada' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al eliminar' });
        } finally {
            setCargando(false);
        }
    };

    // inicia un timer en la tarea
    const iniciarTimer = async (idTarea) => {
        setCargando(true);
        setMensaje(null);
        try {
            await tareas.imputarTiempo(idTarea, {
                inicio: new Date().toISOString(),
                fin: null,
            });
            setMensaje({ tipo: 'exito', texto: 'Timer iniciado' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al iniciar timer' });
        } finally {
            setCargando(false);
        }
    };

    // detiene un timer abierto
    const pararTimer = async (idTiempo) => {
        setCargando(true);
        setMensaje(null);
        try {
            await tareas.cerrarTimer(idTiempo);
            setMensaje({ tipo: 'exito', texto: 'Timer detenido' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al parar timer' });
        } finally {
            setCargando(false);
        }
    };

    // abre el modal de tiempos de una tarea
    const verTiempos = (tarea) => {
        setTareaActiva(tarea);
        setModalTiempos(true);
    };

    // abre modal de imputar horas manualmente
    const abrirImputar = (tarea) => {
        setTareaActiva(tarea);
        setFormImputar({ fecha: new Date().toISOString().split('T')[0], horas: '1', minutos: '0' });
        setModalImputar(true);
    };

    // imputar horas manualmente
    const manejarImputar = async (e) => {
        e.preventDefault();
        if (!tareaActiva) return;

        const totalMinutos = (parseInt(formImputar.horas || 0) * 60) + parseInt(formImputar.minutos || 0);
        if (totalMinutos <= 0) {
            setMensaje({ tipo: 'error', texto: 'Las horas deben ser mayores a 0' });
            return;
        }

        setCargando(true);
        setMensaje(null);
        try {
            const inicio = new Date(`${formImputar.fecha}T09:00:00`);
            const fin = new Date(inicio.getTime() + totalMinutos * 60000);

            await tareas.imputarTiempo(tareaActiva.id_tarea, {
                inicio: inicio.toISOString(),
                fin: fin.toISOString(),
            });

            setMensaje({ tipo: 'exito', texto: 'Horas imputadas correctamente' });
            setModalImputar(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al imputar' });
        } finally {
            setCargando(false);
        }
    };

    // detecta si la tarea tiene un timer abierto (sin fin)
    const timerAbierto = (tarea) => {
        return tarea.tiempos?.find(t => t.inicio && !t.fin);
    };

    // opciones para selects
    const opcionesProyecto = [
        { valor: '', texto: 'Selecciona', deshabilitado: true },
        ...proyectos.map(p => ({ valor: p.id_proyecto, texto: p.nombre }))
    ];

    const opcionesEmpleado = [
        { valor: '', texto: 'Sin asignar' },
        ...empleados.map(e => ({ valor: e.id_empleado, texto: e.nombre }))
    ];

    const opcionesPrioridad = [
        { valor: '', texto: '—' },
        { valor: 'baja', texto: 'Baja' },
        { valor: 'media', texto: 'Media' },
        { valor: 'alta', texto: 'Alta' }
    ];

    const opcionesEstado = [
        { valor: '', texto: 'Pendiente' },
        { valor: 'en_proceso', texto: 'En proceso' },
        { valor: 'finalizada', texto: 'Finalizada' }
    ];

    return (
        <div className="space-y-6">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* formulario de creación */}
                <Tarjeta titulo="Nueva tarea">
                    <form onSubmit={manejarCrear} className="space-y-4">
                        <CampoFormulario
                            etiqueta="Proyecto"
                            tipo="select"
                            nombre="id_proyecto"
                            valor={formulario.id_proyecto}
                            onChange={manejarCambio}
                            opciones={opcionesProyecto}
                            requerido
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a</label>
                            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                                {empleados.map(emp => (
                                    <label key={emp.id_empleado} className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-1 rounded">
                                        <input
                                            type="checkbox"
                                            name="empleados"
                                            value={emp.id_empleado}
                                            checked={formulario.empleados.includes(emp.id_empleado)}
                                            onChange={manejarCambio}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                        />
                                        {emp.nombre}
                                    </label>
                                ))}
                                {empleados.length === 0 && (
                                    <p className="text-xs text-gray-400">Sin empleados</p>
                                )}
                            </div>
                        </div>
                        <CampoFormulario
                            etiqueta="Título"
                            tipo="text"
                            nombre="titulo"
                            valor={formulario.titulo}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Descripción"
                            tipo="textarea"
                            nombre="descripcion"
                            valor={formulario.descripcion}
                            onChange={manejarCambio}
                            filas={3}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CampoFormulario
                                etiqueta="Prioridad"
                                tipo="select"
                                nombre="prioridad"
                                valor={formulario.prioridad}
                                onChange={manejarCambio}
                                opciones={opcionesPrioridad}
                            />
                            <CampoFormulario
                                etiqueta="Estado"
                                tipo="select"
                                nombre="estado"
                                valor={formulario.estado}
                                onChange={manejarCambio}
                                opciones={opcionesEstado}
                            />
                        </div>
                        <Boton tipo="submit" cargando={cargando} className="w-full">
                            Crear tarea
                        </Boton>
                    </form>
                </Tarjeta>

                {/* listado de tareas */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Tareas">
                        <Tabla>
                            <EncabezadoTabla>
                                <CeldaEncabezado>Título</CeldaEncabezado>
                                <CeldaEncabezado>Proyecto</CeldaEncabezado>
                                <CeldaEncabezado>Asignado</CeldaEncabezado>
                                <CeldaEncabezado>Prioridad</CeldaEncabezado>
                                <CeldaEncabezado>Estado</CeldaEncabezado>
                                <CeldaEncabezado>Tiempo</CeldaEncabezado>
                                <CeldaEncabezado>Acciones</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {tareasPaginadas.length > 0 ? (
                                    tareasPaginadas.map((tarea) => {
                                        const timer = timerAbierto(tarea);
                                        const horasTotal = calcularHorasTotales(tarea.tiempos);

                                        return (
                                            <FilaTabla key={tarea.id_tarea}>
                                                <CeldaTabla>
                                                    <span className="font-medium">{tarea.titulo}</span>
                                                </CeldaTabla>
                                                <CeldaTabla>{tarea.proyecto?.nombre || '—'}</CeldaTabla>
                                                <CeldaTabla>
                                                    {tarea.empleados?.length > 0
                                                        ? <div className="flex flex-wrap gap-1">
                                                            {tarea.empleados.map(e => (
                                                                <span key={e.id_empleado} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                                                    {e.nombre}
                                                                </span>
                                                            ))}
                                                          </div>
                                                        : <span className="text-gray-400">Sin asignar</span>
                                                    }
                                                </CeldaTabla>
                                                <CeldaTabla>{etiquetaEstado(tarea.prioridad)}</CeldaTabla>
                                                <CeldaTabla>{etiquetaEstado(tarea.estado || 'pendiente')}</CeldaTabla>
                                                <CeldaTabla>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <span className="text-sm font-medium">{formatearDuracion(horasTotal)}</span>
                                                        {timer && (
                                                            <span className="text-xs text-green-600 font-medium animate-pulse">
                                                                ● En curso
                                                            </span>
                                                        )}
                                                        {(tarea.tiempos?.length || 0) > 0 && (
                                                            <button
                                                                className="text-xs text-blue-600 hover:underline"
                                                                onClick={() => verTiempos(tarea)}
                                                            >
                                                                Ver {tarea.tiempos.length} registro{tarea.tiempos.length !== 1 ? 's' : ''}
                                                            </button>
                                                        )}
                                                    </div>
                                                </CeldaTabla>
                                                <CeldaTabla>
                                                    <div className="flex flex-col gap-1">
                                                        {/* botones de timer */}
                                                        {timer ? (
                                                            <Boton
                                                                tamano="pequeno"
                                                                variante="contornoPrimario"
                                                                onClick={() => pararTimer(timer.id_tiempo)}
                                                                deshabilitado={cargando}
                                                            >
                                                                ⏹ Parar
                                                            </Boton>
                                                        ) : (
                                                            <Boton
                                                                tamano="pequeno"
                                                                variante="contornoPrimario"
                                                                onClick={() => iniciarTimer(tarea.id_tarea)}
                                                                deshabilitado={cargando}
                                                            >
                                                                ▶ Iniciar
                                                            </Boton>
                                                        )}
                                                        <Boton
                                                            tamano="pequeno"
                                                            variante="contorno"
                                                            onClick={() => abrirImputar(tarea)}
                                                            deshabilitado={cargando}
                                                        >
                                                            + Imputar
                                                        </Boton>
                                                        {/* asignación */}
                                                        <Boton
                                                            tamano="pequeno"
                                                            variante="contorno"
                                                            onClick={() => abrirAsignar(tarea)}
                                                            deshabilitado={cargando}
                                                        >
                                                            Asignar
                                                        </Boton>
                                                        {/* edición */}
                                                        <Boton
                                                            tamano="pequeno"
                                                            variante="contornoPrimario"
                                                            onClick={() => abrirEditar(tarea)}
                                                            deshabilitado={cargando}
                                                        >
                                                            Editar
                                                        </Boton>
                                                        <Boton
                                                            tamano="pequeno"
                                                            variante="contorno"
                                                            onClick={() => manejarEliminar(tarea.id_tarea)}
                                                            deshabilitado={cargando}
                                                        >
                                                            Eliminar
                                                        </Boton>
                                                    </div>
                                                </CeldaTabla>
                                            </FilaTabla>
                                        );
                                    })
                                ) : (
                                    <TablaVacia mensaje="Sin tareas aún." columnas={7} />
                                )}
                            </CuerpoTabla>
                        </Tabla>
                        <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onCambiarPagina={setPaginaActual}
                        />
                    </Tarjeta>
                </div>
            </div>

            {/* modal de tiempos registrados */}
            <Modal
                abierto={modalTiempos}
                onCerrar={() => setModalTiempos(false)}
                titulo={`Tiempos: ${tareaActiva?.titulo || ''}`}
                anchura="grande"
            >
                {tareaActiva && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                Proyecto: {tareaActiva.proyecto?.nombre || '—'}
                            </span>
                            <span className="font-bold text-gray-900">
                                Total: {formatearDuracion(calcularHorasTotales(tareaActiva.tiempos))}
                            </span>
                        </div>

                        {tareaActiva.tiempos?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left">
                                            <th className="pb-2 font-medium text-gray-600">Fecha</th>
                                            <th className="pb-2 font-medium text-gray-600">Inicio</th>
                                            <th className="pb-2 font-medium text-gray-600">Fin</th>
                                            <th className="pb-2 font-medium text-gray-600 text-right">Duración</th>
                                            <th className="pb-2 font-medium text-gray-600">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tareaActiva.tiempos.map((t) => {
                                            const abierto = t.inicio && !t.fin;
                                            const horas = abierto ? 0 : (new Date(t.fin) - new Date(t.inicio)) / 3600000;

                                            return (
                                                <tr key={t.id_tiempo}>
                                                    <td className="py-2 text-gray-500">{formatearFecha(t.inicio)}</td>
                                                    <td className="py-2 text-gray-500">{formatearHora(t.inicio)}</td>
                                                    <td className="py-2 text-gray-500">
                                                        {abierto ? (
                                                            <span className="text-green-600 font-medium animate-pulse">● En curso</span>
                                                        ) : formatearHora(t.fin)}
                                                    </td>
                                                    <td className="py-2 text-right font-medium text-gray-900">
                                                        {abierto ? '—' : formatearDuracion(horas)}
                                                    </td>
                                                    <td className="py-2">
                                                        {abierto && (
                                                            <Boton
                                                                tamano="pequeno"
                                                                variante="contornoPrimario"
                                                                onClick={() => { pararTimer(t.id_tiempo); setModalTiempos(false); }}
                                                                deshabilitado={cargando}
                                                            >
                                                                Parar
                                                            </Boton>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">Sin registros de tiempo.</p>
                        )}
                    </div>
                )}
            </Modal>

            {/* modal imputar horas manualmente */}
            <Modal
                abierto={modalImputar}
                onCerrar={() => setModalImputar(false)}
                titulo={`Imputar horas: ${tareaActiva?.titulo || ''}`}
            >
                <form onSubmit={manejarImputar} className="space-y-4">
                    <CampoFormulario
                        etiqueta="Fecha"
                        tipo="date"
                        nombre="fecha"
                        valor={formImputar.fecha}
                        onChange={(e) => setFormImputar(prev => ({ ...prev, fecha: e.target.value }))}
                        requerido
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <CampoFormulario
                            etiqueta="Horas"
                            tipo="number"
                            nombre="horas"
                            valor={formImputar.horas}
                            onChange={(e) => setFormImputar(prev => ({ ...prev, horas: e.target.value }))}
                            placeholder="0"
                        />
                        <CampoFormulario
                            etiqueta="Minutos"
                            tipo="number"
                            nombre="minutos"
                            valor={formImputar.minutos}
                            onChange={(e) => setFormImputar(prev => ({ ...prev, minutos: e.target.value }))}
                            placeholder="0"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Se registrará {parseInt(formImputar.horas || 0)}h {parseInt(formImputar.minutos || 0)}min
                    </p>
                    <Boton tipo="submit" cargando={cargando} className="w-full">
                        Imputar
                    </Boton>
                </form>
            </Modal>

            {/* modal asignación múltiple */}
            <Modal
                abierto={modalAsignar}
                onCerrar={() => setModalAsignar(false)}
                titulo={`Asignar: ${tareaAsignar?.titulo || ''}`}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Selecciona los empleados que trabajarán en esta tarea.
                    </p>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                        {empleados.map(emp => (
                            <label
                                key={emp.id_empleado}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={empleadosSeleccionados.includes(emp.id_empleado)}
                                    onChange={(e) => {
                                        setEmpleadosSeleccionados(prev =>
                                            e.target.checked
                                                ? [...prev, emp.id_empleado]
                                                : prev.filter(id => id !== emp.id_empleado)
                                        );
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{emp.nombre}</span>
                            </label>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500">
                        {empleadosSeleccionados.length} empleado{empleadosSeleccionados.length !== 1 ? 's' : ''} seleccionado{empleadosSeleccionados.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Boton variante="contorno" onClick={() => setModalAsignar(false)}>
                            Cancelar
                        </Boton>
                        <Boton onClick={guardarAsignacion} cargando={cargando}>
                            Guardar
                        </Boton>
                    </div>
                </div>
            </Modal>

            {/* modal de edición de tarea */}
            <Modal
                abierto={modalEditar}
                onCerrar={() => { setModalEditar(false); setTareaEditando(null); }}
                titulo={`Editar: ${tareaEditando?.titulo || ''}`}
                anchura="grande"
            >
                {tareaEditando && (
                    <form onSubmit={manejarGuardarEdicion} className="space-y-4">
                        <CampoFormulario
                            etiqueta="Título"
                            tipo="text"
                            nombre="titulo"
                            valor={formEditar.titulo}
                            onChange={manejarCambioEditar}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Descripción"
                            tipo="textarea"
                            nombre="descripcion"
                            valor={formEditar.descripcion}
                            onChange={manejarCambioEditar}
                            filas={3}
                        />
                        <CampoFormulario
                            etiqueta="Proyecto"
                            tipo="select"
                            nombre="id_proyecto"
                            valor={formEditar.id_proyecto}
                            onChange={manejarCambioEditar}
                            opciones={opcionesProyecto}
                            requerido
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CampoFormulario
                                etiqueta="Prioridad"
                                tipo="select"
                                nombre="prioridad"
                                valor={formEditar.prioridad}
                                onChange={manejarCambioEditar}
                                opciones={opcionesPrioridad}
                            />
                            <CampoFormulario
                                etiqueta="Estado"
                                tipo="select"
                                nombre="estado"
                                valor={formEditar.estado}
                                onChange={manejarCambioEditar}
                                opciones={opcionesEstado}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Boton
                                variante="contorno"
                                onClick={() => { setModalEditar(false); setTareaEditando(null); }}
                            >
                                Cancelar
                            </Boton>
                            <Boton tipo="submit" cargando={cargando}>
                                Guardar cambios
                            </Boton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
