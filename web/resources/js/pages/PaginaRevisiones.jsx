/**
 * página de revisiones (admin)
 * permite gestionar correcciones, ausencias y timesheets pendientes
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Paginador, usePaginacion } from '../components';
import { fichaje, ausencias, timesheets, datosPagina } from '../services/api';

export default function PaginaRevisiones() {
    // estado local
    const [correcciones, setCorrecciones] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [listaTimesheets, setListaTimesheets] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación independiente para cada lista
    const paginacionCorrecciones = usePaginacion(correcciones, 5);
    const paginacionSolicitudes = usePaginacion(solicitudes, 5);
    const paginacionTimesheets = usePaginacion(listaTimesheets, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.revisiones();
            setCorrecciones(res.data.correcciones || []);
            setSolicitudes(res.data.solicitudes || []);
            setListaTimesheets(res.data.timesheets || []);
        } catch (e) {
            console.error('error cargando revisiones:', e);
        }
    };

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // resuelve una corrección de fichaje
    const resolverCorreccion = async (idCorreccion, estado) => {
        setCargando(true);
        try {
            await fichaje.resolverCorreccion(idCorreccion, estado);
            setMensaje({ tipo: 'exito', texto: `Corrección ${estado}` });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al resolver corrección' });
        } finally {
            setCargando(false);
        }
    };

    // resuelve una solicitud de ausencia
    const resolverAusencia = async (idSolicitud, decision) => {
        setCargando(true);
        try {
            await ausencias.resolver(idSolicitud, decision);
            setMensaje({ tipo: 'exito', texto: `Solicitud ${decision}` });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al resolver solicitud' });
        } finally {
            setCargando(false);
        }
    };

    // revisa un timesheet
    const revisarTimesheet = async (idTimesheet, decision) => {
        setCargando(true);
        try {
            await timesheets.revisar(idTimesheet, decision, '');
            setMensaje({ tipo: 'exito', texto: `Timesheet ${decision}` });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al revisar timesheet' });
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

            {/* correcciones de fichaje */}
            <Tarjeta titulo="Correcciones de fichaje pendientes">
                <Tabla>
                    <EncabezadoTabla>
                        <CeldaEncabezado>Empleado</CeldaEncabezado>
                        <CeldaEncabezado>Solicitante</CeldaEncabezado>
                        <CeldaEncabezado>Inicio propuesto</CeldaEncabezado>
                        <CeldaEncabezado>Fin propuesto</CeldaEncabezado>
                        <CeldaEncabezado>Motivo</CeldaEncabezado>
                        <CeldaEncabezado>Acciones</CeldaEncabezado>
                    </EncabezadoTabla>
                    <CuerpoTabla>
                        {paginacionCorrecciones.itemsPaginados.length > 0 ? (
                            paginacionCorrecciones.itemsPaginados.map((corr) => (
                                <FilaTabla key={corr.id_correccion}>
                                    <CeldaTabla>{corr.registro?.empleado?.nombre || '—'}</CeldaTabla>
                                    <CeldaTabla>{corr.solicitante?.nombre || '—'}</CeldaTabla>
                                    <CeldaTabla>{corr.nuevo_inicio || '—'}</CeldaTabla>
                                    <CeldaTabla>{corr.nuevo_fin || '—'}</CeldaTabla>
                                    <CeldaTabla>{corr.motivo || '—'}</CeldaTabla>
                                    <CeldaTabla>
                                        <div className="flex gap-1">
                                            <Boton
                                                tamano="pequeno"
                                                variante="exito"
                                                onClick={() => resolverCorreccion(corr.id_correccion, 'aprobada')}
                                                deshabilitado={cargando}
                                            >
                                                Aprobar
                                            </Boton>
                                            <Boton
                                                tamano="pequeno"
                                                variante="contorno"
                                                onClick={() => resolverCorreccion(corr.id_correccion, 'rechazada')}
                                                deshabilitado={cargando}
                                            >
                                                Rechazar
                                            </Boton>
                                        </div>
                                    </CeldaTabla>
                                </FilaTabla>
                            ))
                        ) : (
                            <TablaVacia mensaje="Sin correcciones pendientes." columnas={6} />
                        )}
                    </CuerpoTabla>
                </Tabla>
                <Paginador
                    paginaActual={paginacionCorrecciones.paginaActual}
                    totalPaginas={paginacionCorrecciones.totalPaginas}
                    onCambiarPagina={paginacionCorrecciones.setPaginaActual}
                />
            </Tarjeta>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* solicitudes de ausencia */}
                <Tarjeta titulo="Solicitudes de ausencia">
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Empleado</CeldaEncabezado>
                            <CeldaEncabezado>Tipo</CeldaEncabezado>
                            <CeldaEncabezado>Rango</CeldaEncabezado>
                            <CeldaEncabezado>Comentario</CeldaEncabezado>
                            <CeldaEncabezado>Acciones</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {paginacionSolicitudes.itemsPaginados.length > 0 ? (
                                paginacionSolicitudes.itemsPaginados.map((sol) => (
                                    <FilaTabla key={sol.id_solicitud}>
                                        <CeldaTabla>{sol.empleado?.nombre || '—'}</CeldaTabla>
                                        <CeldaTabla>{sol.tipo?.nombre || '—'}</CeldaTabla>
                                        <CeldaTabla>{sol.inicio} → {sol.fin}</CeldaTabla>
                                        <CeldaTabla>{sol.comentario || '—'}</CeldaTabla>
                                        <CeldaTabla>
                                            <div className="flex gap-1">
                                                <Boton
                                                    tamano="pequeno"
                                                    variante="exito"
                                                    onClick={() => resolverAusencia(sol.id_solicitud, 'aprobada')}
                                                    deshabilitado={cargando}
                                                >
                                                    Aprobar
                                                </Boton>
                                                <Boton
                                                    tamano="pequeno"
                                                    variante="contorno"
                                                    onClick={() => resolverAusencia(sol.id_solicitud, 'rechazada')}
                                                    deshabilitado={cargando}
                                                >
                                                    Rechazar
                                                </Boton>
                                            </div>
                                        </CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin solicitudes pendientes." columnas={5} />
                            )}
                        </CuerpoTabla>
                    </Tabla>
                    <Paginador
                        paginaActual={paginacionSolicitudes.paginaActual}
                        totalPaginas={paginacionSolicitudes.totalPaginas}
                        onCambiarPagina={paginacionSolicitudes.setPaginaActual}
                    />
                </Tarjeta>

                {/* timesheets enviados */}
                <Tarjeta titulo="Timesheets enviados">
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Empleado</CeldaEncabezado>
                            <CeldaEncabezado>Periodo</CeldaEncabezado>
                            <CeldaEncabezado>Acciones</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {paginacionTimesheets.itemsPaginados.length > 0 ? (
                                paginacionTimesheets.itemsPaginados.map((ts) => (
                                    <FilaTabla key={ts.id_timesheet}>
                                        <CeldaTabla>{ts.empleado?.nombre || '—'}</CeldaTabla>
                                        <CeldaTabla>{ts.inicio_periodo} → {ts.fin_periodo}</CeldaTabla>
                                        <CeldaTabla>
                                            <div className="flex gap-1">
                                                <Boton
                                                    tamano="pequeno"
                                                    variante="exito"
                                                    onClick={() => revisarTimesheet(ts.id_timesheet, 'aprobado')}
                                                    deshabilitado={cargando}
                                                >
                                                    Aprobar
                                                </Boton>
                                                <Boton
                                                    tamano="pequeno"
                                                    variante="contorno"
                                                    onClick={() => revisarTimesheet(ts.id_timesheet, 'rechazado')}
                                                    deshabilitado={cargando}
                                                >
                                                    Rechazar
                                                </Boton>
                                            </div>
                                        </CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin envíos pendientes." columnas={3} />
                            )}
                        </CuerpoTabla>
                    </Tabla>
                    <Paginador
                        paginaActual={paginacionTimesheets.paginaActual}
                        totalPaginas={paginacionTimesheets.totalPaginas}
                        onCambiarPagina={paginacionTimesheets.setPaginaActual}
                    />
                </Tarjeta>
            </div>
        </div>
    );
}
