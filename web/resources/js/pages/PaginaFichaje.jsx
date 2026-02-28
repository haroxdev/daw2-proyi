// página de fichaje — control de jornada con reloj, historial y correcciones
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, Modal, CampoFormulario, Alerta, Etiqueta, Paginador, usePaginacion, IconoEntrada, IconoSalida, IconoPausa, IconoExportar, IconoCorreccion } from '../components';
import { fichaje, datosPagina } from '../services/api';
import { formatearHora, formatearFechaCorta, calcularTiempoTrabajado } from '../utils';

// etiqueta visual de estado del registro de fichaje
function EtiquetaEstado({ estado }) {
    const estilos = {
        'en_curso': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'completado': 'bg-gray-100 text-gray-800 border-gray-200',
        'corregido': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const textos = {
        'en_curso': 'EN CURSO',
        'completado': 'COMPLETADO',
        'corregido': 'CORREGIDO',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${estilos[estado] || estilos.completado}`}>
            {textos[estado] || estado?.toUpperCase() || 'COMPLETADO'}
        </span>
    );
}

export default function PaginaFichaje() {
    const [registros, setRegistros] = useState([]);
    const [registroAbierto, setRegistroAbierto] = useState(null);
    const [horaActual, setHoraActual] = useState(new Date());
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState('00:00:00');
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [modalCorreccion, setModalCorreccion] = useState(false);
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
    const [correccion, setCorreccion] = useState({ motivo: '', horaEntrada: '', horaSalida: '' });

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.fichaje();
            setRegistros(res.data.registros || []);
            setRegistroAbierto(res.data.registroAbierto || null);
        } catch (e) {
            console.error('error cargando fichaje:', e);
        }
    };

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // actualizar hora cada segundo
    useEffect(() => {
        const intervalo = setInterval(() => {
            const ahora = new Date();
            setHoraActual(ahora);
            
            // calcula tiempo neto descontando pausas
            if (registroAbierto?.hora_llegada) {
                const inicio = new Date(registroAbierto.hora_llegada);
                const pausas = registroAbierto.pausas || [];

                // suma segundos de todas las pausas
                let segundosPausa = 0;
                pausas.forEach(p => {
                    if (p.inicio && p.fin) {
                        segundosPausa += (new Date(p.fin) - new Date(p.inicio)) / 1000;
                    } else if (p.inicio && !p.fin) {
                        // pausa activa: conta hasta ahora
                        segundosPausa += (ahora - new Date(p.inicio)) / 1000;
                    }
                });

                const diffBruto = Math.floor((ahora - inicio) / 1000);
                const diffNeto = Math.max(0, diffBruto - Math.floor(segundosPausa));
                const horas = Math.floor(diffNeto / 3600).toString().padStart(2, '0');
                const minutos = Math.floor((diffNeto % 3600) / 60).toString().padStart(2, '0');
                const segundos = (diffNeto % 60).toString().padStart(2, '0');
                setTiempoTranscurrido(`${horas}:${minutos}:${segundos}`);
            } else {
                setTiempoTranscurrido('00:00:00');
            }
        }, 1000);
        return () => clearInterval(intervalo);
    }, [registroAbierto]);

    // calcular pausas totales
    const calcularPausas = (pausas) => {
        if (!pausas || pausas.length === 0) return '00:00';
        let totalMinutos = 0;
        pausas.forEach(p => {
            if (p.inicio && p.fin) {
                const inicio = new Date(p.inicio);
                const fin = new Date(p.fin);
                totalMinutos += (fin - inicio) / 1000 / 60;
            }
        });
        const h = Math.floor(totalMinutos / 60);
        const m = Math.floor(totalMinutos % 60);
        return h > 0 ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` : `00:${m.toString().padStart(2, '0')}`;
    };

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

    // detectar si hay una pausa abierta (sin fin)
    const pausaAbierta = registroAbierto?.pausas?.find(p => p.inicio && !p.fin) || null;

    // manejar pausa (abrir o cerrar según estado actual)
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

    // abrir modal de corrección
    const abrirModalCorreccion = (registro) => {
        setRegistroSeleccionado(registro);
        setCorreccion({
            motivo: '',
            horaEntrada: registro.hora_llegada?.slice(0, 16) || '',
            horaSalida: registro.hora_salida?.slice(0, 16) || ''
        });
        setModalCorreccion(true);
    };

    // enviar solicitud de corrección
    const enviarCorreccion = async () => {
        if (!registroSeleccionado || !correccion.motivo) return;
        setCargando(true);
        try {
            await fichaje.solicitarCorreccion(registroSeleccionado.id_registro, {
                motivo: correccion.motivo,
                hora_llegada_propuesta: correccion.horaEntrada,
                hora_salida_propuesta: correccion.horaSalida
            });
            setMensaje({ tipo: 'exito', texto: 'Solicitud de corrección enviada' });
            setModalCorreccion(false);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al solicitar corrección' });
        } finally {
            setCargando(false);
        }
    };

    // paginación del historial
    const { itemsPaginados: registrosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(registros, 5);

    // obtener mes actual para título
    const mesActual = horaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

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

            {/* control de jornada */}
            <Tarjeta>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Control de Jornada</h2>
                
                {/* reloj grande */}
                <div className="text-center py-8">
                    <div className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6" style={{ fontFamily: 'system-ui' }}>
                        {tiempoTranscurrido}
                    </div>
                    
                    {/* info de entrada/salida/pausa */}
                    <div className="flex justify-center gap-12 mb-8 text-sm">
                        <div className="text-center">
                            <div className="text-xl font-semibold text-gray-900">
                                {registroAbierto ? formatearHora(registroAbierto.hora_llegada) : '--:--'}
                            </div>
                            <div className="text-gray-500">Entrada</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-semibold text-gray-900">--:--</div>
                            <div className="text-gray-500">Salida</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-semibold text-red-600">
                                {registroAbierto ? calcularPausas(registroAbierto.pausas) : '00:00'}
                            </div>
                            <div className="text-gray-500">Pausa</div>
                        </div>
                    </div>

                    {/* botones de acción */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={manejarEntrada}
                            disabled={cargando || !!registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                registroAbierto 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                            }`}
                        >
                            <IconoEntrada />
                            Fichar Entrada
                        </button>
                        <button
                            onClick={manejarSalida}
                            disabled={cargando || !registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all ${
                                !registroAbierto 
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <IconoSalida />
                            Fichar Salida
                        </button>
                        <button
                            onClick={manejarPausa}
                            disabled={cargando || !registroAbierto}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all ${
                                !registroAbierto 
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                    : pausaAbierta
                                        ? 'border-green-300 text-green-700 hover:bg-green-50'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <IconoPausa />
                            {pausaAbierta ? 'Reanudar' : 'Pausa'}
                        </button>
                    </div>
                </div>
            </Tarjeta>

            {/* historial de fichajes */}
            <Tarjeta>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        Historial de Fichajes - {mesActual}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalCorreccion(true)}
                            disabled={registros.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <IconoCorreccion />
                            Solicitar Corrección
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                            <IconoExportar />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* tabla de historial */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrada</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salida</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pausas</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {registrosPaginados.length > 0 ? (
                                registrosPaginados.map((registro, index) => {
                                    const estado = !registro.hora_salida ? 'en_curso' : 
                                                   registro.corregido ? 'corregido' : 'completado';
                                    return (
                                        <tr 
                                            key={registro.id_registro || index} 
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => abrirModalCorreccion(registro)}
                                        >
                                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                                                {formatearFechaCorta(registro.hora_llegada)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {formatearHora(registro.hora_llegada)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {formatearHora(registro.hora_salida)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {calcularPausas(registro.pausas)}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                                                {calcularTiempoTrabajado(registro.hora_llegada, registro.hora_salida, registro.pausas)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <EtiquetaEstado estado={estado} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No hay registros de fichaje este mes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Paginador
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    onCambiarPagina={setPaginaActual}
                />
            </Tarjeta>

            {/* modal de corrección */}
            <Modal
                abierto={modalCorreccion}
                onCerrar={() => setModalCorreccion(false)}
                titulo="Solicitar Corrección"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Describe el motivo de la corrección y los datos correctos.
                    </p>
                    <CampoFormulario
                        etiqueta="Hora de entrada correcta"
                        tipo="datetime-local"
                        valor={correccion.horaEntrada}
                        onChange={(e) => setCorreccion({...correccion, horaEntrada: e.target.value})}
                    />
                    <CampoFormulario
                        etiqueta="Hora de salida correcta"
                        tipo="datetime-local"
                        valor={correccion.horaSalida}
                        onChange={(e) => setCorreccion({...correccion, horaSalida: e.target.value})}
                    />
                    <CampoFormulario
                        etiqueta="Motivo de la corrección"
                        tipo="textarea"
                        valor={correccion.motivo}
                        onChange={(e) => setCorreccion({...correccion, motivo: e.target.value})}
                        placeholder="Explica por qué necesitas corregir este fichaje..."
                        filas={3}
                        requerido
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Boton variante="contorno" onClick={() => setModalCorreccion(false)}>
                            Cancelar
                        </Boton>
                        <Boton onClick={enviarCorreccion} cargando={cargando} deshabilitado={!correccion.motivo}>
                            Enviar Solicitud
                        </Boton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
