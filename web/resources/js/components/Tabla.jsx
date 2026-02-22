/**
 * componente tabla reutilizable
 * muestra datos en formato tabla con estilo
 */
import React from 'react';

export function Tabla({ children, className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    );
}

export function EncabezadoTabla({ children }) {
    return (
        <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{children}</tr>
        </thead>
    );
}

export function CeldaEncabezado({ children, className = '' }) {
    return (
        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 ${className}`}>
            {children}
        </th>
    );
}

export function CuerpoTabla({ children }) {
    return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>;
}

export function FilaTabla({ children, onClick, className = '' }) {
    return (
        <tr 
            onClick={onClick}
            className={`hover:bg-red-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </tr>
    );
}

export function CeldaTabla({ children, className = '' }) {
    return (
        <td className={`px-4 py-3 text-gray-700 ${className}`}>
            {children}
        </td>
    );
}

// componente para tabla vacía
export function TablaVacia({ mensaje = 'Sin datos disponibles', columnas = 1 }) {
    return (
        <tr>
            <td colSpan={columnas} className="px-4 py-8 text-center text-gray-500">
                {mensaje}
            </td>
        </tr>
    );
}
