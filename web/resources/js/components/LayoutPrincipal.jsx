/**
 * componente layout principal
 * contiene la barra lateral, header superior y el área de contenido
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import BarraLateral from './BarraLateral';
import { datosPagina } from '../services/api';

// iconos del header
const IconoBuscar = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const IconoTema = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const IconoCampana = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const IconoUsuario = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// obtener título de la página según la ruta
const obtenerTituloPagina = (ruta) => {
    const titulos = {
        '/panel': 'Dashboard',
        '/fichaje': 'Control de Fichaje',
        '/timesheets': 'Timesheets',
        '/proyectos': 'Proyectos',
        '/ausencias': 'Ausencias',
        '/calendario': 'Calendario',
        '/chat': 'Chat',
        '/equipo': 'Usuarios',
        '/admin/revisiones': 'Aprobaciones',
        '/reporting': 'Informes',
        '/notificaciones': 'Notificaciones',
        '/empresa': 'Mi Perfil',
        '/departamentos': 'Configuración',
        '/tareas': 'Tareas',
        '/tipos-ausencia': 'Tipos de Ausencia',
    };
    return titulos[ruta] || (window.__EMPRESA_NOMBRE__ || 'GesTime');
};

export default function LayoutPrincipal() {
    const location = useLocation();
    const [busqueda, setBusqueda] = useState('');
    const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);
    const titulo = obtenerTituloPagina(location.pathname);

    // carga contadores de notificaciones sin leer
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await datosPagina.contadores();
                setNotificacionesSinLeer(res.data.notificaciones || 0);
            } catch (e) {
                // silencia errores
            }
        };
        cargar();
        const intervalo = setInterval(cargar, 60000);
        return () => clearInterval(intervalo);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <BarraLateral />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* header superior */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
                    
                    <div className="flex items-center gap-4">

                        {/* iconos de acción */}
                        <Link 
                            to="/notificaciones" 
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <IconoCampana />
                            {notificacionesSinLeer > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {notificacionesSinLeer > 9 ? '9+' : notificacionesSinLeer}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/empresa"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <IconoUsuario />
                        </Link>
                    </div>
                </header>
                
                {/* contenido principal */}
                <main className="flex-1 p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
