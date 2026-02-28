// página de calendario — vista mensual con cuadrícula + creación de eventos
import React, { useState, useEffect, useMemo } from 'react';
import { Tarjeta, Boton, CampoFormulario, Alerta, Modal, Paginador, usePaginacion } from '../components';
import { calendario, datosPagina } from '../services/api';
import { useAuth } from '../context/ContextoAuth';
import { formatearFechaISO } from '../utils';

// colores por tipo de evento
const COLORES_TIPO = {
    personal: { fondo: 'bg-blue-100', texto: 'text-blue-800', borde: 'border-blue-300', punto: 'bg-blue-500' },
    ausencia: { fondo: 'bg-amber-100', texto: 'text-amber-800', borde: 'border-amber-300', punto: 'bg-amber-500' },
    equipo: { fondo: 'bg-green-100', texto: 'text-green-800', borde: 'border-green-300', punto: 'bg-green-500' },
    compania: { fondo: 'bg-purple-100', texto: 'text-purple-800', borde: 'border-purple-300', punto: 'bg-purple-500' },
    festivo: { fondo: 'bg-red-100', texto: 'text-red-800', borde: 'border-red-300', punto: 'bg-red-500' },
};

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// normaliza eventos de distintas fuentes a formato común
const normalizarEventos = (eventos, ausencias, equipo, compania, festivos) => {
    const lista = [];

    (eventos || []).forEach(e => lista.push({
        id: e.id_evento || e.id,
        titulo: e.titulo || e.title || 'Evento',
        inicio: e.inicio || e.start,
        fin: e.fin || e.end || e.inicio || e.start,
        tipo: 'personal',
        descripcion: e.descripcion || '',
        ubicacion: e.ubicacion || '',
    }));

    (ausencias || []).forEach(e => lista.push({
        id: `aus-${e.id || e.id_solicitud || Math.random()}`,
        titulo: e.titulo || e.title || 'Ausencia',
        inicio: e.inicio || e.start,
        fin: e.fin || e.end || e.inicio || e.start,
        tipo: 'ausencia',
    }));

    (equipo || []).forEach(e => lista.push({
        id: e.id_evento || e.id,
        titulo: e.titulo || e.title || 'Equipo',
        inicio: e.inicio || e.start,
        fin: e.fin || e.end || e.inicio || e.start,
        tipo: 'equipo',
    }));

    (compania || []).forEach(e => lista.push({
        id: e.id_evento || e.id,
        titulo: e.titulo || e.title || 'Compañía',
        inicio: e.inicio || e.start,
        fin: e.fin || e.end || e.inicio || e.start,
        tipo: 'compania',
    }));

    // festivos como eventos de tipo especial
    (festivos || []).forEach(e => lista.push({
        id: `fest-${e.id || Math.random()}`,
        titulo: e.titulo || e.title || 'Festivo',
        inicio: e.inicio || e.start,
        fin: e.fin || e.end || e.inicio || e.start,
        tipo: 'festivo',
        descripcion: e.descripcion || '',
    }));

    return lista;
};

// genera la cuadrícula de días del mes (lunes a domingo)
const generarDiasMes = (anio, mes) => {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    // lunes = 0, martes = 1, ..., domingo = 6
    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6;

    const dias = [];

    // días del mes anterior para rellenar la primera semana
    for (let i = diaInicio - 1; i >= 0; i--) {
        const d = new Date(anio, mes, -i);
        dias.push({ fecha: d, esMesActual: false });
    }

    // días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
        dias.push({ fecha: new Date(anio, mes, d), esMesActual: true });
    }

    // rellenar hasta completar semanas (filas de 7)
    while (dias.length % 7 !== 0) {
        const ultimo = dias[dias.length - 1].fecha;
        const siguiente = new Date(ultimo);
        siguiente.setDate(siguiente.getDate() + 1);
        dias.push({ fecha: siguiente, esMesActual: false });
    }

    return dias;
};

// compara si una fecha cae en un rango (inicio-fin, inclusivo)
const fechaEnRango = (fecha, inicio, fin) => {
    const f = fecha.toISOString().slice(0, 10);
    const i = inicio?.slice(0, 10);
    const fi = fin?.slice(0, 10) || i;
    return f >= i && f <= fi;
};



