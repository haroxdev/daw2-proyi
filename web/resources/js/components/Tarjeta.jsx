/**
 * componente tarjeta reutilizable
 * muestra contenido en un contenedor con estilo
 */
import React from 'react';

export default function Tarjeta({ titulo, subtitulo, children, className = '' }) {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
            {(titulo || subtitulo) && (
                <div className="px-5 py-4 border-b border-gray-200">
                    {titulo && <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>}
                    {subtitulo && <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>}
                </div>
            )}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}
