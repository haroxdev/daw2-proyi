/**
 * componente de barra lateral de navegación
 * muestra menú según rol del usuario con iconos y secciones
 */
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/ContextoAuth';
import { autenticacion, datosPagina } from '../services/api';
import { obtenerIniciales } from '../utils';
import {
    IconoDashboard, IconoReloj, IconoTimesheet, IconoProyecto,
    IconoCalendario, IconoUsuarios, IconoCheck, IconoInformes,
    IconoAuditoria, IconoUsuario, IconoConfiguracion, IconoChat,
    IconoCerrarSesion, IconoTareas,
} from './Iconos';

export default function BarraLateral() {
    const { usuario, esAdminOResponsable, esAdmin } = useAuth();
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
        { ruta: '/fichaje', icono: IconoReloj, texto: 'Fichaje' },
        { ruta: '/timesheets', icono: IconoTimesheet, texto: 'Timesheet' },
        { ruta: '/chat', icono: IconoChat, texto: 'Chat' },
    ];

    const seccionGestion = [
        { ruta: '/proyectos', icono: IconoProyecto, texto: 'Proyectos' },
        { ruta: '/tareas', icono: IconoTareas, texto: 'Tareas' },
        { ruta: '/ausencias', icono: IconoCalendario, texto: 'Ausencias', badge: contadores.ausencias },
        { ruta: '/calendario', icono: IconoCalendario, texto: 'Calendario' },
        // { ruta: '/notificaciones', icono: IconoAuditoria, texto: 'Notificaciones', badge: contadores.notificaciones }, retirado debido a boton superior
    ];

    // panel admin: gestión de personas, aprobaciones e informes
    const seccionAdministracion = [
        { ruta: '/equipo', icono: IconoUsuarios, texto: 'Usuarios' },
        { ruta: '/admin/revisiones', icono: IconoCheck, texto: 'Aprobaciones', badge: contadores.revisiones },
        { ruta: '/reporting', icono: IconoInformes, texto: 'Informes' },
    ];

    // panel admin: configuración del sistema
    const seccionSistema = [
        { ruta: '/empresa', icono: IconoConfiguracion, texto: 'Empresa' },
        { ruta: '/departamentos', icono: IconoUsuarios, texto: 'Departamentos' },
        { ruta: '/tipos-ausencia', icono: IconoCalendario, texto: 'Tipos de ausencia' },
        { ruta: '/festivos', icono: IconoCalendario, texto: 'Festivos' },
    ];

    const seccionConfiguracion = [
        { ruta: '/perfil', icono: IconoUsuario, texto: 'Mi Perfil' },
    ];

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* logo */}
            <div className="px-5 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <IconoReloj />
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

                {/* sección sistema (solo admin) */}
                {esAdmin() && (
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
