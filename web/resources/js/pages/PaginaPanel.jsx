// página panel/dashboard — métricas, reloj de fichaje, actividad reciente y proyectos
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tarjeta, Boton, Alerta, IconoReloj, IconoProyecto, IconoCalendario, IconoCheck, IconoEntrada, IconoSalida, IconoPausa } from '../components';
import { fichaje, datosPagina } from '../services/api';
import { useAuth } from '../context/ContextoAuth';
import { formatearHoraConSegundos, formatearFechaLarga, formatearFechaRelativa } from '../utils';

// tarjeta de métrica
function TarjetaMetrica({ icono, valor, etiqueta, variacion, color = 'rojo' }) {
    const colores = {
        rojo: 'bg-red-50 text-red-600',
        verde: 'bg-green-50 text-green-600',
        azul: 'bg-blue-50 text-blue-600',
        amarillo: 'bg-yellow-50 text-yellow-600',
    };
    
    const variacionColor = variacion?.startsWith('+') || variacion?.startsWith('↑') 
        ? 'text-green-600' 
        : 'text-red-600';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${colores[color]} flex items-center justify-center`}>
                {icono}
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{valor}</span>
                    {variacion && (
                        <span className={`text-sm font-medium ${variacionColor}`}>{variacion}</span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{etiqueta}</p>
            </div>
        </div>
    );
}

// item de actividad reciente
function ItemActividad({ icono, titulo, subtitulo, hora, color = 'gray' }) {
    const colores = {
        red: 'bg-red-100 text-red-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`w-10 h-10 rounded-lg ${colores[color]} flex items-center justify-center flex-shrink-0`}>
                {icono}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{titulo}</p>
                <p className="text-xs text-gray-500 truncate">{subtitulo}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{hora}</span>
        </div>
    );
}

// barra de progreso de proyecto
function ProyectoActivo({ nombre, cliente, horas, horasTotal, color = 'red' }) {
    const porcentaje = Math.min((horas / horasTotal) * 100, 100);
    const colores = {
        red: 'bg-red-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
    };

    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-medium text-gray-900 text-sm">{nombre}</p>
                    <p className="text-xs text-gray-500">Cliente: {cliente}</p>
                </div>
                <span className="text-sm text-gray-600">
                    <span className="font-semibold">{horas}h</span>
                    <span className="text-gray-400">/{horasTotal}h</span>
                </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${colores[color]} rounded-full transition-all duration-300`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>
        </div>
    );
}

