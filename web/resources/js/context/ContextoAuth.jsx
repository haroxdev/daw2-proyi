/**
 * contexto global de autenticación
 * proporciona usuario actual y funciones de auth a toda la app
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ContextoAuth = createContext(null);

export function ProveedorAuth({ children, usuarioInicial = null }) {
    const [usuario, setUsuario] = useState(usuarioInicial);
    const [cargando, setCargando] = useState(!usuarioInicial);

    // verificar si hay datos del usuario en el html (inyectados por blade)
    useEffect(() => {
        const datosUsuario = window.__USUARIO_INICIAL__;
        if (datosUsuario) {
            setUsuario(datosUsuario);
            setCargando(false);
        } else if (!usuarioInicial) {
            setCargando(false);
        }
    }, [usuarioInicial]);

    // verifica si el usuario tiene alguno de los roles especificados
    const tieneRol = (roles) => {
        if (!usuario?.roles) return false;
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return usuario.roles.some(r => rolesArray.includes(r.nombre));
    };

    // verifica si es admin o responsable
    const esAdminOResponsable = () => tieneRol(['admin', 'responsable']);

    // verifica si es admin exclusivamente
    const esAdmin = () => tieneRol(['admin']);

    const valor = {
        usuario,
        setUsuario,
        cargando,
        tieneRol,
        esAdminOResponsable,
        esAdmin,
        autenticado: !!usuario
    };

    return (
        <ContextoAuth.Provider value={valor}>
            {children}
        </ContextoAuth.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(ContextoAuth);
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de ProveedorAuth');
    }
    return contexto;
}

export default ContextoAuth;
