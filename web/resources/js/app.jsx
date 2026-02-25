/**
 * componente principal de la aplicación
 * configura rutas y proveedores de contexto
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAuth } from './context/ContextoAuth';
import { LayoutPrincipal } from './components';
import {
    PaginaLogin,
    PaginaPanel,
    PaginaFichaje,
    PaginaAusencias,
    PaginaTimesheets,
    PaginaCalendario,
    PaginaChat,
    PaginaNotificaciones,
    PaginaProyectos,
    PaginaTareas,
    PaginaEquipo,
    PaginaEmpresa,
    PaginaDepartamentos,
    PaginaTiposAusencia,
    PaginaRevisiones,
    PaginaReporting,
    PaginaPerfil,
    PaginaFestivos
} from './pages';

export default function App() {
    // obtiene datos del usuario inyectados por blade
    const usuarioInicial = window.__USUARIO_INICIAL__ || null;

    return (
        <ProveedorAuth usuarioInicial={usuarioInicial}>
            <BrowserRouter>
                <Routes>
                    {/* login sin layout */}
                    <Route path="/login" element={<PaginaLogin />} />

                    {/* rutas con layout principal */}
                    <Route element={<LayoutPrincipal />}>
                        {/* páginas de usuario */}
                        <Route path="/panel" element={<PaginaPanel />} />
                        <Route path="/fichaje" element={<PaginaFichaje />} />
                        <Route path="/ausencias" element={<PaginaAusencias />} />
                        <Route path="/timesheets" element={<PaginaTimesheets />} />
                        <Route path="/calendario" element={<PaginaCalendario />} />
                        <Route path="/chat" element={<PaginaChat />} />
                        <Route path="/notificaciones" element={<PaginaNotificaciones />} />
                        <Route path="/perfil" element={<PaginaPerfil />} />
                        
                        {/* páginas de administración */}
                        <Route path="/proyectos" element={<PaginaProyectos />} />
                        <Route path="/tareas" element={<PaginaTareas />} />
                        <Route path="/equipo" element={<PaginaEquipo />} />
                        <Route path="/empresa" element={<PaginaEmpresa />} />
                        <Route path="/departamentos" element={<PaginaDepartamentos />} />
                        <Route path="/tipos-ausencia" element={<PaginaTiposAusencia />} />
                        <Route path="/admin/revisiones" element={<PaginaRevisiones />} />
                        <Route path="/reporting" element={<PaginaReporting />} />
                        <Route path="/festivos" element={<PaginaFestivos />} />
                    </Route>

                    {/* redirección por defecto */}
                    <Route path="/" element={<Navigate to="/panel" replace />} />
                    <Route path="*" element={<Navigate to="/panel" replace />} />
                </Routes>
            </BrowserRouter>
        </ProveedorAuth>
    );
}
