/**
 * página de ausencias
 * permite solicitar ausencias y ver historial
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { ausencias, datosPagina } from '../services/api';

export default function PaginaAusencias() {
    // estado local
    const [tipos, setTipos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [formulario, setFormulario] = useState({
        id_tipo: '',
        inicio: '',
        fin: '',
        comentario: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: solicitudesPaginadas, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(solicitudes, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.ausencias();
            setTipos(res.data.tipos || []);
            setSolicitudes(res.data.solicitudes || []);
        } catch (e) {
            console.error('error cargando ausencias:', e);
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

    // maneja envío del formulario
    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await ausencias.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Solicitud enviada correctamente' });
            setFormulario({ id_tipo: '', inicio: '', fin: '', comentario: '' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al enviar solicitud' });
        } finally {
            setCargando(false);
        }
    };

    // prepara opciones para el select de tipos
    const opcionesTipos = [
        { valor: '', texto: 'Selecciona un tipo', deshabilitado: true },
        ...tipos.map(tipo => ({ valor: tipo.id_tipo, texto: tipo.nombre }))
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* formulario de solicitud */}
                <Tarjeta titulo="Solicitud de ausencia">
                    <form onSubmit={manejarEnvio} className="space-y-4">
                        <CampoFormulario
                            etiqueta="Tipo"
                            tipo="select"
                            nombre="id_tipo"
                            valor={formulario.id_tipo}
                            onChange={manejarCambio}
                            opciones={opcionesTipos}
                            requerido
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CampoFormulario
                                etiqueta="Inicio"
                                tipo="date"
                                nombre="inicio"
                                valor={formulario.inicio}
                                onChange={manejarCambio}
                                requerido
                            />
                            <CampoFormulario
                                etiqueta="Fin"
                                tipo="date"
                                nombre="fin"
                                valor={formulario.fin}
                                onChange={manejarCambio}
                                requerido
                            />
                        </div>
                        <CampoFormulario
                            etiqueta="Comentario"
                            tipo="textarea"
                            nombre="comentario"
                            valor={formulario.comentario}
                            onChange={manejarCambio}
                            filas={3}
                        />
                        <Boton 
                            tipo="submit" 
                            cargando={cargando}
                            className="w-full"
                        >
                            Enviar solicitud
                        </Boton>
                    </form>
                </Tarjeta>

                {/* listado de solicitudes */}
                <Tarjeta titulo="Mis solicitudes">
                    <Tabla>
                        <EncabezadoTabla>
                            <CeldaEncabezado>Tipo</CeldaEncabezado>
                            <CeldaEncabezado>Inicio</CeldaEncabezado>
                            <CeldaEncabezado>Fin</CeldaEncabezado>
                            <CeldaEncabezado>Estado</CeldaEncabezado>
                            <CeldaEncabezado>Comentario</CeldaEncabezado>
                        </EncabezadoTabla>
                        <CuerpoTabla>
                            {solicitudesPaginadas.length > 0 ? (
                                solicitudesPaginadas.map((solicitud, indice) => (
                                    <FilaTabla key={solicitud.id_solicitud || indice}>
                                        <CeldaTabla>{solicitud.tipo?.nombre || '—'}</CeldaTabla>
                                        <CeldaTabla>{solicitud.inicio}</CeldaTabla>
                                        <CeldaTabla>{solicitud.fin}</CeldaTabla>
                                        <CeldaTabla>{etiquetaEstado(solicitud.estado)}</CeldaTabla>
                                        <CeldaTabla>{solicitud.comentario || '—'}</CeldaTabla>
                                    </FilaTabla>
                                ))
                            ) : (
                                <TablaVacia mensaje="Sin solicitudes aún." columnas={5} />
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
    );
}
