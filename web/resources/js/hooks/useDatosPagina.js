// hook genérico para cargar datos de página desde la api
import { useState, useEffect, useCallback } from 'react';

/**
 * encapsula el patrón repetido de carga de datos en cada página:
 * - estado de datos, cargando y error
 * - carga inicial con useEffect
 * - función recargar para refrescar tras mutaciones
 *
 * @param {Function} obtenerDatos - función async que retorna {data: ...}
 * @param {*} valorInicial - valor por defecto antes de la primera carga
 * @returns {{ datos, cargando, error, recargar }}
 */
export default function useDatosPagina(obtenerDatos, valorInicial = null) {
    const [datos, setDatos] = useState(valorInicial);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const res = await obtenerDatos();
            setDatos(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Error al cargar datos');
            console.error('error cargando datos de página:', e);
        } finally {
            setCargando(false);
        }
    }, [obtenerDatos]);

    // carga inicial
    useEffect(() => {
        cargar();
    }, [cargar]);

    return { datos, cargando, error, recargar: cargar };
}
