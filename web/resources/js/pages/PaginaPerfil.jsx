/**
 * página de perfil del usuario autenticado
 * permite editar nombre, email, contraseña y ver info personal
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Alerta } from '../components';
import { perfil, datosPagina } from '../services/api';
import { useAuth } from '../context/ContextoAuth';

// iconos
const IconoProyecto = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const IconoVacaciones = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// etiqueta de estado coloreada
function etiquetaEstado(estado) {
    const estilos = {
        alta: 'bg-green-100 text-green-700',
        baja: 'bg-red-100 text-red-700',
        baja_temporal: 'bg-yellow-100 text-yellow-700',
        pendiente: 'bg-yellow-100 text-yellow-700',
        aprobada: 'bg-green-100 text-green-700',
        rechazada: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${estilos[estado] || 'bg-gray-100 text-gray-600'}`}>
            {estado}
        </span>
    );
}

export default function PaginaPerfil() {
    const { usuario, setUsuario } = useAuth();
    const [datosPerfil, setDatosPerfil] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [formulario, setFormulario] = useState({
        nombre: '',
        apellido1: '',
        apellido2: '',
        email: '',
        contrasena: '',
        contrasena_confirmation: '',
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // carga datos del perfil
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await datosPagina.perfil();
                const p = res.data.perfil;
                setDatosPerfil(p);
                setSolicitudes(res.data.solicitudes || []);
                setFormulario({
                    nombre: p.nombre || '',
                    apellido1: p.apellido1 || '',
                    apellido2: p.apellido2 || '',
                    email: p.email || '',
                    contrasena: '',
                    contrasena_confirmation: '',
                });
            } catch (e) {
                console.error('error cargando perfil:', e);
            }
        };
        cargar();
    }, []);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // guarda los cambios del perfil
    const manejarGuardar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);

        try {
            const res = await perfil.actualizar(formulario);
            setMensaje({ tipo: 'exito', texto: res.data.message });
            // actualiza el contexto de auth con el nombre nuevo
            if (res.data.perfil) {
                setUsuario(prev => ({
                    ...prev,
                    nombre: res.data.perfil.nombre,
                    email: res.data.perfil.email,
                }));
            }
            // limpia campos de contraseña
            setFormulario(prev => ({ ...prev, contrasena: '', contrasena_confirmation: '' }));
        } catch (error) {
            const errores = error.response?.data?.errors;
            if (errores) {
                const textos = Object.values(errores).flat().join('. ');
                setMensaje({ tipo: 'error', texto: textos });
            } else {
                setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al guardar' });
            }
        } finally {
            setCargando(false);
        }
    };

    // obtiene iniciales para avatar
    const iniciales = (datosPerfil?.nombre || 'U').slice(0, 2).toUpperCase();

    return (
        <div className="space-y-6">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* columna izquierda: info y formulario */}
                <div className="lg:col-span-2 space-y-6">
                    {/* tarjeta de identificación */}
                    {datosPerfil && (
                        <Tarjeta>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xl font-bold shadow">
                                    {iniciales}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {datosPerfil.nombre} {datosPerfil.apellido1} {datosPerfil.apellido2}
                                    </h3>
                                    <p className="text-sm text-gray-500">{datosPerfil.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {etiquetaEstado(datosPerfil.estado)}
                                        {datosPerfil.departamento && (
                                            <span className="text-xs text-gray-400">
                                                {datosPerfil.departamento.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <span className="text-gray-400">DNI</span>
                                    <p className="font-medium text-gray-900">{datosPerfil.dni}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <span className="text-gray-400">Roles</span>
                                    <p className="font-medium text-gray-900">
                                        {datosPerfil.roles?.map(r => r.nombre).join(', ') || 'Empleado'}
                                    </p>
                                </div>
                            </div>
                        </Tarjeta>
                    )}

                    {/* formulario de edición */}
                    <Tarjeta titulo="Editar perfil">
                        <form onSubmit={manejarGuardar} className="space-y-4">
                            <CampoFormulario
                                etiqueta="Nombre"
                                tipo="text"
                                nombre="nombre"
                                valor={formulario.nombre}
                                onChange={manejarCambio}
                                requerido
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <CampoFormulario
                                    etiqueta="Primer apellido"
                                    tipo="text"
                                    nombre="apellido1"
                                    valor={formulario.apellido1}
                                    onChange={manejarCambio}
                                    requerido
                                />
                                <CampoFormulario
                                    etiqueta="Segundo apellido"
                                    tipo="text"
                                    nombre="apellido2"
                                    valor={formulario.apellido2}
                                    onChange={manejarCambio}
                                />
                            </div>
                            <CampoFormulario
                                etiqueta="Email"
                                tipo="email"
                                nombre="email"
                                valor={formulario.email}
                                onChange={manejarCambio}
                                requerido
                            />
                            <hr className="border-gray-200" />
                            <p className="text-xs text-gray-400">dejar en blanco para mantener la contraseña actual</p>
                            <div className="grid grid-cols-2 gap-4">
                                <CampoFormulario
                                    etiqueta="Nueva contraseña"
                                    tipo="password"
                                    nombre="contrasena"
                                    valor={formulario.contrasena}
                                    onChange={manejarCambio}
                                />
                                <CampoFormulario
                                    etiqueta="Confirmar contraseña"
                                    tipo="password"
                                    nombre="contrasena_confirmation"
                                    valor={formulario.contrasena_confirmation}
                                    onChange={manejarCambio}
                                />
                            </div>
                            <Boton tipo="submit" cargando={cargando} className="w-full">
                                Guardar cambios
                            </Boton>
                        </form>
                    </Tarjeta>
                </div>

                {/* columna derecha: proyectos, vacaciones, solicitudes */}
                <div className="space-y-6">
                    {/* vacaciones */}
                    <Tarjeta>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <IconoVacaciones />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Días de vacaciones</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {datosPerfil?.dias_vacaciones_restantes ?? 0}
                                </p>
                            </div>
                        </div>
                    </Tarjeta>

                    {/* proyectos asignados */}
                    <Tarjeta titulo="Proyectos activos">
                        {datosPerfil?.proyectos?.length > 0 ? (
                            <div className="space-y-2">
                                {datosPerfil.proyectos.map(p => (
                                    <div
                                        key={p.id_proyecto}
                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
                                            <IconoProyecto />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{p.nombre}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Sin proyectos asignados</p>
                        )}
                    </Tarjeta>

                    {/* solicitudes recientes */}
                    <Tarjeta titulo="Solicitudes recientes">
                        {solicitudes.length > 0 ? (
                            <div className="space-y-2">
                                {solicitudes.map(s => (
                                    <div
                                        key={s.id_solicitud}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                                    >
                                        <span className="text-gray-700">{s.tipo?.nombre || 'Solicitud'}</span>
                                        {etiquetaEstado(s.estado)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Sin solicitudes</p>
                        )}
                    </Tarjeta>
                </div>
            </div>
        </div>
    );
}