export default function PaginaCalendario() {
    const { esAdminOResponsable } = useAuth();

    const [todosEventos, setTodosEventos] = useState([]);

    // listas separadas para las secciones inferiores
    const [eventosPersonales, setEventosPersonales] = useState([]);
    const [ausenciasAprobadas, setAusenciasAprobadas] = useState([]);
    const [eventosEquipo, setEventosEquipo] = useState([]);
    const [eventosCompania, setEventosCompania] = useState([]);
    const [festivosLista, setFestivosLista] = useState([]);

    const [formulario, setFormulario] = useState({
        titulo: '', descripcion: '', inicio: '', fin: '',
        tipo: 'personal', ubicacion: '', todo_dia: false
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // navegación mensual
    const hoy = new Date();
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth());

    // modal de detalle de día
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [modalDia, setModalDia] = useState(false);

    // modal de creación
    const [modalCrear, setModalCrear] = useState(false);

    // paginación de listas de eventos
    const paginacionPersonales = usePaginacion(eventosPersonales, 5);
    const paginacionAusencias = usePaginacion(ausenciasAprobadas, 5);
    const paginacionEquipo = usePaginacion(eventosEquipo, 5);
    const paginacionCompania = usePaginacion(eventosCompania, 5);
    const paginacionFestivos = usePaginacion(festivosLista, 5);

    // carga datos desde api
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.calendario();
            const lista = normalizarEventos(
                res.data.eventos,
                res.data.ausencias,
                res.data.equipo,
                res.data.compania,
                res.data.festivos
            );
            setTodosEventos(lista);

            // listas separadas para secciones inferiores
            setEventosPersonales(res.data.eventos || []);
            setAusenciasAprobadas(res.data.ausencias || []);
            setEventosEquipo(res.data.equipo || []);
            setEventosCompania(res.data.compania || []);
            setFestivosLista(res.data.festivos || []);
        } catch (e) {
            console.error('error cargando calendario:', e);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // cuadrícula del mes
    const diasMes = useMemo(() => generarDiasMes(anio, mes), [anio, mes]);

    // mapa de eventos por día (optimización)
    const eventosPorDia = useMemo(() => {
        const mapa = {};
        diasMes.forEach(({ fecha }) => {
            const clave = formatearFechaISO(fecha);
            mapa[clave] = todosEventos.filter(ev => fechaEnRango(fecha, ev.inicio, ev.fin));
        });
        return mapa;
    }, [diasMes, todosEventos]);

    // navegación
    const mesAnterior = () => {
        if (mes === 0) { setMes(11); setAnio(anio - 1); }
        else setMes(mes - 1);
    };

    const mesSiguiente = () => {
        if (mes === 11) { setMes(0); setAnio(anio + 1); }
        else setMes(mes + 1);
    };

    const irHoy = () => {
        setAnio(hoy.getFullYear());
        setMes(hoy.getMonth());
    };

    // nombre del mes
    const nombreMes = new Date(anio, mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;
        setFormulario(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // crea evento
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await calendario.crearEvento({
                ...formulario,
                todo_dia: formulario.todo_dia ? 1 : 0
            });
            setMensaje({ tipo: 'exito', texto: 'Evento creado correctamente' });
            setFormulario({
                titulo: '', descripcion: '', inicio: '', fin: '',
                tipo: 'personal', ubicacion: '', todo_dia: false
            });
            setModalCrear(false);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear evento' });
        } finally {
            setCargando(false);
        }
    };

    // click en un día
    const abrirDia = (fecha) => {
        const clave = formatearFechaISO(fecha);
        const eventosDelDia = eventosPorDia[clave] || [];
        setDiaSeleccionado({ fecha, eventos: eventosDelDia });
        setModalDia(true);
    };

    // abrir modal crear con fecha pre-rellenada
    const crearDesdeModal = () => {
        if (diaSeleccionado) {
            setFormulario(prev => ({
                ...prev,
                inicio: formatearFechaISO(diaSeleccionado.fecha),
                fin: formatearFechaISO(diaSeleccionado.fecha),
            }));
        }
        setModalDia(false);
        setModalCrear(true);
    };

    // opciones de tipo
    const opcionesTipo = [
        { valor: 'personal', texto: 'Personal' },
        ...(esAdminOResponsable() ? [
            { valor: 'equipo', texto: 'Equipo' },
            { valor: 'compania', texto: 'Compañía' }
        ] : [])
    ];

    // verifica si un día es hoy
    const esHoy = (fecha) => formatearFechaISO(fecha) === formatearFechaISO(hoy);

    return (
        <div className="space-y-4">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            {/* cabecera: navegación y crear */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={mesAnterior}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900 capitalize min-w-[200px] text-center">
                        {nombreMes}
                    </h2>
                    <button
                        onClick={mesSiguiente}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={irHoy}
                        className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hoy
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {/* leyenda */}
                    <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                        {Object.entries(COLORES_TIPO).map(([tipo, colores]) => (
                            <span key={tipo} className="flex items-center gap-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${colores.punto}`}></span>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </span>
                        ))}
                    </div>
                    <Boton onClick={() => setModalCrear(true)}>
                        + Nuevo evento
                    </Boton>
                </div>
            </div>

            {/* cuadrícula del calendario */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* encabezado días de la semana */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {DIAS_SEMANA.map(dia => (
                        <div key={dia} className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {dia}
                        </div>
                    ))}
                </div>

                {/* filas de semanas */}
                <div className="grid grid-cols-7">
                    {diasMes.map(({ fecha, esMesActual }, indice) => {
                        const clave = formatearFechaISO(fecha);
                        const eventosDelDia = eventosPorDia[clave] || [];
                        const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
                        const hoyClase = esHoy(fecha);

                        return (
                            <div
                                key={indice}
                                onClick={() => abrirDia(fecha)}
                                className={`min-h-[90px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors hover:bg-gray-50
                                    ${!esMesActual ? 'bg-gray-50' : ''}
                                    ${esFinDeSemana && esMesActual ? 'bg-red-50/30' : ''}
                                `}
                            >
                                {/* número del día */}
                                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full
                                    ${hoyClase ? 'bg-red-600 text-white' : ''}
                                    ${!esMesActual ? 'text-gray-300' : hoyClase ? '' : 'text-gray-700'}
                                `}>
                                    {fecha.getDate()}
                                </div>

                                {/* indicadores de eventos (máximo 3 visibles) */}
                                <div className="space-y-0.5">
                                    {eventosDelDia.slice(0, 3).map((ev, i) => {
                                        const colores = COLORES_TIPO[ev.tipo] || COLORES_TIPO.personal;
                                        return (
                                            <div
                                                key={i}
                                                className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${colores.fondo} ${colores.texto}`}
                                                title={ev.titulo}
                                            >
                                                {ev.titulo}
                                            </div>
                                        );
                                    })}
                                    {eventosDelDia.length > 3 && (
                                        <div className="text-[10px] text-gray-400 pl-1.5">
                                            +{eventosDelDia.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* listas de eventos debajo del calendario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Tarjeta titulo="Mis eventos">
                    {paginacionPersonales.itemsPaginados.length > 0 ? (
                        <ul className="space-y-2">
                            {paginacionPersonales.itemsPaginados.map((evento, i) => (
                                <li key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="font-semibold text-sm text-blue-800">
                                            {evento.titulo || evento.title || 'Evento'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4 mt-1">
                                        {evento.inicio || evento.start} → {evento.fin || evento.end || '—'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin eventos personales.</p>
                    )}
                    <Paginador
                        paginaActual={paginacionPersonales.paginaActual}
                        totalPaginas={paginacionPersonales.totalPaginas}
                        onCambiarPagina={paginacionPersonales.setPaginaActual}
                    />
                </Tarjeta>

                <Tarjeta titulo="Ausencias aprobadas">
                    {paginacionAusencias.itemsPaginados.length > 0 ? (
                        <ul className="space-y-2">
                            {paginacionAusencias.itemsPaginados.map((evento, i) => (
                                <li key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        <span className="font-semibold text-sm text-amber-800">
                                            {evento.titulo || evento.title || 'Ausencia'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4 mt-1">
                                        {evento.inicio || evento.start} → {evento.fin || evento.end || '—'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin ausencias aprobadas.</p>
                    )}
                    <Paginador
                        paginaActual={paginacionAusencias.paginaActual}
                        totalPaginas={paginacionAusencias.totalPaginas}
                        onCambiarPagina={paginacionAusencias.setPaginaActual}
                    />
                </Tarjeta>

                <Tarjeta titulo="Eventos de equipo">
                    {paginacionEquipo.itemsPaginados.length > 0 ? (
                        <ul className="space-y-2">
                            {paginacionEquipo.itemsPaginados.map((evento, i) => (
                                <li key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="font-semibold text-sm text-green-800">
                                            {evento.titulo || evento.title || 'Equipo'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4 mt-1">
                                        {evento.inicio || evento.start} → {evento.fin || evento.end || '—'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin eventos de equipo.</p>
                    )}
                    <Paginador
                        paginaActual={paginacionEquipo.paginaActual}
                        totalPaginas={paginacionEquipo.totalPaginas}
                        onCambiarPagina={paginacionEquipo.setPaginaActual}
                    />
                </Tarjeta>

                <Tarjeta titulo="Eventos de compañía">
                    {paginacionCompania.itemsPaginados.length > 0 ? (
                        <ul className="space-y-2">
                            {paginacionCompania.itemsPaginados.map((evento, i) => (
                                <li key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        <span className="font-semibold text-sm text-purple-800">
                                            {evento.titulo || evento.title || 'Compañía'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4 mt-1">
                                        {evento.inicio || evento.start} → {evento.fin || evento.end || '—'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin eventos de compañía.</p>
                    )}
                    <Paginador
                        paginaActual={paginacionCompania.paginaActual}
                        totalPaginas={paginacionCompania.totalPaginas}
                        onCambiarPagina={paginacionCompania.setPaginaActual}
                    />
                </Tarjeta>

                <Tarjeta titulo="Festivos">
                    {paginacionFestivos.itemsPaginados.length > 0 ? (
                        <ul className="space-y-2">
                            {paginacionFestivos.itemsPaginados.map((evento, i) => (
                                <li key={i} className="p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="font-semibold text-sm text-red-800">
                                            {evento.titulo || evento.title || 'Festivo'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 ml-4 mt-1">
                                        {evento.inicio || evento.start}
                                        {evento.descripcion && ` — ${evento.descripcion}`}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin festivos registrados.</p>
                    )}
                    <Paginador
                        paginaActual={paginacionFestivos.paginaActual}
                        totalPaginas={paginacionFestivos.totalPaginas}
                        onCambiarPagina={paginacionFestivos.setPaginaActual}
                    />
                </Tarjeta>
            </div>

            {/* modal detalle de día */}
            <Modal
                abierto={modalDia}
                onCerrar={() => setModalDia(false)}
                titulo={diaSeleccionado ? diaSeleccionado.fecha.toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                }) : ''}
            >
                <div className="space-y-3">
                    {diaSeleccionado?.eventos?.length > 0 ? (
                        diaSeleccionado.eventos.map((ev, i) => {
                            const colores = COLORES_TIPO[ev.tipo] || COLORES_TIPO.personal;
                            return (
                                <div key={i} className={`p-3 rounded-lg border ${colores.fondo} ${colores.borde}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${colores.punto}`}></span>
                                        <span className={`font-semibold text-sm ${colores.texto}`}>{ev.titulo}</span>
                                        <span className={`text-xs ml-auto ${colores.texto} opacity-70`}>{ev.tipo}</span>
                                    </div>
                                    {ev.descripcion && (
                                        <p className="text-xs text-gray-600 ml-4">{ev.descripcion}</p>
                                    )}
                                    {ev.ubicacion && (
                                        <p className="text-xs text-gray-500 ml-4 mt-1">📍 {ev.ubicacion}</p>
                                    )}
                                    <p className="text-xs text-gray-400 ml-4 mt-1">
                                        {ev.inicio?.slice(0, 10)}{ev.fin && ev.fin !== ev.inicio ? ` → ${ev.fin.slice(0, 10)}` : ''}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center py-4">Sin eventos este día.</p>
                    )}
                    <div className="flex justify-end pt-2">
                        <Boton onClick={crearDesdeModal}>
                            + Crear evento
                        </Boton>
                    </div>
                </div>
            </Modal>

            {/* modal crear evento */}
            <Modal
                abierto={modalCrear}
                onCerrar={() => setModalCrear(false)}
                titulo="Crear evento"
            >
                <form onSubmit={manejarCrear} className="space-y-4">
                    <CampoFormulario
                        etiqueta="Título"
                        tipo="text"
                        nombre="titulo"
                        valor={formulario.titulo}
                        onChange={manejarCambio}
                        requerido
                    />
                    <CampoFormulario
                        etiqueta="Descripción"
                        tipo="textarea"
                        nombre="descripcion"
                        valor={formulario.descripcion}
                        onChange={manejarCambio}
                        filas={3}
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
                        />
                    </div>
                    <CampoFormulario
                        etiqueta="Tipo"
                        tipo="select"
                        nombre="tipo"
                        valor={formulario.tipo}
                        onChange={manejarCambio}
                        opciones={opcionesTipo}
                    />
                    <CampoFormulario
                        etiqueta="Ubicación"
                        tipo="text"
                        nombre="ubicacion"
                        valor={formulario.ubicacion}
                        onChange={manejarCambio}
                        placeholder="Opcional"
                    />
                    <CampoFormulario
                        etiqueta="Todo el día"
                        tipo="checkbox"
                        nombre="todo_dia"
                        valor={formulario.todo_dia}
                        onChange={manejarCambio}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Boton variante="contorno" onClick={() => setModalCrear(false)}>
                            Cancelar
                        </Boton>
                        <Boton tipo="submit" cargando={cargando}>
                            Guardar evento
                        </Boton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
