/**
 * página de inicio de sesión
 * formulario de login con diseño coherente con la app
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autenticacion } from '../services/api';
import { useAuth } from '../context/ContextoAuth';

// icono de reloj para el logo
const IconoReloj = () => (
    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
);

// icono de email
const IconoEmail = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// icono de candado
const IconoCandado = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

// icono de ojo para mostrar/ocultar contraseña
const IconoOjo = ({ visible }) => (
    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {visible ? (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.05 6.05m3.828 3.828l4.242 4.242M6.05 6.05l-1.414-1.414m1.414 1.414L3.515 8.464M19.07 4.93l-3.192 3.192m0 0a3 3 0 01-4.243 4.243" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
            </>
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
        )}
    </svg>
);

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
