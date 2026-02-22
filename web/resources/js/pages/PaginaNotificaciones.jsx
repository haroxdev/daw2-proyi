/**
 * página de notificaciones
 * muestra y gestiona las notificaciones del usuario con paginación
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Tarjeta, Boton, Alerta, Paginador } from '../components';
import { notificaciones, datosPagina } from '../services/api';

export default function PaginaNotificaciones() {
    const [listaNotificaciones, setListaNotificaciones] = useState([]);
    const [paginacion, setPaginacion] = useState({ paginaActual: 1, totalPaginas: 1, total: 0 });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // carga notificaciones de la página indicada
    const cargarPagina = useCallback(async (pagina = 1) => {
        try {
            const res = await datosPagina.notificaciones(pagina);
            setListaNotificaciones(res.data.notificaciones || []);
            setPaginacion(res.data.paginacion || { paginaActual: 1, totalPaginas: 1, total: 0 });
        } catch (e) {
            console.error('error cargando notificaciones:', e);
        }
    }, []);

    useEffect(() => {
        cargarPagina(1);
    }, [cargarPagina]);

    // marca una notificación como leída
    const marcarLeida = async (idNotificacion) => {
        setCargando(true);
        try {
            await notificaciones.marcarLeida(idNotificacion);
            setListaNotificaciones(prev =>
                prev.map(n => n.id_notificacion === idNotificacion ? { ...n, leida: true } : n)
            );
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al marcar como leída' });
        } finally {
            setCargando(false);
        }
    };

    // marca todas como leídas y recarga
    const marcarTodas = async () => {
        setCargando(true);
        try {
            await notificaciones.marcarTodas();
            setListaNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            setMensaje({ tipo: 'exito', texto: 'Todas las notificaciones marcadas como leídas' });
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al marcar notificaciones' });
        } finally {
            setCargando(false);
        }
    };

    const noLeidas = listaNotificaciones.filter(n => !n.leida).length;
    const { paginaActual, totalPaginas, total } = paginacion;

    return (
        <div className="space-y-6">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
                    <p className="text-sm text-gray-500">
                        {total} total{noLeidas > 0 && ` · ${noLeidas} sin leer`}
                    </p>
                </div>
                {noLeidas > 0 && (
                    <Boton
                        tamano="pequeno"
                        variante="contornoPrimario"
                        onClick={marcarTodas}
                        deshabilitado={cargando}
                    >
                        Marcar todas como leídas
                    </Boton>
                )}
            </div>

            <div className="space-y-2">
                {listaNotificaciones.length > 0 ? (
                    listaNotificaciones.map((notif) => (
                        <div
                            key={notif.id_notificacion}
                            className={`p-4 rounded-lg border transition-all ${
                                notif.leida
                                    ? 'bg-white border-gray-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                        {notif.tipo || 'General'}
                                    </div>
                                    <div className="text-gray-600 mt-1">
                                        {notif.mensaje || '—'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {notif.fecha}
                                    </div>
                                </div>
                                {!notif.leida && (
                                    <Boton
                                        tamano="pequeno"
                                        variante="contorno"
                                        onClick={() => marcarLeida(notif.id_notificacion)}
                                        deshabilitado={cargando}
                                    >
                                        Marcar leída
                                    </Boton>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <Tarjeta>
                        <p className="text-gray-500 text-center py-8">Sin notificaciones.</p>
                    </Tarjeta>
                )}
            </div>

            {/* paginador */}
            <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambiarPagina={cargarPagina}
            />
        </div>
    );
}
