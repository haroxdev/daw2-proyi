// página de inicio de sesión
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autenticacion } from '../services/api';
import { useAuth } from '../context/ContextoAuth';
import { IconoRelojGrande as IconoReloj, IconoEmail, IconoCandado, IconoOjo } from '../components';

export default function PaginaLogin() {
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { setUsuario } = useAuth();
    const navegar = useNavigate();

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const res = await autenticacion.iniciarSesion(email, contrasena);
            // carga el usuario en el contexto y navega al panel
            setUsuario(res.data.usuario);
            navegar('/panel', { replace: true });
        } catch (err) {
            const mensajeError = err.response?.data?.errors?.email?.[0]
                || err.response?.data?.message
                || 'Credenciales inválidas';
            setError(mensajeError);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* fondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-40 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-50 rounded-full opacity-50 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* cabecera con logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
                        <IconoReloj />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {window.__EMPRESA_NOMBRE__ || 'GesTime'}
                    </h1>
                    {window.__EMPRESA_NOMBRE__ && (
                        <span className="text-xs text-gray-400">(GesTime)</span>
                    )}
                    <p className="text-gray-500 mt-1">Gestión de tiempo y asistencia</p>
                </div>

                {/* tarjeta de login */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Iniciar sesión</h2>

                    {/* alerta de error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm text-red-700">{error}</span>
                        </div>
                    )}

                    <form onSubmit={manejarEnvio} className="space-y-5">
                        {/* campo email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconoEmail />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@empresa.com"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* campo contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconoCandado />
                                </div>
                                <input
                                    id="password"
                                    type={mostrarContrasena ? 'text' : 'password'}
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    tabIndex={-1}
                                >
                                    <IconoOjo visible={mostrarContrasena} />
                                </button>
                            </div>
                        </div>

                        {/* botón de login */}
                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {cargando ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Accediendo...
                                </>
                            ) : 'Entrar'}
                        </button>
                    </form>
                </div>

                {/* pie */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} {window.__EMPRESA_NOMBRE__ || 'GesTime'} · Control horario
                </p>
            </div>
        </div>
    );
}
