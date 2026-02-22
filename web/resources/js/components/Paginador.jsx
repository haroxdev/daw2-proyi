/**
 * componente paginador reutilizable
 * paginación client-side con páginas de tamaño configurable
 */
import React from 'react';

// hook para paginar un array en cliente
export function usePaginacion(items, porPagina = 5) {
    const [paginaActual, setPaginaActual] = React.useState(1);

    // resetea a página 1 cuando cambian los items
    React.useEffect(() => {
        setPaginaActual(1);
    }, [items.length]);

    const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const inicio = (paginaSegura - 1) * porPagina;
    const itemsPaginados = items.slice(inicio, inicio + porPagina);

    return {
        itemsPaginados,
        paginaActual: paginaSegura,
        totalPaginas,
        setPaginaActual,
        totalItems: items.length,
    };
}

// componente visual del paginador
export default function Paginador({ paginaActual, totalPaginas, onCambiarPagina }) {
    if (totalPaginas <= 1) return null;

    // genera rango visible de páginas (máximo 5 botones numéricos)
    const generarRango = () => {
        const rango = [];
        let inicio = Math.max(1, paginaActual - 2);
        let fin = Math.min(totalPaginas, inicio + 4);
        inicio = Math.max(1, fin - 4);

        for (let i = inicio; i <= fin; i++) {
            rango.push(i);
        }
        return rango;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 pt-4">
            <button
                onClick={() => onCambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                ← Anterior
            </button>

            {generarRango().map(num => (
                <button
                    key={num}
                    onClick={() => onCambiarPagina(num)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        num === paginaActual
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {num}
                </button>
            ))}

            <button
                onClick={() => onCambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Siguiente →
            </button>
        </div>
    );
}
