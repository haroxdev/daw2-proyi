/**
 * página de timesheets
 * permite crear periodos, imputar horas en tareas y enviar para aprobación
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Alerta, Modal, Paginador, usePaginacion } from '../components';
import { timesheets, tareas, datosPagina } from '../services/api';

// calcula horas entre dos fechas iso
const calcularHoras = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const diff = new Date(fin) - new Date(inicio);
    return Math.round((diff / 3600000) * 100) / 100;
};

// formatea fecha iso a hh:mm
const formatearHora = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// formatea fecha iso a dd/mm/yyyy
const formatearFecha = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES');
};

export default function PaginaTimesheets() {
    const [listaTimesheets, setListaTimesheets] = useState([]);
    const [tareasAsignadas, setTareasAsignadas] = useState([]);
    const [formulario, setFormulario] = useState({ inicio_periodo: '', fin_periodo: '' });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // modal de detalle
    const [timesheetActivo, setTimesheetActivo] = useState(null);
    const [modalDetalle, setModalDetalle] = useState(false);

    // modal de imputar horas
    const [modalImputar, setModalImputar] = useState(false);
    const [formImputar, setFormImputar] = useState({
        id_tarea: '',
        fecha: '',
        horas: '',
        minutos: '',
    });

    // paginación
    const { itemsPaginados: timesheetsPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaTimesheets, 5);

    const cargarDatos = async () => {
        try {
            const res = await datosPagina.timesheets();
            setListaTimesheets(res.data.timesheets || []);
            setTareasAsignadas(res.data.tareas || []);
        } catch (e) {
            console.error('error cargando timesheets:', e);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // crea nuevo timesheet borrador
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await timesheets.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Timesheet creado correctamente' });
            setFormulario({ inicio_periodo: '', fin_periodo: '' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear timesheet' });
        } finally {
            setCargando(false);
        }
    };

    // enviar timesheet para aprobación
    const manejarEnviar = async (idTimesheet) => {
        setCargando(true);
        setMensaje(null);
        try {
            await timesheets.enviar(idTimesheet);
            setMensaje({ tipo: 'exito', texto: 'Timesheet enviado correctamente' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al enviar' });
        } finally {
            setCargando(false);
        }
    };

    // abre modal de detalle
    const verDetalle = (ts) => {
        setTimesheetActivo(ts);
        setModalDetalle(true);
    };

    // abre modal de imputar horas
    const abrirImputar = (ts) => {
        setTimesheetActivo(ts);
        setFormImputar({
            id_tarea: tareasAsignadas[0]?.id_tarea || '',
            fecha: ts.inicio_periodo,
            horas: '1',
            minutos: '0',
        });
        setModalImputar(true);
    };

    // imputar horas en una tarea
    const manejarImputar = async (e) => {
        e.preventDefault();
        if (!formImputar.id_tarea || !formImputar.fecha) return;

        setCargando(true);
        setMensaje(null);
        try {
            const horasTotal = parseInt(formImputar.horas || 0);
            const minutosTotal = parseInt(formImputar.minutos || 0);
            const totalMinutos = (horasTotal * 60) + minutosTotal;

            if (totalMinutos <= 0) {
                setMensaje({ tipo: 'error', texto: 'Las horas deben ser mayores a 0' });
                setCargando(false);
                return;
            }

            // construye inicio y fin basados en la fecha y duración
            const inicio = new Date(`${formImputar.fecha}T09:00:00`);
            const fin = new Date(inicio.getTime() + totalMinutos * 60000);

            await tareas.imputarTiempo(formImputar.id_tarea, {
                inicio: inicio.toISOString(),
                fin: fin.toISOString(),
            });

            setMensaje({ tipo: 'exito', texto: 'Horas imputadas correctamente' });
            setModalImputar(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al imputar horas' });
        } finally {
            setCargando(false);
        }
    };

    // colores del estado
    const colorEstado = (estado) => {
        const colores = {
            borrador: 'bg-gray-100 text-gray-700',
            enviado: 'bg-blue-100 text-blue-700',
            aprobado: 'bg-green-100 text-green-700',
            rechazado: 'bg-red-100 text-red-700',
        };
        return colores[estado] || colores.borrador;
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* formulario de creación */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Crear timesheet">
                        <form onSubmit={manejarCrear} className="space-y-4">
                            <CampoFormulario
                                etiqueta="Inicio periodo"
                                tipo="date"
                                nombre="inicio_periodo"
                                valor={formulario.inicio_periodo}
                                onChange={manejarCambio}
                                requerido
                            />
                            <CampoFormulario
                                etiqueta="Fin periodo"
                                tipo="date"
                                nombre="fin_periodo"
                                valor={formulario.fin_periodo}
                                onChange={manejarCambio}
                                requerido
                            />
                            <Boton tipo="submit" cargando={cargando}>
                                Crear borrador
                            </Boton>
                        </form>
                    </Tarjeta>
                </div>

                {/* listado de timesheets */}
                <div className="lg:col-span-3">
                    <Tarjeta titulo="Mis timesheets">
                        <div className="space-y-3">
                            {timesheetsPaginados.length > 0 ? (
                                timesheetsPaginados.map((ts) => (
                                    <div
                                        key={ts.id_timesheet}
                                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-semibold text-gray-900">
                                                    {formatearFecha(ts.inicio_periodo)} → {formatearFecha(ts.fin_periodo)}
                                                </span>
                                                <span className={`ml-3 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colorEstado(ts.estado)}`}>
                                                    {ts.estado}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">
                                                {ts.total_horas || 0}h
                                            </span>
                                        </div>

                                        {/* resumen de líneas */}
                                        {ts.lineas?.length > 0 && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                {ts.lineas.length} registro{ts.lineas.length !== 1 ? 's' : ''} de tiempo
                                            </div>
                                        )}

                                        {ts.comentario && (
                                            <p className="text-xs text-gray-500 italic mb-2">"{ts.comentario}"</p>
                                        )}

                                        <div className="flex gap-2">
                                            <Boton
                                                tamano="pequeno"
                                                variante="contorno"
                                                onClick={() => verDetalle(ts)}
                                            >
                                                Ver detalle
                                            </Boton>
                                            {ts.estado === 'borrador' && (
                                                <>
                                                    <Boton
                                                        tamano="pequeno"
                                                        variante="contornoPrimario"
                                                        onClick={() => abrirImputar(ts)}
                                                        deshabilitado={tareasAsignadas.length === 0}
                                                    >
                                                        + Imputar horas
                                                    </Boton>
                                                    <Boton
                                                        tamano="pequeno"
                                                        onClick={() => manejarEnviar(ts.id_timesheet)}
                                                        deshabilitado={cargando}
                                                    >
                                                        Enviar
                                                    </Boton>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    Sin timesheets aún. Crea uno para empezar a registrar horas.
                                </p>
                            )}
                        </div>
                        <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onCambiarPagina={setPaginaActual}
                        />
                    </Tarjeta>
                </div>
            </div>

            {/* modal detalle de timesheet */}
            <Modal
                abierto={modalDetalle}
                onCerrar={() => setModalDetalle(false)}
                titulo={`Timesheet: ${formatearFecha(timesheetActivo?.inicio_periodo)} → ${formatearFecha(timesheetActivo?.fin_periodo)}`}
            >
                {timesheetActivo && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorEstado(timesheetActivo.estado)}`}>
                                {timesheetActivo.estado}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                Total: {timesheetActivo.total_horas || 0}h
                            </span>
                        </div>

                        {timesheetActivo.comentario && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                <span className="font-medium">Comentario:</span> {timesheetActivo.comentario}
                            </div>
                        )}

                        {timesheetActivo.lineas?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left">
                                            <th className="pb-2 font-medium text-gray-600">Tarea</th>
                                            <th className="pb-2 font-medium text-gray-600">Proyecto</th>
                                            <th className="pb-2 font-medium text-gray-600">Fecha</th>
                                            <th className="pb-2 font-medium text-gray-600">Inicio</th>
                                            <th className="pb-2 font-medium text-gray-600">Fin</th>
                                            <th className="pb-2 font-medium text-gray-600 text-right">Horas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {timesheetActivo.lineas.map((linea) => (
                                            <tr key={linea.id_tiempo}>
                                                <td className="py-2 text-gray-900">{linea.tarea}</td>
                                                <td className="py-2 text-gray-500">{linea.proyecto}</td>
                                                <td className="py-2 text-gray-500">{formatearFecha(linea.inicio)}</td>
                                                <td className="py-2 text-gray-500">{formatearHora(linea.inicio)}</td>
                                                <td className="py-2 text-gray-500">
                                                    {linea.abierto ? (
                                                        <span className="text-amber-600 font-medium">En curso</span>
                                                    ) : formatearHora(linea.fin)}
                                                </td>
                                                <td className="py-2 text-right font-medium text-gray-900">
                                                    {linea.horas}h
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Sin horas imputadas en este periodo.
                            </p>
                        )}
                    </div>
                )}
            </Modal>

            {/* modal imputar horas */}
            <Modal
                abierto={modalImputar}
                onCerrar={() => setModalImputar(false)}
                titulo="Imputar horas"
            >
                <form onSubmit={manejarImputar} className="space-y-4">
                    <CampoFormulario
                        etiqueta="Tarea"
                        tipo="select"
                        nombre="id_tarea"
                        valor={formImputar.id_tarea}
                        onChange={(e) => setFormImputar(prev => ({ ...prev, id_tarea: e.target.value }))}
                        opciones={[
                            { valor: '', texto: 'Selecciona una tarea', deshabilitado: true },
                            ...tareasAsignadas.map(t => ({
                                valor: t.id_tarea,
                                texto: `${t.titulo}${t.proyecto ? ` (${t.proyecto.nombre})` : ''}`,
                            }))
                        ]}
                        requerido
                    />
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
                        el {formImputar.fecha ? formatearFecha(formImputar.fecha + 'T00:00:00') : '—'}
                    </p>
                    <Boton tipo="submit" cargando={cargando} className="w-full">
                        Imputar
                    </Boton>
                </form>
            </Modal>
        </div>
    );
}
