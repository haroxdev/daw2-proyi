/**
 * página de departamentos (admin)
 * permite crear y gestionar departamentos
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Paginador, usePaginacion } from '../components';
import { departamentos, datosPagina } from '../services/api';

export default function PaginaDepartamentos() {
    // estado local
    const [listaDepartamentos, setListaDepartamentos] = useState([]);
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: departamentosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaDepartamentos, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.departamentos();
            setListaDepartamentos(res.data.departamentos || []);
        } catch (e) {
            console.error('error cargando departamentos:', e);
        }
    };

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // crea un nuevo departamento
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await departamentos.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Departamento creado correctamente' });
            setFormulario({ nombre: '', descripcion: '' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear departamento' });
        } finally {
            setCargando(false);
        }
    };

    // actualiza un departamento
    const manejarActualizar = async (idDepartamento, datos) => {
        setCargando(true);
        try {
            await departamentos.actualizar(idDepartamento, datos);
            setMensaje({ tipo: 'exito', texto: 'Departamento actualizado' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar departamento' });
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
                <Tarjeta titulo="Nuevo departamento" className="h-fit">
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
                            etiqueta="Descripción"
                            tipo="textarea"
                            nombre="descripcion"
                            valor={formulario.descripcion}
                            onChange={manejarCambio}
                            filas={3}
                        />
                        <Boton tipo="submit" cargando={cargando} className="w-full">
                            Crear
                        </Boton>
                    </form>
                </Tarjeta>

                {/* listado de departamentos */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Departamentos">
                        <Tabla>
                            <EncabezadoTabla>
                                <CeldaEncabezado>Nombre</CeldaEncabezado>
                                <CeldaEncabezado>Descripción</CeldaEncabezado>
                                <CeldaEncabezado>Acciones</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {departamentosPaginados.length > 0 ? (
                                    departamentosPaginados.map((dept) => (
                                        <FilaDepartamento 
                                            key={dept.id_departamento}
                                            departamento={dept}
                                            onActualizar={manejarActualizar}
                                            cargando={cargando}
                                        />
                                    ))
                                ) : (
                                    <TablaVacia mensaje="Sin departamentos." columnas={3} />
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

// componente fila editable para departamento
function FilaDepartamento({ departamento, onActualizar, cargando }) {
    const [nombre, setNombre] = useState(departamento.nombre || '');
    const [descripcion, setDescripcion] = useState(departamento.descripcion || '');

    const manejarGuardar = () => {
        onActualizar(departamento.id_departamento, { nombre, descripcion });
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
                <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded bg-white text-black border border-slate-700"
                />
            </CeldaTabla>
            <CeldaTabla>
                <Boton
                    tamano="pequeno"
                    variante="contornoPrimario"
                    onClick={manejarGuardar}
                    deshabilitado={cargando}
                >
                    Guardar
                </Boton>
            </CeldaTabla>
        </FilaTabla>
    );
}
