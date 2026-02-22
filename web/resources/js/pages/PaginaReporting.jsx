/**
 * página de reporting (admin)
 * muestra estadísticas y métricas del sistema
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Paginador, usePaginacion } from '../components';
import { datosPagina } from '../services/api';

export default function PaginaReporting() {
    // estado local
    const [resumen, setResumen] = useState({
        tareas_totales: 0,
        tareas_finalizadas: 0,
        horas_en_tareas: 0,
        horas_en_jornada: 0
    });
    const [horasPorProyecto, setHorasPorProyecto] = useState([]);

    // paginación
    const { itemsPaginados: proyectosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(horasPorProyecto, 5);

    // carga datos iniciales desde API
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await datosPagina.reporting();
                setResumen(res.data.resumen || {
                    tareas_totales: 0,
                    tareas_finalizadas: 0,
                    horas_en_tareas: 0,
                    horas_en_jornada: 0
                });
                setHorasPorProyecto(res.data.horasPorProyecto || []);
            } catch (e) {
                console.error('error cargando reporting:', e);
            }
        };
        cargar();
    }, []);

    // tarjetas de métricas
    const metricas = [
        { titulo: 'Tareas totales', valor: resumen.tareas_totales },
        { titulo: 'Tareas finalizadas', valor: resumen.tareas_finalizadas },
        { titulo: 'Horas en tareas', valor: resumen.horas_en_tareas },
        { titulo: 'Horas en jornada', valor: resumen.horas_en_jornada }
    ];

    return (
        <div className="space-y-6">
            {/* métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricas.map((metrica, indice) => (
                    <Tarjeta key={indice}>
                        <div className="text-slate-400 text-sm">{metrica.titulo}</div>
                        <div className="text-3xl font-bold text-white mt-1">{metrica.valor}</div>
                    </Tarjeta>
                ))}
            </div>

            {/* horas por proyecto */}
            <Tarjeta titulo="Horas por proyecto">
                <Tabla>
                    <EncabezadoTabla>
                        <CeldaEncabezado>Proyecto</CeldaEncabezado>
                        <CeldaEncabezado>Horas</CeldaEncabezado>
                    </EncabezadoTabla>
                    <CuerpoTabla>
                        {proyectosPaginados.length > 0 ? (
                            proyectosPaginados.map((fila, indice) => (
                                <FilaTabla key={indice}>
                                    <CeldaTabla>{fila.proyecto}</CeldaTabla>
                                    <CeldaTabla>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-xs">
                                                <div 
                                                    className="bg-rose-500 h-2 rounded-full" 
                                                    style={{ width: `${Math.min(100, (fila.horas / 100) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-semibold">{fila.horas}</span>
                                        </div>
                                    </CeldaTabla>
                                </FilaTabla>
                            ))
                        ) : (
                            <TablaVacia mensaje="Sin datos." columnas={2} />
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
    );
}
