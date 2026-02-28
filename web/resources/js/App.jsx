// componente principal — configura rutas y proveedores de contexto
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAuth, useAuth } from './context/ContextoAuth';
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

// protege rutas que requieren roles específicos
function RutaProtegida({ roles, children }) {
    const { tieneRol, autenticado } = useAuth();
    if (!autenticado) return <Navigate to="/login" replace />;
    if (roles && !tieneRol(roles)) return <Navigate to="/panel" replace />;
    return children;
}

export default function App() {
    const usuarioInicial = window.__USUARIO_INICIAL__ || null;

    return (
        <ProveedorAuth usuarioInicial={usuarioInicial}>
            <BrowserRouter>
                <Routes>
                    {/* login sin layout */}
                    <Route path="/login" element={<PaginaLogin />} />

                    {/* rutas con layout principal */}
                    <Route element={<LayoutPrincipal />}>
                        {/* páginas de usuario autenticado */}
                        <Route path="/panel" element={<PaginaPanel />} />
                        <Route path="/fichaje" element={<PaginaFichaje />} />
                        <Route path="/ausencias" element={<PaginaAusencias />} />
                        <Route path="/timesheets" element={<PaginaTimesheets />} />
                        <Route path="/calendario" element={<PaginaCalendario />} />
                        <Route path="/chat" element={<PaginaChat />} />
                        <Route path="/notificaciones" element={<PaginaNotificaciones />} />
                        <Route path="/perfil" element={<PaginaPerfil />} />
                        <Route path="/proyectos" element={<PaginaProyectos />} />
                        <Route path="/tareas" element={<PaginaTareas />} />

                        {/* páginas admin + responsable */}
                        <Route path="/equipo" element={<RutaProtegida roles={['admin', 'responsable']}><PaginaEquipo /></RutaProtegida>} />
                        <Route path="/admin/revisiones" element={<RutaProtegida roles={['admin', 'responsable']}><PaginaRevisiones /></RutaProtegida>} />
                        <Route path="/reporting" element={<RutaProtegida roles={['admin', 'responsable']}><PaginaReporting /></RutaProtegida>} />

                        {/* páginas admin exclusivo */}
                        <Route path="/empresa" element={<RutaProtegida roles={['admin']}><PaginaEmpresa /></RutaProtegida>} />
                        <Route path="/departamentos" element={<RutaProtegida roles={['admin']}><PaginaDepartamentos /></RutaProtegida>} />
                        <Route path="/tipos-ausencia" element={<RutaProtegida roles={['admin']}><PaginaTiposAusencia /></RutaProtegida>} />
                        <Route path="/festivos" element={<RutaProtegida roles={['admin']}><PaginaFestivos /></RutaProtegida>} />
                    </Route>

                    {/* redirección por defecto */}
                    <Route path="/" element={<Navigate to="/panel" replace />} />
                    <Route path="*" element={<Navigate to="/panel" replace />} />
                </Routes>
            </BrowserRouter>
        </ProveedorAuth>
    );
}
