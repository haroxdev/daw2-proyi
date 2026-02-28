// página de reporting (admin) — estadísticas, métricas y exportación
import React, { useState, useEffect, useCallback } from 'react';
import {
    Tarjeta, Boton, CampoFormulario, Alerta,
    Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla,
    FilaTabla, CeldaTabla, TablaVacia, Paginador, usePaginacion,
    Etiqueta, IconoExportarDocumento as IconoExportar, IconoFiltro, IconoLimpiar
} from '../components';
import { datosPagina, exportacion } from '../services/api';

export default function PaginaReporting() {
    // estado de datos
    const [resumen, setResumen] = useState({
        tareas_totales: 0,
        tareas_finalizadas: 0,
        horas_en_tareas: 0,
        horas_en_jornada: 0,
        ausencias_aprobadas: 0,
        empleados_activos: 0
    });
    const [horasPorProyecto, setHorasPorProyecto] = useState([]);
    const [horasPorEmpleado, setHorasPorEmpleado] = useState([]);
    const [ausenciasPorTipo, setAusenciasPorTipo] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // filtros de fecha
    const [filtroInicio, setFiltroInicio] = useState('');
    const [filtroFin, setFiltroFin] = useState('');
    const [filtrosAplicados, setFiltrosAplicados] = useState({});

    // pestaña activa para sección de tablas
    const [tabActiva, setTabActiva] = useState('proyectos');

    // paginación por sección
    const paginacionProyectos = usePaginacion(horasPorProyecto, 5);
    const paginacionEmpleados = usePaginacion(horasPorEmpleado, 5);
    const paginacionAusencias = usePaginacion(ausenciasPorTipo, 5);

    // calcula el máximo de horas para escalar barras de progreso
    const maxHorasProyecto = Math.max(...horasPorProyecto.map(p => p.horas), 1);
    const maxHorasEmpleado = Math.max(...horasPorEmpleado.map(e => e.horas), 1);

    // carga datos desde api con filtros opcionales
    const cargarDatos = useCallback(async (filtros = {}) => {
        setCargando(true);
        setError('');
        try {
            const res = await datosPagina.reporting(filtros);
            const datos = res.data;
            setResumen(datos.resumen || resumen);
            setHorasPorProyecto(datos.horasPorProyecto || []);
            setHorasPorEmpleado(datos.horasPorEmpleado || []);
            setAusenciasPorTipo(datos.ausenciasPorTipo || []);
        } catch (e) {
            console.error('error cargando reporting:', e);
            setError('No se pudieron cargar los datos de reporting.');
        } finally {
            setCargando(false);
        }
    }, []);

    // carga inicial
    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // aplica filtros de fecha
    const aplicarFiltros = () => {
        const filtros = {};
        if (filtroInicio) filtros.inicio = filtroInicio;
        if (filtroFin) filtros.fin = filtroFin;
        setFiltrosAplicados(filtros);
        cargarDatos(filtros);
    };

    // limpia filtros
    const limpiarFiltros = () => {
        setFiltroInicio('');
        setFiltroFin('');
        setFiltrosAplicados({});
        cargarDatos();
    };

    // descarga csv en nueva pestaña
    const descargarCsv = (generarUrl) => {
        const url = generarUrl(filtrosAplicados);
        window.open(url, '_blank');
    };

    // tasa de finalización de tareas
    const tasaFinalizacion = resumen.tareas_totales > 0
        ? Math.round((resumen.tareas_finalizadas / resumen.tareas_totales) * 100)
        : 0;

    // tarjetas de métricas kpi — colores oscuros para fondo blanco
    const metricas = [
        { titulo: 'Tareas totales', valor: resumen.tareas_totales, color: 'text-blue-700' },
        { titulo: 'Tareas finalizadas', valor: resumen.tareas_finalizadas, color: 'text-emerald-700' },
        { titulo: 'Horas en tareas', valor: `${resumen.horas_en_tareas}h`, color: 'text-amber-700' },
        { titulo: 'Horas en jornada', valor: `${resumen.horas_en_jornada}h`, color: 'text-violet-700' },
        { titulo: 'Ausencias aprobadas', valor: resumen.ausencias_aprobadas, color: 'text-rose-700' },
        { titulo: 'Empleados activos', valor: resumen.empleados_activos, color: 'text-cyan-700' },
    ];

    // pestañas disponibles
    const tabs = [
        { id: 'proyectos', label: 'Horas por proyecto' },
        { id: 'empleados', label: 'Horas por empleado' },
        { id: 'ausencias', label: 'Ausencias por tipo' },
    ];

    return (
        <div className="space-y-6">
            {error && <Alerta tipo="error" mensaje={error} onCerrar={() => setError('')} />}

            {/* filtros de fecha y exportación */}
            <Tarjeta>
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <CampoFormulario
                            tipo="date"
                            etiqueta="Desde"
                            valor={filtroInicio}
                            onChange={e => setFiltroInicio(e.target.value)}
                        />
                        <CampoFormulario
                            tipo="date"
                            etiqueta="Hasta"
                            valor={filtroFin}
                            onChange={e => setFiltroFin(e.target.value)}
                        />
                        <div className="flex items-end gap-2">
                            <Boton variante="primario" onClick={aplicarFiltros} cargando={cargando}>
                                <span className="flex items-center gap-1"><IconoFiltro /> Filtrar</span>
                            </Boton>
                            {(filtroInicio || filtroFin) && (
                                <Boton variante="fantasma" onClick={limpiarFiltros}>
                                    <span className="flex items-center gap-1"><IconoLimpiar /> Limpiar</span>
                                </Boton>
                            )}
                        </div>
                    </div>

                    {/* botones de exportación csv */}
                    <div className="flex flex-wrap gap-2">
                        <Boton variante="contorno" onClick={() => descargarCsv(exportacion.fichajes)}>
                            <span className="flex items-center gap-1"><IconoExportar /> Fichajes</span>
                        </Boton>
                        <Boton variante="contorno" onClick={() => descargarCsv(exportacion.proyectos)}>
                            <span className="flex items-center gap-1"><IconoExportar /> Proyectos</span>
                        </Boton>
                        <Boton variante="contorno" onClick={() => descargarCsv(exportacion.ausencias)}>
                            <span className="flex items-center gap-1"><IconoExportar /> Ausencias</span>
                        </Boton>
                    </div>
                </div>
            </Tarjeta>

            {/* métricas principales kpi */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {metricas.map((metrica, indice) => (
                    <Tarjeta key={indice}>
                        <div className="text-slate-600 text-xs font-semibold uppercase tracking-wide">{metrica.titulo}</div>
                        <div className={`text-2xl font-bold mt-1 ${metrica.color}`}>{metrica.valor}</div>
                    </Tarjeta>
                ))}
            </div>

            {/* barra de progreso de finalización */}
            <Tarjeta titulo="Tasa de finalización de tareas">
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-200 rounded-full h-4">
                        <div
                            className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${tasaFinalizacion}%` }}
                        />
                    </div>
                    <span className="text-slate-800 font-bold text-lg min-w-[3rem] text-right">{tasaFinalizacion}%</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                    {resumen.tareas_finalizadas} de {resumen.tareas_totales} tareas completadas
                </p>
            </Tarjeta>

            {/* navegación por pestañas */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-1 -mb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTabActiva(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                tabActiva === tab.id
                                    ? 'border-rose-500 text-rose-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* tabla: horas por proyecto */}
            {tabActiva === 'proyectos' && (
                <Tarjeta>
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Proyecto</CeldaEncabezado>
                            <CeldaEncabezado>Horas dedicadas</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {paginacionProyectos.itemsPaginados.length > 0 ? (
                                paginacionProyectos.itemsPaginados.map((fila, indice) => (
                                    <FilaTabla key={indice}>
                                        <CeldaTabla>
                                            <span className="font-medium text-slate-800">{fila.proyecto}</span>
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-200 rounded-full h-2.5 max-w-xs">
                                                    <div
                                                        className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, (fila.horas / maxHorasProyecto) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-slate-800 font-semibold min-w-[4rem] text-right">{fila.horas}h</span>
                                            </div>
                                        </CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin datos de proyectos." columnas={2} />
                            )}
                        </CuerpoTabla>
                    </Tabla>
                    <Paginador
                        paginaActual={paginacionProyectos.paginaActual}
                        totalPaginas={paginacionProyectos.totalPaginas}
                        onCambiarPagina={paginacionProyectos.setPaginaActual}
                    />
                </Tarjeta>
            )}

            {/* tabla: horas por empleado */}
            {tabActiva === 'empleados' && (
                <Tarjeta>
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Empleado</CeldaEncabezado>
                            <CeldaEncabezado>Fichajes</CeldaEncabezado>
                            <CeldaEncabezado>Horas trabajadas</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {paginacionEmpleados.itemsPaginados.length > 0 ? (
                                paginacionEmpleados.itemsPaginados.map((fila, indice) => (
                                    <FilaTabla key={indice}>
                                        <CeldaTabla>
                                            <span className="font-medium text-slate-800">{fila.empleado}</span>
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <span className="text-slate-600">{fila.fichajes}</span>
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-200 rounded-full h-2.5 max-w-xs">
                                                    <div
                                                        className="bg-violet-500 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, (fila.horas / maxHorasEmpleado) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-slate-800 font-semibold min-w-[4rem] text-right">{fila.horas}h</span>
                                            </div>
                                        </CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin datos de empleados." columnas={3} />
                            )}
                        </CuerpoTabla>
                    </Tabla>
                    <Paginador
                        paginaActual={paginacionEmpleados.paginaActual}
                        totalPaginas={paginacionEmpleados.totalPaginas}
                        onCambiarPagina={paginacionEmpleados.setPaginaActual}
                    />
                </Tarjeta>
            )}

            {/* tabla: ausencias por tipo */}
            {tabActiva === 'ausencias' && (
                <Tarjeta>
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Tipo de ausencia</CeldaEncabezado>
                            <CeldaEncabezado>Total</CeldaEncabezado>
                            <CeldaEncabezado>Aprobadas</CeldaEncabezado>
                            <CeldaEncabezado>Pendientes</CeldaEncabezado>
                            <CeldaEncabezado>Rechazadas</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {paginacionAusencias.itemsPaginados.length > 0 ? (
                                paginacionAusencias.itemsPaginados.map((fila, indice) => (
                                    <FilaTabla key={indice}>
                                        <CeldaTabla>
                                            <span className="font-medium text-slate-800">{fila.tipo}</span>
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <span className="text-slate-800 font-semibold">{fila.total}</span>
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <Etiqueta texto={String(fila.aprobadas)} variante="exito" />
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <Etiqueta texto={String(fila.pendientes)} variante="advertencia" />
                                        </CeldaTabla>
                                        <CeldaTabla>
                                            <Etiqueta texto={String(fila.rechazadas)} variante="peligro" />
                                        </CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin datos de ausencias." columnas={5} />
                            )}
                        </CuerpoTabla>
                    </Tabla>
                    <Paginador
                        paginaActual={paginacionAusencias.paginaActual}
                        totalPaginas={paginacionAusencias.totalPaginas}
                        onCambiarPagina={paginacionAusencias.setPaginaActual}
                    />
                </Tarjeta>
            )}
        </div>
    );
}
