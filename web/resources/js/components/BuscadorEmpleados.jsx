// buscador dinámico de empleados con autocompletado
import React, { useState, useRef, useEffect } from 'react';
import { obtenerIniciales } from '../utils';

// normaliza texto para búsqueda sin acentos
const normalizar = (texto) =>
    (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// construye nombre completo desde campos del empleado
const nombreCompleto = (emp) =>
    [emp.nombre, emp.apellido1, emp.apellido2].filter(Boolean).join(' ');

// filtra empleados por nombre, apellido o email
const filtrarEmpleados = (empleados, termino) => {
    if (!termino.trim()) return empleados;
    const busqueda = normalizar(termino);
    return empleados.filter(emp => {
        const completo = normalizar(nombreCompleto(emp));
        const email = normalizar(emp.email);
        return completo.includes(busqueda) || email.includes(busqueda);
    });
};

/**
 * buscador de empleados con dos modos:
 * - multiple=false → selección única, llama onSeleccionar(empleado)
 * - multiple=true  → checkboxes, llama onCambio(idsSeleccionados)
 */
export default function BuscadorEmpleados({
    empleados = [],
    seleccionados = [],
    onSeleccionar,
    onCambio,
    multiple = false,
    placeholder = 'Buscar por nombre o email...',
    maxResultados = 50,
    className = '',
}) {
    const [busqueda, setBusqueda] = useState('');
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);

    // cierra dropdown al hacer clic fuera
    useEffect(() => {
        const manejarClicFuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', manejarClicFuera);
        return () => document.removeEventListener('mousedown', manejarClicFuera);
    }, []);

    const resultados = filtrarEmpleados(empleados, busqueda).slice(0, maxResultados);

    // selección única
    const seleccionar = (emp) => {
        onSeleccionar?.(emp);
        setBusqueda('');
        setAbierto(false);
    };

    // toggle en modo múltiple
    const toggleEmpleado = (idEmpleado) => {
        if (!onCambio) return;
        const nuevos = seleccionados.includes(idEmpleado)
            ? seleccionados.filter(id => id !== idEmpleado)
            : [...seleccionados, idEmpleado];
        onCambio(nuevos);
    };

    // modo múltiple con checkboxes y buscador integrado
    if (multiple) {
        return (
            <div className={`space-y-2 ${className}`}>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
                    {resultados.length > 0 ? resultados.map(emp => (
                        <label
                            key={emp.id_empleado}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={seleccionados.includes(emp.id_empleado)}
                                onChange={() => toggleEmpleado(emp.id_empleado)}
                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-medium text-red-700">
                                    {obtenerIniciales(emp.nombre)}
                                </span>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-900 truncate">{nombreCompleto(emp)}</p>
                                <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                            </div>
                        </label>
                    )) : (
                        <p className="text-xs text-gray-400 text-center py-3">Sin resultados</p>
                    )}
                </div>

                {seleccionados.length > 0 && (
                    <p className="text-xs text-gray-500">
                        {seleccionados.length} seleccionado{seleccionados.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        );
    }

    // modo selección única con dropdown
    return (
        <div ref={contenedorRef} className={`relative ${className}`}>
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setAbierto(true); }}
                    onFocus={() => setAbierto(true)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
            </div>

            {abierto && resultados.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    {resultados.map(emp => (
                        <li
                            key={emp.id_empleado}
                            onClick={() => seleccionar(emp)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 cursor-pointer transition-colors"
                        >
                            <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-medium text-red-700">
                                    {obtenerIniciales(emp.nombre)}
                                </span>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-900 truncate">{nombreCompleto(emp)}</p>
                                <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {abierto && busqueda.trim() && resultados.length === 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="text-xs text-gray-400 text-center">Sin resultados para "{busqueda}"</p>
                </div>
            )}
        </div>
    );
}

// exportar helper para reutilizar en otros sitios
export { nombreCompleto };
