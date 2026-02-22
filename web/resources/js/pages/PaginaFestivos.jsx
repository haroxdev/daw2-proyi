/**
 * página de gestión de festivos (admin)
 * permite crear, editar y eliminar días festivos
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Alerta, Modal, Paginador, usePaginacion } from '../components';
import { festivos, datosPagina } from '../services/api';

export default function PaginaFestivos() {
    const [listaFestivos, setListaFestivos] = useState([]);
    const [formulario, setFormulario] = useState({ nombre: '', fecha: '', descripcion: '' });
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: festivosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaFestivos, 5);

    // carga festivos desde la api
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.festivos();
            setListaFestivos(res.data.festivos || []);
        } catch (e) {
            console.error('error cargando festivos:', e);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const resetFormulario = () => {
        setFormulario({ nombre: '', fecha: '', descripcion: '' });
        setEditando(null);
    };

    // crea o actualiza un festivo
    const manejarGuardar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);

        try {
            if (editando) {
                await festivos.actualizar(editando, formulario);
                setMensaje({ tipo: 'exito', texto: 'Festivo actualizado' });
            } else {
                await festivos.crear(formulario);
                setMensaje({ tipo: 'exito', texto: 'Festivo creado' });
            }
            resetFormulario();
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al guardar' });
        } finally {
            setCargando(false);
        }
    };

    // elimina un festivo
    const manejarEliminar = async (id) => {
        if (!confirm('¿Eliminar este festivo?')) return;
        setCargando(true);
        try {
            await festivos.eliminar(id);
            setMensaje({ tipo: 'exito', texto: 'Festivo eliminado' });
            await cargarDatos();
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al eliminar' });
        } finally {
            setCargando(false);
        }
    };

    // prepara el formulario para editar
    const iniciarEdicion = (festivo) => {
        setEditando(festivo.id_festivo);
        setFormulario({
            nombre: festivo.nombre,
            fecha: festivo.fecha?.slice(0, 10) || festivo.fecha,
            descripcion: festivo.descripcion || '',
        });
    };

    return (
        <div className="space-y-6">
            {mensaje && (
                <Alerta
                    tipo={mensaje.tipo}
                    mensaje={mensaje.texto}
                    onCerrar={() => setMensaje(null)}
                />
            )}

            <h2 className="text-2xl font-bold text-gray-900">Festivos</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* formulario */}
                <Tarjeta titulo={editando ? 'Editar festivo' : 'Nuevo festivo'}>
                    <form onSubmit={manejarGuardar} className="space-y-4">
                        <CampoFormulario
                            etiqueta="Nombre"
                            tipo="text"
                            nombre="nombre"
                            valor={formulario.nombre}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Fecha"
                            tipo="date"
                            nombre="fecha"
                            valor={formulario.fecha}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Descripción"
                            tipo="text"
                            nombre="descripcion"
                            valor={formulario.descripcion}
                            onChange={manejarCambio}
                            placeholder="Opcional"
                        />
                        <div className="flex gap-2">
                            <Boton tipo="submit" cargando={cargando} className="flex-1">
                                {editando ? 'Actualizar' : 'Crear'}
                            </Boton>
                            {editando && (
                                <Boton variante="contorno" onClick={resetFormulario}>
                                    Cancelar
                                </Boton>
                            )}
                        </div>
                    </form>
                </Tarjeta>

                {/* listado */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Calendario de festivos">
                        {listaFestivos.length > 0 ? (
                            <div className="space-y-2">
                                {festivosPaginados.map(f => (
                                    <div
                                        key={f.id_festivo}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{f.nombre}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(f.fecha).toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                                {f.descripcion && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        — {f.descripcion}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Boton
                                                tamano="pequeno"
                                                variante="contorno"
                                                onClick={() => iniciarEdicion(f)}
                                            >
                                                Editar
                                            </Boton>
                                            <Boton
                                                tamano="pequeno"
                                                variante="contorno"
                                                onClick={() => manejarEliminar(f.id_festivo)}
                                                deshabilitado={cargando}
                                            >
                                                Eliminar
                                            </Boton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay festivos registrados.</p>
                        )}
                        <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onCambiarPagina={setPaginaActual}
                        />
                    </Tarjeta>
                </div>
            </div>
        </div>
    );
}
