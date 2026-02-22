/**
 * página de chat
 * permite enviar mensajes entre empleados en tiempo real
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tarjeta, Boton, CampoFormulario, Modal, Alerta } from '../components';
import { chat } from '../services/api';
import { useAuth } from '../context/ContextoAuth';

/**
 * formatea una fecha para mostrar
 */
const formatearFecha = (fecha) => {
    if (!fecha) return '';
    if (typeof fecha === 'string' && /^\d{2}\/\d{2}\s\d{2}:\d{2}$/.test(fecha)) return fecha;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * obtiene iniciales de un nombre
 */
const obtenerIniciales = (nombre, email = '') => {
    const texto = nombre || email || 'U';
    return texto.slice(0, 2).toUpperCase();
};

/**
 * componente de avatar para el chat
 */
function AvatarChat({ nombre, email, esMio = false, tamano = 'normal' }) {
    const clasesTamano = tamano === 'pequeno' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    const clasesColor = esMio
        ? 'bg-red-100 text-red-600'
        : 'bg-gray-200 text-gray-600';

    return (
        <div className={`${clasesTamano} rounded-full ${clasesColor} flex items-center justify-center font-bold flex-shrink-0`}>
            {obtenerIniciales(nombre, email)}
        </div>
    );
}

/**
 * componente de burbuja de mensaje
 */
function BurbujaMensaje({ mensaje, esMio, nombreRemitente, fecha, nombreUsuario, emailUsuario }) {
    return (
        <div className={`flex gap-2 ${esMio ? 'justify-end' : 'justify-start'}`}>
            {!esMio && (
                <AvatarChat nombre={nombreRemitente} tamano="pequeno" />
            )}
            <div className="flex flex-col max-w-[75%]">
                <div className={`px-4 py-2 rounded-2xl break-words ${
                    esMio
                        ? 'bg-red-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md'
                }`}>
                    {mensaje}
                </div>
                <span className={`text-xs text-gray-400 mt-1 ${esMio ? 'text-right' : ''}`}>
                    {esMio ? 'Tú' : nombreRemitente} · {formatearFecha(fecha)}
                </span>
            </div>
            {esMio && (
                <AvatarChat nombre={nombreUsuario} email={emailUsuario} esMio tamano="pequeno" />
            )}
        </div>
    );
}

/**
 * componente de botón de contacto en la lista lateral
 */
function BotonContacto({ contacto, seleccionado, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                seleccionado
                    ? 'bg-red-50 border-red-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
        >
            <AvatarChat nombre={contacto.nombre} email={contacto.email} />
            <div className="overflow-hidden flex-1">
                <div className="font-medium text-gray-900 truncate">{contacto.nombre}</div>
                <div className="text-xs text-gray-500 truncate">{contacto.email}</div>
            </div>
            {seleccionado && (
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            )}
        </button>
    );
}

export default function PaginaChat() {
    const { usuario } = useAuth();
    const referenciaChat = useRef(null);
    const inputRef = useRef(null);

    // estado
    const [contactos, setContactos] = useState([]);
    const [nuevosContactos, setNuevosContactos] = useState([]);
    const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [textoMensaje, setTextoMensaje] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [nuevoContactoId, setNuevoContactoId] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [alerta, setAlerta] = useState(null);

    /**
     * hace scroll al final del hilo de mensajes
     */
    const scrollAlFinal = useCallback(() => {
        requestAnimationFrame(() => {
            if (referenciaChat.current) {
                referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight;
            }
        });
    }, []);

    /**
     * carga todos los datos del chat desde la api
     */
    const cargarDatosDesdeApi = useCallback(async () => {
        try {
            const respuesta = await chat.obtenerDatos();
            const datos = respuesta.data;
            setContactos(datos.contactos || []);
            setNuevosContactos(datos.nuevosContactos || []);
            if (datos.contactoSeleccionado) {
                setContactoSeleccionado(datos.contactoSeleccionado);
            }
            setMensajes(datos.mensajes || []);
        } catch (error) {
            console.error('error cargando datos chat:', error);
            setAlerta({ tipo: 'error', texto: 'Error al cargar el chat' });
        }
    }, []);

    /**
     * carga datos iniciales del chat (blade inyectado o api)
     */
    const cargarDatosIniciales = useCallback(async () => {
        try {
            setCargandoInicial(true);

            const datosBlade = window.__DATOS_PAGINA__;
            const tieneDatos = datosBlade
                && typeof datosBlade === 'object'
                && (Array.isArray(datosBlade.contactos) || Array.isArray(datosBlade.nuevosContactos));

            if (tieneDatos) {
                setContactos(datosBlade.contactos || []);
                setNuevosContactos(datosBlade.nuevosContactos || []);
                setContactoSeleccionado(datosBlade.contactoSeleccionado || null);
                setMensajes(datosBlade.mensajes || []);
            } else {
                await cargarDatosDesdeApi();
            }
        } catch (error) {
            console.error('error en carga inicial:', error);
            setAlerta({ tipo: 'error', texto: 'Error al cargar el chat' });
        } finally {
            setCargandoInicial(false);
        }
    }, [cargarDatosDesdeApi]);

    /**
     * carga mensajes de un contacto concreto
     */
    const cargarMensajesContacto = useCallback(async (contactoId) => {
        if (!contactoId) return;
        try {
            const respuesta = await chat.obtenerMensajesContacto(contactoId);
            setMensajes(respuesta.data.mensajes || []);
        } catch (error) {
            console.error('error cargando mensajes:', error);
        }
    }, []);

    // carga inicial
    useEffect(() => {
        cargarDatosIniciales();
    }, [cargarDatosIniciales]);

    // scroll al final cuando cambian los mensajes
    useEffect(() => {
        scrollAlFinal();
    }, [mensajes, scrollAlFinal]);

    // polling cada 4 segundos
    useEffect(() => {
        if (!contactoSeleccionado) return;
        const intervalo = setInterval(() => {
            cargarMensajesContacto(contactoSeleccionado.id_empleado);
        }, 4000);
        return () => clearInterval(intervalo);
    }, [contactoSeleccionado, cargarMensajesContacto]);

    // enfocar input al seleccionar contacto
    useEffect(() => {
        if (contactoSeleccionado && inputRef.current) {
            inputRef.current.focus();
        }
    }, [contactoSeleccionado]);

    /**
     * selecciona un contacto y carga sus mensajes
     */
    const seleccionarContacto = async (contacto) => {
        setContactoSeleccionado(contacto);
        setMensajes([]);
        setCargando(true);
        try {
            await chat.seleccionarContacto(contacto.id_empleado);
            await cargarMensajesContacto(contacto.id_empleado);
        } catch (error) {
            setAlerta({ tipo: 'error', texto: 'Error al cargar conversación' });
        } finally {
            setCargando(false);
        }
    };

    /**
     * envía un mensaje al contacto seleccionado
     */
    const enviarMensaje = async (e) => {
        e.preventDefault();
        const textoLimpio = textoMensaje.trim();
        if (!textoLimpio || !contactoSeleccionado) return;

        setEnviando(true);

        // optimistic update
        const mensajeTemporal = {
            id: `temp-${Date.now()}`,
            mensaje: textoLimpio,
            soyYo: true,
            fecha: new Date().toISOString(),
            remitente: usuario?.nombre || 'Tú',
            temporal: true
        };

        setMensajes(prev => [...prev, mensajeTemporal]);
        setTextoMensaje('');
        scrollAlFinal();

        try {
            await chat.enviar(contactoSeleccionado.id_empleado, textoLimpio);
            await cargarMensajesContacto(contactoSeleccionado.id_empleado);
        } catch (error) {
            // revertir
            setMensajes(prev => prev.filter(m => m.id !== mensajeTemporal.id));
            setTextoMensaje(textoLimpio);
            setAlerta({ tipo: 'error', texto: 'Error al enviar mensaje' });
        } finally {
            setEnviando(false);
        }
    };

    /**
     * inicia conversación con un nuevo contacto
     */
    const abrirNuevoChat = async () => {
        if (!nuevoContactoId) return;

        const idNumerico = parseInt(nuevoContactoId, 10);
        if (isNaN(idNumerico)) return;

        try {
            setCargando(true);
            // guardar en sesión
            await chat.nuevoContacto(idNumerico);

            // buscar el contacto en la lista de nuevos
            const contacto = nuevosContactos.find(c => c.id_empleado === idNumerico);
            if (contacto) {
                // mover a la lista de contactos
                setContactos(prev => [...prev, contacto]);
                setNuevosContactos(prev => prev.filter(c => c.id_empleado !== idNumerico));
                setContactoSeleccionado(contacto);
                setMensajes([]);
            } else {
                // si no lo encontramos localmente recargar desde API
                await cargarDatosDesdeApi();
            }

            setModalAbierto(false);
            setNuevoContactoId('');
        } catch (error) {
            console.error('error abriendo nuevo chat:', error);
            setAlerta({ tipo: 'error', texto: 'Error al iniciar conversación' });
        } finally {
            setCargando(false);
        }
    };

    // pantalla de carga
    if (cargandoInicial) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-gray-500">Cargando chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {alerta && (
                <Alerta
                    tipo={alerta.tipo}
                    mensaje={alerta.texto}
                    onCerrar={() => setAlerta(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
                {/* panel de contactos */}
                <Tarjeta className="flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Contactos</h3>
                            <p className="text-sm text-gray-500">
                                {contactos.length} conversación{contactos.length !== 1 ? 'es' : ''}
                            </p>
                        </div>
                        <Boton
                            tamano="pequeno"
                            variante="contornoPrimario"
                            onClick={() => setModalAbierto(true)}
                            deshabilitado={nuevosContactos.length === 0}
                        >
                            + Nuevo
                        </Boton>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {contactos.length > 0 ? (
                            contactos.map((contacto) => (
                                <BotonContacto
                                    key={contacto.id_empleado}
                                    contacto={contacto}
                                    seleccionado={contactoSeleccionado?.id_empleado === contacto.id_empleado}
                                    onClick={() => seleccionarContacto(contacto)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                                <p className="text-gray-500 text-sm">No hay conversaciones</p>
                                <p className="text-gray-400 text-xs mt-1">Pulsa «+ Nuevo» para iniciar</p>
                            </div>
                        )}
                    </div>
                </Tarjeta>

                {/* zona de conversación */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <Tarjeta className="flex flex-col h-full overflow-hidden">
                        {/* cabecera */}
                        <div className="mb-4 pb-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">Conversación</h3>
                            {contactoSeleccionado ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <AvatarChat
                                        nombre={contactoSeleccionado.nombre}
                                        email={contactoSeleccionado.email}
                                        tamano="pequeno"
                                    />
                                    <div>
                                        <span className="text-sm text-gray-700 font-medium">
                                            {contactoSeleccionado.nombre}
                                        </span>
                                        <span className="text-sm text-gray-400 ml-2">
                                            {contactoSeleccionado.email}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Selecciona un contacto para chatear</p>
                            )}
                        </div>

                        {/* hilo de mensajes */}
                        <div
                            ref={referenciaChat}
                            className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200"
                            style={{ minHeight: '300px' }}
                        >
                            {!contactoSeleccionado ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-gray-500">Selecciona un contacto para comenzar</p>
                                    <p className="text-gray-400 text-sm mt-1">O inicia una nueva conversación</p>
                                </div>
                            ) : cargando && mensajes.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <svg className="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </div>
                            ) : mensajes.length > 0 ? (
                                <div className="space-y-4">
                                    {mensajes.map((msg, idx) => (
                                        <BurbujaMensaje
                                            key={msg.id || idx}
                                            mensaje={msg.mensaje}
                                            esMio={msg.soyYo}
                                            nombreRemitente={msg.remitente}
                                            fecha={msg.fechaFormateada || msg.fecha}
                                            nombreUsuario={usuario?.nombre}
                                            emailUsuario={usuario?.email}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <p className="text-gray-500">No hay mensajes todavía</p>
                                    <p className="text-gray-400 text-sm mt-1">¡Envía el primer mensaje!</p>
                                </div>
                            )}
                        </div>

                        {/* formulario de envío */}
                        {contactoSeleccionado && (
                            <form onSubmit={enviarMensaje} className="flex gap-2 mt-4 flex-shrink-0">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={textoMensaje}
                                    onChange={(e) => setTextoMensaje(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    disabled={enviando}
                                />
                                <Boton
                                    tipo="submit"
                                    cargando={enviando}
                                    deshabilitado={!textoMensaje.trim()}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Enviar
                                </Boton>
                            </form>
                        )}
                    </Tarjeta>
                </div>
            </div>

            {/* modal nuevo contacto */}
            <Modal
                abierto={modalAbierto}
                onCerrar={() => { setModalAbierto(false); setNuevoContactoId(''); }}
                titulo="Nueva conversación"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Selecciona un compañero para iniciar una conversación.
                    </p>
                    <CampoFormulario
                        etiqueta="Compañero"
                        tipo="select"
                        valor={nuevoContactoId}
                        onChange={(e) => setNuevoContactoId(e.target.value)}
                        opciones={[
                            { valor: '', texto: 'Selecciona un compañero', deshabilitado: true },
                            ...nuevosContactos.map(c => ({
                                valor: String(c.id_empleado),
                                texto: `${c.nombre} (${c.email})`
                            }))
                        ]}
                    />
                    {nuevosContactos.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">
                                Ya tienes conversaciones con todos tus compañeros.
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Boton
                            variante="contorno"
                            onClick={() => { setModalAbierto(false); setNuevoContactoId(''); }}
                        >
                            Cancelar
                        </Boton>
                        <Boton
                            onClick={abrirNuevoChat}
                            deshabilitado={!nuevoContactoId || nuevosContactos.length === 0}
                            cargando={cargando}
                        >
                            Iniciar chat
                        </Boton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
