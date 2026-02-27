/**
 * componente de barra lateral de navegación
 * muestra menú según rol del usuario con iconos y secciones
 */
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/ContextoAuth';
import { autenticacion, datosPagina } from '../services/api';

// iconos como componentes svg
const IconoDashboard = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const IconoFichaje = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoTimesheet = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const IconoProyectos = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const IconoAusencias = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconoCalendario = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconoUsuarios = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const IconoAprobaciones = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoInformes = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const IconoAuditoria = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const IconoPerfil = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconoConfiguracion = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconoChat = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const IconoCerrarSesion = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const IconoTareas = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export default function BarraLateral() {
    const { usuario, esAdminOResponsable } = useAuth();
    const [contadores, setContadores] = useState({ notificaciones: 0, ausencias: 0, revisiones: 0 });

    // carga contadores reales desde la api
    useEffect(() => {
        if (!usuario) return;
        const cargar = async () => {
            try {
                const res = await datosPagina.contadores();
                setContadores(res.data);
            } catch (e) {
                // silencia errores de contadores
            }
        };
        cargar();
        // refresca cada 60s
        const intervalo = setInterval(cargar, 60000);
        return () => clearInterval(intervalo);
    }, [usuario]);

    // obtiene iniciales del nombre para el avatar
    const obtenerIniciales = (nombre, email) => {
        const texto = nombre || email || 'U';
        return texto.slice(0, 2).toUpperCase();
    };

    // maneja el cierre de sesión
    const manejarCerrarSesion = async (e) => {
        e.preventDefault();
        try {
            await autenticacion.cerrarSesion();
            window.location.href = '/login';
        } catch (error) {
            console.error('error al cerrar sesión:', error);
            window.location.href = '/login';
        }
    };

    // componente de enlace de navegación
    const EnlaceNav = ({ ruta, icono: Icono, texto, badge }) => (
        <NavLink
            to={ruta}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <Icono />
                    <span className="flex-1">{texto}</span>
                    {badge > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                            isActive ? 'bg-white text-red-600' : 'bg-red-500 text-white'
                        }`}>
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );

    // secciones del menú
    const seccionPrincipal = [
        { ruta: '/panel', icono: IconoDashboard, texto: 'Dashboard' },
        { ruta: '/fichaje', icono: IconoFichaje, texto: 'Fichaje' },
        { ruta: '/timesheets', icono: IconoTimesheet, texto: 'Timesheet' },
        { ruta: '/chat', icono: IconoChat, texto: 'Chat' },
    ];

    const seccionGestion = [
        { ruta: '/proyectos', icono: IconoProyectos, texto: 'Proyectos' },
        { ruta: '/tareas', icono: IconoTareas, texto: 'Tareas' },
        { ruta: '/ausencias', icono: IconoAusencias, texto: 'Ausencias', badge: contadores.ausencias },
        { ruta: '/calendario', icono: IconoCalendario, texto: 'Calendario' },
        // { ruta: '/notificaciones', icono: IconoAuditoria, texto: 'Notificaciones', badge: contadores.notificaciones }, retirado debido a boton superior
    ];

    // panel admin: gestión de personas, aprobaciones e informes
    const seccionAdministracion = [
        { ruta: '/equipo', icono: IconoUsuarios, texto: 'Usuarios' },
        { ruta: '/admin/revisiones', icono: IconoAprobaciones, texto: 'Aprobaciones', badge: contadores.revisiones },
        { ruta: '/reporting', icono: IconoInformes, texto: 'Informes' },
    ];

    // panel admin: configuración del sistema
    const seccionSistema = [
        { ruta: '/empresa', icono: IconoConfiguracion, texto: 'Empresa' },
        { ruta: '/departamentos', icono: IconoUsuarios, texto: 'Departamentos' },
        { ruta: '/tipos-ausencia', icono: IconoAusencias, texto: 'Tipos de ausencia' },
        { ruta: '/festivos', icono: IconoCalendario, texto: 'Festivos' },
    ];

    const seccionConfiguracion = [
        { ruta: '/perfil', icono: IconoPerfil, texto: 'Mi Perfil' },
    ];

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* logo */}
            <div className="px-5 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <IconoFichaje />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-xl font-bold text-gray-900">
                            {window.__EMPRESA_NOMBRE__ || 'GesTime'}
                        </span>
                        {window.__EMPRESA_NOMBRE__ && (
                            <span className="text-[10px] text-gray-400">(GesTime)</span>
                        )}
                    </div>
                </div>
            </div>

            {/* navegación */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* sección principal */}
                <div>
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Principal
                    </p>
                    <div className="space-y-1">
                        {seccionPrincipal.map(enlace => (
                            <EnlaceNav key={enlace.ruta} {...enlace} />
                        ))}
                    </div>
                </div>

                {/* sección gestión */}
                <div>
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Gestión
                    </p>
                    <div className="space-y-1">
                        {seccionGestion.map(enlace => (
                            <EnlaceNav key={enlace.ruta} {...enlace} />
                        ))}
                    </div>
                </div>

                {/* sección administración */}
                {esAdminOResponsable() && (
                    <div>
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Administración
                        </p>
                        <div className="space-y-1">
                            {seccionAdministracion.map(enlace => (
                                <EnlaceNav key={enlace.ruta} {...enlace} />
                            ))}
                        </div>
                    </div>
                )}

                {/* sección sistema (admin) */}
                {esAdminOResponsable() && (
                    <div>
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Sistema
                        </p>
                        <div className="space-y-1">
                            {seccionSistema.map(enlace => (
                                <EnlaceNav key={enlace.ruta} {...enlace} />
                            ))}
                        </div>
                    </div>
                )}

                {/* sección configuración */}
                <div>
                    <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Configuración
                    </p>
                    <div className="space-y-1">
                        {seccionConfiguracion.map(enlace => (
                            <EnlaceNav key={enlace.ruta} {...enlace} />
                        ))}
                    </div>
                </div>
            </nav>

            {/* usuario y cerrar sesión */}
            <div className="p-4 border-t border-gray-100">
                {usuario && (
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            {obtenerIniciales(usuario.nombre, usuario.email)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-semibold text-gray-900 text-sm truncate">
                                {usuario.nombre || 'Usuario'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {usuario.roles?.[0]?.nombre || 'Empleado'}
                            </div>
                        </div>
                        <button
                            onClick={manejarCerrarSesion}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cerrar sesión"
                        >
                            <IconoCerrarSesion />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
