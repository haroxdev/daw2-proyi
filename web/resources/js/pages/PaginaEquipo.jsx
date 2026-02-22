/**
 * página de equipo (admin)
 * permite crear y gestionar empleados
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { empleados, datosPagina } from '../services/api';

export default function PaginaEquipo() {
    // estado local
    const [listaEmpleados, setListaEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formulario, setFormulario] = useState({
        dni: '',
        nombre: '',
        apellido1: '',
        apellido2: '',
        email: '',
        contrasena: '',
        id_departamento: '',
        estado: 'alta',
        dias_vacaciones_restantes: 22,
        roles: []
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // paginación
    const { itemsPaginados: empleadosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaEmpleados, 5);

    // carga datos desde API
    const cargarDatos = async () => {
        try {
            const res = await datosPagina.equipo();
            setListaEmpleados(res.data.empleados || []);
            setDepartamentos(res.data.departamentos || []);
            setRoles(res.data.roles || []);
        } catch (e) {
            console.error('error cargando equipo:', e);
        }
    };

    // cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'roles') {
            const idRol = parseInt(value);
            setFormulario(prev => ({
                ...prev,
                roles: checked 
                    ? [...prev.roles, idRol]
                    : prev.roles.filter(r => r !== idRol)
            }));
        } else {
            setFormulario(prev => ({ ...prev, [name]: value }));
        }
    };

    // crea un nuevo empleado
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await empleados.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Empleado creado correctamente' });
            setFormulario({
                dni: '', nombre: '', apellido1: '', apellido2: '', email: '',
                contrasena: '', id_departamento: '', estado: 'alta',
                dias_vacaciones_restantes: 22, roles: []
            });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear empleado' });
        } finally {
            setCargando(false);
        }
    };

    // actualiza un empleado
    const manejarActualizar = async (idEmpleado, datos) => {
        setCargando(true);
        try {
            await empleados.actualizar(idEmpleado, datos);
            setMensaje({ tipo: 'exito', texto: 'Empleado actualizado' });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar empleado' });
        } finally {
            setCargando(false);
        }
    };

    // opciones para selects
    const opcionesDepartamento = [
        { valor: '', texto: 'Sin departamento' },
        ...departamentos.map(d => ({ valor: d.id_departamento, texto: d.nombre }))
    ];

    const opcionesEstado = [
        { valor: 'alta', texto: 'Alta' },
        { valor: 'baja', texto: 'Baja' },
        { valor: 'baja_temporal', texto: 'Baja temporal' }
    ];

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
                <Tarjeta titulo="Crear empleado">
                    <form onSubmit={manejarCrear} className="space-y-3">
                        <CampoFormulario
                            etiqueta="DNI"
                            tipo="text"
                            nombre="dni"
                            valor={formulario.dni}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Nombre"
                            tipo="text"
                            nombre="nombre"
                            valor={formulario.nombre}
                            onChange={manejarCambio}
                            requerido
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <CampoFormulario
                                etiqueta="Apellido 1"
                                tipo="text"
                                nombre="apellido1"
                                valor={formulario.apellido1}
                                onChange={manejarCambio}
                                requerido
                            />
                            <CampoFormulario
                                etiqueta="Apellido 2"
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
                        <CampoFormulario
                            etiqueta="Contraseña"
                            tipo="password"
                            nombre="contrasena"
                            valor={formulario.contrasena}
                            onChange={manejarCambio}
                            requerido
                        />
                        <CampoFormulario
                            etiqueta="Departamento"
                            tipo="select"
                            nombre="id_departamento"
                            valor={formulario.id_departamento}
                            onChange={manejarCambio}
                            opciones={opcionesDepartamento}
                        />
                        <CampoFormulario
                            etiqueta="Estado"
                            tipo="select"
                            nombre="estado"
                            valor={formulario.estado}
                            onChange={manejarCambio}
                            opciones={opcionesEstado}
                        />
                        <CampoFormulario
                            etiqueta="Vacaciones restantes"
                            tipo="number"
                            nombre="dias_vacaciones_restantes"
                            valor={formulario.dias_vacaciones_restantes}
                            onChange={manejarCambio}
                            min="0"
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Roles</label>
                            <div className="flex flex-wrap gap-3">
                                {roles.map(rol => (
                                    <label key={rol.id_rol} className="flex items-center gap-2 text-slate-300">
                                        <input
                                            type="checkbox"
                                            name="roles"
                                            value={rol.id_rol}
                                            checked={formulario.roles.includes(rol.id_rol)}
                                            onChange={manejarCambio}
                                            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-rose-500"
                                        />
                                        {rol.nombre}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Boton tipo="submit" cargando={cargando} className="w-full">
                            Crear
                        </Boton>
                    </form>
                </Tarjeta>

                {/* listado de empleados */}
                <div className="lg:col-span-2">
                    <Tarjeta titulo="Empleados">
                        <Tabla>
                            <EncabezadoTabla>
                                <CeldaEncabezado>Nombre</CeldaEncabezado>
                                <CeldaEncabezado>Email</CeldaEncabezado>
                                <CeldaEncabezado>Departamento</CeldaEncabezado>
                                <CeldaEncabezado>Estado</CeldaEncabezado>
                                <CeldaEncabezado>Roles</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {empleadosPaginados.length > 0 ? (
                                    empleadosPaginados.map((emp) => (
                                        <FilaTabla key={emp.id_empleado}>
                                            <CeldaTabla>
                                                <div className="font-semibold">{emp.nombre}</div>
                                                <div className="text-xs text-slate-500">
                                                    {emp.apellido1} {emp.apellido2}
                                                </div>
                                            </CeldaTabla>
                                            <CeldaTabla>{emp.email}</CeldaTabla>
                                            <CeldaTabla>
                                                {departamentos.find(d => d.id_departamento === emp.id_departamento)?.nombre || '—'}
                                            </CeldaTabla>
                                            <CeldaTabla>{etiquetaEstado(emp.estado)}</CeldaTabla>
                                            <CeldaTabla>
                                                <div className="flex flex-wrap gap-1">
                                                    {emp.roles?.map(r => (
                                                        <span key={r.id_rol} className="px-2 py-0.5 text-xs bg-alert rounded">
                                                            {r.nombre}
                                                        </span>
                                                    )) || '—'}
                                                </div>
                                            </CeldaTabla>
                                        </FilaTabla>
                                    ))
                                ) : (
                                    <TablaVacia mensaje="No hay empleados." columnas={5} />
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
