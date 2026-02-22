/**
 * componente modal/diálogo
 * muestra contenido superpuesto
 */
import React, { useEffect } from 'react';

export default function Modal({ 
    abierto, 
    onCerrar, 
    titulo, 
    children, 
    anchura = 'normal' 
}) {
    // cierra con escape
    useEffect(() => {
        const manejarEscape = (e) => {
            if (e.key === 'Escape' && abierto) {
                onCerrar();
            }
        };
        document.addEventListener('keydown', manejarEscape);
        return () => document.removeEventListener('keydown', manejarEscape);
    }, [abierto, onCerrar]);

    // bloquea scroll cuando está abierto
    useEffect(() => {
        if (abierto) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [abierto]);

    if (!abierto) return null;

    const anchuras = {
        pequeno: 'max-w-sm',
        normal: 'max-w-md',
        grande: 'max-w-lg',
        extragrande: 'max-w-2xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* fondo oscuro */}
            <div 
                className="absolute inset-0 bg-black/50"
                onClick={onCerrar}
            />
            
            {/* contenido del modal */}
            <div className={`relative w-full ${anchuras[anchura]} mx-4 bg-white border border-gray-200 rounded-lg shadow-xl`}>
                {/* cabecera */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                    <button 
                        onClick={onCerrar}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* cuerpo */}
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
