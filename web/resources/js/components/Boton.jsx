/**
 * componente botón reutilizable
 * soporta diferentes variantes y estados
 */
import React from 'react';

export default function Boton({ 
    children, 
    tipo = 'button',
    variante = 'primario', 
    tamano = 'normal',
    deshabilitado = false,
    cargando = false,
    className = '',
    onClick,
    ...props 
}) {
    // estilos base
    const estilosBase = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // variantes de color
    const variantes = {
        primario: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        secundario: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
        exito: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        peligro: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        advertencia: 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-500',
        contorno: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
        contornoPrimario: 'border border-red-600 text-red-600 bg-white hover:bg-red-50 focus:ring-red-500',
        fantasma: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };

    // tamaños
    const tamanos = {
        pequeno: 'px-3 py-1.5 text-sm',
        normal: 'px-4 py-2',
        grande: 'px-6 py-3 text-lg'
    };

    const clases = `${estilosBase} ${variantes[variante]} ${tamanos[tamano]} ${className}`;

    return (
        <button
            type={tipo}
            disabled={deshabilitado || cargando}
            className={clases}
            onClick={onClick}
            {...props}
        >
            {cargando && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
