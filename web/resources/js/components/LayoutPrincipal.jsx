/**
 * componente layout principal
 * contiene la barra lateral, header superior y el área de contenido
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import BarraLateral from './BarraLateral';
import { datosPagina } from '../services/api';
import { IconoCampana, IconoUsuario } from './Iconos';

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
        '/perfil': 'Mi Perfil',
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
                            to="/perfil"
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
