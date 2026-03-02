/**
 * página de equipo (admin)
 * permite crear, editar y gestionar empleados
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Tabla, EncabezadoTabla, CeldaEncabezado, CuerpoTabla, FilaTabla, CeldaTabla, TablaVacia, Alerta, Modal, etiquetaEstado, Paginador, usePaginacion } from '../components';
import { empleados, datosPagina } from '../services/api';
import { useAuth } from '../context/ContextoAuth';

// estado inicial del formulario de creación
const formularioVacio = {
    dni: '', nombre: '', apellido1: '', apellido2: '', email: '',
    contrasena: '', id_departamento: '', estado: 'alta',
    dias_vacaciones_restantes: 22, roles: []
};

export default function PaginaEquipo() {
    const [listaEmpleados, setListaEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formulario, setFormulario] = useState({ ...formularioVacio });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    const [empleadoEditando, setEmpleadoEditando] = useState(null);
    const [formEditar, setFormEditar] = useState({});

    const { esAdmin } = useAuth();

    // responsable no puede editar usuarios con rol admin o responsable
    const puedeEditar = (emp) => {
        if (esAdmin()) return true;
        const rolesProtegidos = ['admin', 'responsable'];
        return !emp.roles?.some(r => rolesProtegidos.includes(r.nombre));
    };

    // paginación
    const { itemsPaginados: empleadosPaginados, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(listaEmpleados, 5);

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

    useEffect(() => { cargarDatos(); }, []);

    // maneja cambios en el formulario de creación
    const manejarCambio = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'roles') {
            const idRol = parseInt(value);
            setFormulario(prev => ({
                ...prev,
                roles: checked
                    ? [...prev.roles, idRol]
                    : prev.roles.filter(r => r !== idRol)
            }));
            return;
        }
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // maneja cambios en el formulario de edición
    const manejarCambioEditar = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'roles') {
            const idRol = parseInt(value);
            setFormEditar(prev => ({
                ...prev,
                roles: checked
                    ? [...prev.roles, idRol]
                    : prev.roles.filter(r => r !== idRol)
            }));
            return;
        }
        setFormEditar(prev => ({ ...prev, [name]: value }));
    };

    // crea un nuevo empleado
    const manejarCrear = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await empleados.crear(formulario);
            setMensaje({ tipo: 'exito', texto: 'Empleado creado correctamente' });
            setFormulario({ ...formularioVacio });
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al crear empleado' });
        } finally {
            setCargando(false);
        }
    };

    // abre el modal de edición con los datos del empleado
    const abrirEditar = (emp) => {
        setEmpleadoEditando(emp);
        setFormEditar({
            dni: emp.dni || '',
            nombre: emp.nombre || '',
            apellido1: emp.apellido1 || '',
            apellido2: emp.apellido2 || '',
            email: emp.email || '',
            contrasena: '',
            id_departamento: emp.id_departamento || '',
            estado: emp.estado || 'alta',
            dias_vacaciones_restantes: emp.dias_vacaciones_restantes ?? 22,
            roles: emp.roles?.map(r => r.id_rol) || [],
        });
        setModalEditar(true);
    };

    // guarda cambios del empleado editado
    const manejarGuardarEdicion = async (e) => {
        e.preventDefault();
        if (!empleadoEditando) return;

        setCargando(true);
        setMensaje(null);
        try {
            await empleados.actualizar(empleadoEditando.id_empleado, formEditar);
            setMensaje({ tipo: 'exito', texto: 'Empleado actualizado correctamente' });
            setModalEditar(false);
            setEmpleadoEditando(null);
            await cargarDatos();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al actualizar empleado' });
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                            <div className="flex flex-wrap gap-3">
                                {roles.map(rol => (
                                    <label key={rol.id_rol} className="flex items-center gap-2 text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="roles"
                                            value={rol.id_rol}
                                            checked={formulario.roles.includes(rol.id_rol)}
                                            onChange={manejarCambio}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
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
                                <CeldaEncabezado>Acciones</CeldaEncabezado>
                            </EncabezadoTabla>
                            <CuerpoTabla>
                                {empleadosPaginados.length > 0 ? (
                                    empleadosPaginados.map((emp) => (
                                        <FilaTabla key={emp.id_empleado}>
                                            <CeldaTabla>
                                                <div className="font-semibold">{emp.nombre}</div>
                                                <div className="text-xs text-gray-500">
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
                                                        <span key={r.id_rol} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                                            {r.nombre}
                                                        </span>
                                                    )) || '—'}
                                                </div>
                                            </CeldaTabla>
                                            <CeldaTabla>
                                                {puedeEditar(emp) && (
                                                    <Boton
                                                        tamano="pequeno"
                                                        variante="contornoPrimario"
                                                        onClick={() => abrirEditar(emp)}
                                                    >
                                                        Editar
                                                    </Boton>
                                                )}
                                            </CeldaTabla>
                                        </FilaTabla>
                                    ))
                                ) : (
                                    <TablaVacia mensaje="No hay empleados." columnas={6} />
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

            {/* modal de edición de empleado */}
            <Modal
                abierto={modalEditar}
                onCerrar={() => { setModalEditar(false); setEmpleadoEditando(null); }}
                titulo={`Editar: ${empleadoEditando?.nombre || ''} ${empleadoEditando?.apellido1 || ''}`}
                anchura="grande"
            >
                {empleadoEditando && (
                    <form onSubmit={manejarGuardarEdicion} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <CampoFormulario
                                etiqueta="DNI"
                                tipo="text"
                                nombre="dni"
                                valor={formEditar.dni}
                                onChange={manejarCambioEditar}
                                requerido
                            />
                            <CampoFormulario
                                etiqueta="Email"
                                tipo="email"
                                nombre="email"
                                valor={formEditar.email}
                                onChange={manejarCambioEditar}
                                requerido
                            />
                        </div>
                        <CampoFormulario
                            etiqueta="Nombre"
                            tipo="text"
                            nombre="nombre"
                            valor={formEditar.nombre}
                            onChange={manejarCambioEditar}
                            requerido
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CampoFormulario
                                etiqueta="Apellido 1"
                                tipo="text"
                                nombre="apellido1"
                                valor={formEditar.apellido1}
                                onChange={manejarCambioEditar}
                                requerido
                            />
                            <CampoFormulario
                                etiqueta="Apellido 2"
                                tipo="text"
                                nombre="apellido2"
                                valor={formEditar.apellido2}
                                onChange={manejarCambioEditar}
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <CampoFormulario
                                etiqueta="Nueva contraseña"
                                tipo="password"
                                nombre="contrasena"
                                valor={formEditar.contrasena}
                                onChange={manejarCambioEditar}
                                placeholder="Dejar vacío para no cambiar"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 8 caracteres. Solo se cambia si se rellena.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <CampoFormulario
                                etiqueta="Departamento"
                                tipo="select"
                                nombre="id_departamento"
                                valor={formEditar.id_departamento}
                                onChange={manejarCambioEditar}
                                opciones={opcionesDepartamento}
                            />
                            <CampoFormulario
                                etiqueta="Estado"
                                tipo="select"
                                nombre="estado"
                                valor={formEditar.estado}
                                onChange={manejarCambioEditar}
                                opciones={opcionesEstado}
                            />
                            <CampoFormulario
                                etiqueta="Vacaciones"
                                tipo="number"
                                nombre="dias_vacaciones_restantes"
                                valor={formEditar.dias_vacaciones_restantes}
                                onChange={manejarCambioEditar}
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                            <div className="flex flex-wrap gap-3">
                                {roles.map(rol => (
                                    <label key={rol.id_rol} className="flex items-center gap-2 text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="roles"
                                            value={rol.id_rol}
                                            checked={formEditar.roles?.includes(rol.id_rol)}
                                            onChange={manejarCambioEditar}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                        />
                                        {rol.nombre}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Boton
                                variante="contorno"
                                onClick={() => { setModalEditar(false); setEmpleadoEditando(null); }}
                            >
                                Cancelar
                            </Boton>
                            <Boton tipo="submit" cargando={cargando}>
                                Guardar cambios
                            </Boton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
