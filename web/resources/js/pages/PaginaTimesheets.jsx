/**
 * página de timesheets
 * permite crear y gestionar periodos de trabajo
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { timesheets, datosPagina } from '../services/api';

export default function PaginaTimesheets() {
    // estado local
    const [listaTimesheets, setListaTimesheets] = useState([]);
    const [formulario, setFormulario] = useState({
        inicio_periodo: '',
        fin_periodo: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: timesheetsPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaTimesheets, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.timesheets();
            setListaTimesheets(res.data.timesheets || []);
        } catch (e) {
            console.error('error cargando timesheets:', e);
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

    // maneja creación de timesheet
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

    // maneja envío de timesheet
    const manejarEnviar = async (idTimesheet) => {
        setCargando(true);
        setMensaje(null);
        try {
            await timesheets.enviar(idTimesheet);
            setMensaje({ tipo: 'exito', texto: 'Timesheet enviado correctamente' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al enviar timesheet' });
        } finally {
            setCargando(false);
        }
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
                            <Boton 
                                tipo="submit" 
                                cargando={cargando}
                            >
                                Crear borrador
                            </Boton>
                        </form>
                    </Tarjeta>
                </div>

                {/* listado de timesheets */}
                <div className="lg:col-span-3">
                    <Tarjeta titulo="Mis timesheets">
                        <Tabla>
                            <EncabezadoTabla>
                                <CeldaEncabezado>Periodo</CeldaEncabezado>
                                <CeldaEncabezado>Estado</CeldaEncabezado>
                                <CeldaEncabezado>Acciones</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {timesheetsPaginados.length > 0 ? (
                                    timesheetsPaginados.map((ts, indice) => (
                                        <FilaTabla key={ts.id_timesheet || indice}>
                                            <CeldaTabla>
                                                {ts.inicio_periodo} → {ts.fin_periodo}
                                            </CeldaTabla>
                                            <CeldaTabla>{etiquetaEstado(ts.estado)}</CeldaTabla>
                                            <CeldaTabla>
                                                {ts.estado === 'borrador' ? (
                                                    <Boton
                                                        tamano="pequeno"
                                                        variante="contornoPrimario"
                                                        onClick={() => manejarEnviar(ts.id_timesheet)}
                                                        deshabilitado={cargando}
                                                    >
                                                        Enviar
                                                    </Boton>
                                                ) : (
                                                    <span className="text-slate-500">Sin acciones</span>
                                                )}
                                            </CeldaTabla>
                                        </FilaTabla>
                                    ))
                                ) : (
                                    <TablaVacia mensaje="Sin timesheets aún." columnas={3} />
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
