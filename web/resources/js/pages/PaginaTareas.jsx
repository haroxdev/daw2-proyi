/**
 * página de tareas (admin)
 * permite crear y gestionar tareas de proyectos
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { tareas, datosPagina } from '../services/api';

export default function PaginaTareas() {
    // estado local
    const [listaTareas, setListaTareas] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [formulario, setFormulario] = useState({
        id_proyecto: '',
        id_empleado: '',
        titulo: '',
        descripcion: '',
        prioridad: '',
        estado: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: tareasPaginadas, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaTareas, 5);

    // carga datos desde API
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

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // crea una nueva tarea
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await tareas.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Tarea creada correctamente' });
            setFormulario({ id_proyecto: '', id_empleado: '', titulo: '', descripcion: '', prioridad: '', estado: '' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear tarea' });
        } finally {
            setCargando(false);
        }
    };

    // asigna tarea a empleado
    const manejarAsignar = async (idTarea, idEmpleado) => {
        setCargando(true);
        try {
            await tareas.asignar(idTarea, idEmpleado || null);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al asignar tarea' });
        } finally {
            setCargando(false);
        }
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
                        <CampoFormulario
                            etiqueta="Asignar a"
                            tipo="select"
                            nombre="id_empleado"
                            valor={formulario.id_empleado}
                            onChange={manejarCambio}
                            opciones={opcionesEmpleado}
                        />
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
                                    tareasPaginadas.map((tarea) => (
                                        <FilaTabla key={tarea.id_tarea}>
                                            <CeldaTabla>{tarea.titulo}</CeldaTabla>
                                            <CeldaTabla>{tarea.proyecto?.nombre || '—'}</CeldaTabla>
                                            <CeldaTabla>{tarea.empleado?.nombre || 'Sin asignar'}</CeldaTabla>
                                            <CeldaTabla>{etiquetaEstado(tarea.prioridad)}</CeldaTabla>
                                            <CeldaTabla>{etiquetaEstado(tarea.estado || 'pendiente')}</CeldaTabla>
                                            <CeldaTabla>{tarea.tiempos?.length || 0} registros</CeldaTabla>
                                            <CeldaTabla>
                                                <div className="flex flex-col gap-1">
                                                    <Boton
                                                        tamano="pequeno"
                                                        variante="contorno"
                                                        onClick={() => manejarAsignar(tarea.id_tarea, '')}
                                                        deshabilitado={cargando}
                                                    >
                                                        Desasignar
                                                    </Boton>
                                                    <div className="flex gap-1">
                                                        <select 
                                                            className="flex-1 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white"
                                                            onChange={(e) => manejarAsignar(tarea.id_tarea, e.target.value)}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Asignar</option>
                                                            {empleados.map(emp => (
                                                                <option key={emp.id_empleado} value={emp.id_empleado}>
                                                                    {emp.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </CeldaTabla>
                                        </FilaTabla>
                                    ))
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
        </div>
    );
}
