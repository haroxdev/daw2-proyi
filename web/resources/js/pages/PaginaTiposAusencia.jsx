/**
 * página de tipos de ausencia (admin)
 * permite crear y gestionar tipos de ausencia
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Paginador, usePaginacion } from '../components';
import { tiposAusencia, datosPagina } from '../services/api';

export default function PaginaTiposAusencia() {
    // estado local
    const [tipos, setTipos] = useState([]);
    const [formulario, setFormulario] = useState({
        nombre: '',
        remunerado: true
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: tiposPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(tipos, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.tiposAusencia();
            setTipos(res.data.tipos || []);
        } catch (e) {
            console.error('error cargando tipos ausencia:', e);
        }
    };

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;
        setFormulario(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // crea un nuevo tipo
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await tiposAusencia.crear({
                nombre: formulario.nombre,
                remunerado: formulario.remunerado ? 1 : 0
            });
            setMensaje({ tipo: 'exito', texto: 'Tipo de ausencia creado correctamente' });
            setFormulario({ nombre: '', remunerado: true });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear tipo' });
        } finally {
            setCargando(false);
        }
    };

    // actualiza un tipo
    const manejarActualizar = async (idTipo, datos) => {
        setCargando(true);
        try {
            await tiposAusencia.actualizar(idTipo, {
                nombre: datos.nombre,
                remunerado: datos.remunerado ? 1 : 0
            });
            setMensaje({ tipo: 'exito', texto: 'Tipo actualizado' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar tipo' });
        } finally {
            setCargando(false);
        }
    };

    // elimina un tipo
    const manejarEliminar = async (idTipo) => {
        if (!confirm('¿Eliminar este tipo?')) return;
        setCargando(true);
        try {
            await tiposAusencia.eliminar(idTipo);
            setMensaje({ tipo: 'exito', texto: 'Tipo eliminado' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al eliminar tipo' });
        } finally {
            setCargando(false);
        }
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* formulario de creación */}
                <Tarjeta titulo="Nuevo tipo" className="h-fit">
                    <form onSubmit={manejarCrear} className="space-y-4">
                        <CampoFormulario
                            etiqueta="Nombre"
                            tipo="text"
                            nombre="nombre"
                            valor={formulario.nombre}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Remunerado"
                            tipo="checkbox"
                            nombre="remunerado"
                            valor={formulario.remunerado}
                            onChange={manejarCambio}
                        />
                        <Boton tipo="submit" cargando={cargando} className="w-full">
                            Crear
                        </Boton>
                    </form>
                </Tarjeta>

                {/* listado de tipos */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Tipos de ausencia">
                        <Tabla>
                            <EncabezadoTabla>
                                <CeldaEncabezado>Nombre</CeldaEncabezado>
                                <CeldaEncabezado>Remunerado</CeldaEncabezado>
                                <CeldaEncabezado className="text-right">Acciones</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {tiposPaginados.length > 0 ? (
                                    tiposPaginados.map((tipo) => (
                                        <FilaTipoAusencia 
                                            key={tipo.id_tipo}
                                            tipo={tipo}
                                            onActualizar={manejarActualizar}
                                            onEliminar={manejarEliminar}
                                            cargando={cargando}
                                        />
                                    ))
                                ) : (
                                    <TablaVacia mensaje="Sin tipos configurados." columnas={3} />
                                )}
                            </CuerpoTabla>
                        </Tabla>
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

// componente fila editable para tipo de ausencia
function FilaTipoAusencia({ tipo, onActualizar, onEliminar, cargando }) {
    const [nombre, setNombre] = useState(tipo.nombre || '');
    const [remunerado, setRemunerado] = useState(!!tipo.remunerado);

    const manejarGuardar = () => {
        onActualizar(tipo.id_tipo, { nombre, remunerado });
    };

    return (
        <FilaTabla>
            <CeldaTabla>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded bg-white text-black border border-slate-700"
                    required
                />
            </CeldaTabla>
            <CeldaTabla>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={remunerado}
                        onChange={(e) => setRemunerado(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-rose-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
            </CeldaTabla>
            <CeldaTabla className="text-right">
                <div className="flex justify-end gap-2">
                    <Boton
                        tamano="pequeno"
                        variante="contornoPrimario"
                        onClick={manejarGuardar}
                        deshabilitado={cargando}
                    >
                        Guardar
                    </Boton>
                    <Boton
                        tamano="pequeno"
                        variante="contorno"
                        onClick={() => onEliminar(tipo.id_tipo)}
                        deshabilitado={cargando}
                    >
                        Eliminar
                    </Boton>
                </div>
            </CeldaTabla>
        </FilaTabla>
    );
}
