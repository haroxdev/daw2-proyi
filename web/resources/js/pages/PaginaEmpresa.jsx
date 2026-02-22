/**
 * página de empresa (admin)
 * permite editar datos de la empresa
 */
import React, { useState, useEffect } from 'react';
import { Tarjeta, Boton, CampoFormulario, Alerta } from '../components';
import { empresa, datosPagina } from '../services/api';

export default function PaginaEmpresa() {
    // estado local
    const [formulario, setFormulario] = useState({
        nombre: '',
        cif: '',
        email_admin: ''
    });
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // carga datos iniciales desde API
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await datosPagina.empresa();
                if (res.data.empresa) {
                    const emp = res.data.empresa;
                    setFormulario({
                        nombre: emp.nombre || '',
                        cif: emp.cif || '',
                        email_admin: emp.email_admin || ''
                    });
                }
            } catch (e) {
                console.error('error cargando empresa:', e);
            }
        };
        cargar();
    }, []);

    // maneja cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    // guarda los cambios
    const manejarGuardar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);
        try {
            await empresa.actualizar(formulario);
            setMensaje({ tipo: 'exito', texto: 'Empresa actualizada correctamente' });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al guardar' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {mensaje && (
                <Alerta 
                    tipo={mensaje.tipo} 
                    mensaje={mensaje.texto} 
                    onCerrar={() => setMensaje(null)} 
                />
            )}

            <Tarjeta titulo="Datos de la empresa">
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
                        etiqueta="CIF"
                        tipo="text"
                        nombre="cif"
                        valor={formulario.cif}
                        onChange={manejarCambio}
                        requerido
                    />
                    <CampoFormulario
                        etiqueta="Email administración"
                        tipo="email"
                        nombre="email_admin"
                        valor={formulario.email_admin}
                        onChange={manejarCambio}
                        requerido
                    />
                    <Boton tipo="submit" cargando={cargando} className="w-full">
                        Guardar cambios
                    </Boton>
                </form>
            </Tarjeta>
        </div>
    );
}