export default function PaginaPanel() {
    const { usuario } = useAuth();
    const [horaActual, setHoraActual] = useState(new Date());
    const [registroAbierto, setRegistroAbierto] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [datos, setDatos] = useState(null);

    // actualizar hora cada segundo
    useEffect(() => {
        const intervalo = setInterval(() => {
            setHoraActual(new Date());
        }, 1000);
        return () => clearInterval(intervalo);
    }, []);

    // cargar datos iniciales desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.panel();
            setDatos(res.data);
            setRegistroAbierto(res.data.registroAbierto || null);
        } catch (e) {
            console.error('error cargando panel:', e);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // manejar fichaje entrada
    const manejarEntrada = async () => {
        setCargando(true);
        try {
            const hora = new Date().toISOString().slice(0, 16);
            const respuesta = await fichaje.entrada(hora);
            setRegistroAbierto(respuesta.data.registro || respuesta.data);
            setMensaje({ tipo: 'exito', texto: 'Entrada registrada correctamente' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al fichar entrada' });
        } finally {
            setCargando(false);
        }
    };

    // manejar fichaje salida
    const manejarSalida = async () => {
        setCargando(true);
        try {
            const hora = new Date().toISOString().slice(0, 16);
            await fichaje.salida(hora);
            setRegistroAbierto(null);
            setMensaje({ tipo: 'exito', texto: 'Salida registrada correctamente' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al fichar salida' });
        } finally {
            setCargando(false);
        }
    };

    // detectar pausa activa (sin fin)
    const pausaAbierta = registroAbierto?.pausas?.find(p => p.inicio && !p.fin) || null;

    // manejar pausa (abrir o cerrar según estado)
    const manejarPausa = async () => {
        if (!registroAbierto) return;
        setCargando(true);
        try {
            if (pausaAbierta) {
                await fichaje.cerrarPausa(pausaAbierta.id_pausa);
                setMensaje({ tipo: 'exito', texto: 'Pausa finalizada' });
            } else {
                await fichaje.abrirPausa(registroAbierto.id_registro);
                setMensaje({ tipo: 'exito', texto: 'Pausa iniciada' });
            }
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al gestionar pausa' });
        } finally {
            setCargando(false);
        }
    };

    // calcular variación porcentual de horas
    const calcularVariacion = () => {
        if (!datos) return null;
        const anterior = datos.horasSemanaAnterior || 0;
        if (anterior === 0) return datos.horasSemana > 0 ? '↑ nueva' : null;
        const diff = ((datos.horasSemana - anterior) / anterior) * 100;
        if (diff > 0) return `↑${Math.round(diff)}%`;
        if (diff < 0) return `↓${Math.abs(Math.round(diff))}%`;
        return null;
    };

    // métricas reales del usuario
    const metricas = [
        { icono: <IconoReloj className="w-6 h-6" />, valor: `${datos?.horasSemana ?? 0}h`, etiqueta: 'Horas esta semana', variacion: calcularVariacion(), color: 'rojo' },
        { icono: <IconoProyecto className="w-6 h-6" />, valor: `${datos?.totalProyectos ?? 0}`, etiqueta: 'Proyectos activos', color: 'verde' },
        { icono: <IconoCalendario className="w-6 h-6" />, valor: `${datos?.diasVacaciones ?? 0}`, etiqueta: 'Días vacaciones', color: 'azul' },
        { icono: <IconoCheck className="w-6 h-6" />, valor: `${datos?.solicitudesPendientes ?? 0}`, etiqueta: 'Solicitudes pendientes', color: 'amarillo' },
    ];

    // mapear tipo de notificación a icono y color
    const obtenerEstiloNotificacion = (tipo) => {
        const estilos = {
            fichaje: { icono: <IconoEntrada />, color: 'red' },
            ausencia: { icono: <IconoCalendario className="w-6 h-6" />, color: 'yellow' },
            aprobacion: { icono: <IconoCheck className="w-6 h-6" />, color: 'green' },
            proyecto: { icono: <IconoProyecto className="w-6 h-6" />, color: 'blue' },
            tarea: { icono: <IconoCheck className="w-6 h-6" />, color: 'blue' },
        };
        return estilos[tipo] || { icono: <IconoCheck />, color: 'gray' };
    };

    // actividad real basada en notificaciones + fichajes recientes
    const actividades = [
        // fichajes recientes
        ...(datos?.fichajesRecientes || []).map(f => ({
            icono: f.hora_salida ? <IconoSalida /> : <IconoEntrada />,
            titulo: f.hora_salida ? 'Salida registrada' : 'Entrada registrada',
            subtitulo: f.hora_salida
                ? `Salida: ${new Date(f.hora_salida).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                : 'Jornada activa',
            hora: formatearFechaRelativa(f.hora_llegada),
            color: f.hora_salida ? 'gray' : 'red',
        })),
        // notificaciones recientes
        ...(datos?.notificaciones || []).map(n => {
            const estilo = obtenerEstiloNotificacion(n.tipo);
            return {
                icono: estilo.icono,
                titulo: n.mensaje,
                subtitulo: n.tipo,
                hora: formatearFechaRelativa(n.fecha),
                color: estilo.color,
            };
        }),
    ]
        // ordena por fecha descendente y limita a 6
        .sort((a, b) => 0)
        .slice(0, 6);

    // colores para barras de proyectos
    const coloresProyecto = ['red', 'blue', 'green'];

    // horas estimadas por defecto si no se conocen
    const HORAS_ESTIMADAS = 100;

    return (
        <div className="space-y-6">
            {/* alertas */}
            {mensaje && (
                <Alerta 
                    tipo={mensaje.tipo} 
                    mensaje={mensaje.texto} 
                    onCerrar={() => setMensaje(null)} 
                />
            )}

            {/* tarjetas de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricas.map((metrica, index) => (
                    <TarjetaMetrica key={index} {...metrica} />
                ))}
            </div>

            {/* panel de fichaje grande */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                {/* decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                {/* estado de fichaje */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${registroAbierto ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-white/80">
                        {registroAbierto ? 'Fichado' : 'Sin fichar'}
                    </span>
                </div>

                {/* reloj grande */}
                <div className="relative z-10 text-center">
                    <div className="text-7xl md:text-8xl font-bold tracking-tight mb-2" style={{ fontFamily: 'system-ui' }}>
                        {formatearHoraConSegundos(horaActual)}
                    </div>
                    <p className="text-lg text-white/80 capitalize mb-8">
                        {formatearFechaLarga(horaActual)}
                    </p>

                    {/* botones de acción */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={manejarEntrada}
                            disabled={cargando || !!registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                registroAbierto 
                                    ? 'bg-white/20 text-white/60 cursor-not-allowed' 
                                    : 'bg-white text-red-600 hover:bg-gray-100 shadow-lg'
                            }`}
                        >
                            <IconoEntrada />
                            Entrada
                        </button>
                        <button
                            onClick={manejarSalida}
                            disabled={cargando || !registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all ${
                                !registroAbierto 
                                    ? 'border-white/30 text-white/60 cursor-not-allowed' 
                                    : 'border-white text-white hover:bg-white/10'
                            }`}
                        >
                            <IconoSalida />
                            Salida
                        </button>
                        <button
                            onClick={manejarPausa}
                            disabled={cargando || !registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all ${
                                !registroAbierto 
                                    ? 'border-white/30 text-white/60 cursor-not-allowed' 
                                    : pausaAbierta
                                        ? 'border-green-300 bg-green-500/20 text-white hover:bg-green-500/30'
                                        : 'border-white text-white hover:bg-white/10'
                            }`}
                        >
                            <IconoPausa />
                            {pausaAbierta ? 'Reanudar' : 'Pausa'}
                        </button>
                    </div>
                </div>
            </div>

            {/* actividad reciente y proyectos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* actividad reciente */}
                <Tarjeta className="h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                        <Link to="/notificaciones" className="text-sm text-red-600 hover:text-red-700 font-medium">
                            Ver todo →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {actividades.length > 0 ? (
                            actividades.map((actividad, index) => (
                                <ItemActividad key={index} {...actividad} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-4 text-center">Sin actividad reciente</p>
                        )}
                    </div>
                </Tarjeta>

                {/* proyectos activos */}
                <Tarjeta className="h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Proyectos Activos</h3>
                        <Link to="/proyectos" className="text-sm text-red-600 hover:text-red-700 font-medium">
                            Ver todos →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {(datos?.proyectosActivos || []).length > 0 ? (
                            datos.proyectosActivos.map((proyecto, index) => (
                                <ProyectoActivo
                                    key={index}
                                    nombre={proyecto.nombre}
                                    cliente={proyecto.descripcion || 'Sin descripción'}
                                    horas={proyecto.horas}
                                    horasTotal={HORAS_ESTIMADAS}
                                    color={coloresProyecto[index % coloresProyecto.length]}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-4 text-center">Sin proyectos activos</p>
                        )}
                    </div>
                </Tarjeta>
            </div>
        </div>
    );
}
