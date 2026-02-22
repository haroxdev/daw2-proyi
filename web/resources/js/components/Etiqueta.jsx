/**
 * componente badge/etiqueta
 * muestra texto con diferentes colores según el estado
 */
import React from 'react';

export default function Etiqueta({ texto, variante = 'gris', className = '' }) {
    const variantes = {
        gris: 'bg-gray-100 text-gray-700',
        primario: 'bg-red-100 text-red-700',
        exito: 'bg-green-100 text-green-700',
        advertencia: 'bg-yellow-100 text-yellow-700',
        peligro: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700'
    };

    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${variantes[variante]} ${className}`}>
            {texto}
        </span>
    );
}

// mapea estados comunes a variantes de color
export function etiquetaEstado(estado) {
    const mapeo = {
        // estados generales
        pendiente: { variante: 'advertencia', texto: 'Pendiente' },
        aprobada: { variante: 'exito', texto: 'Aprobada' },
        aprobado: { variante: 'exito', texto: 'Aprobado' },
        rechazada: { variante: 'peligro', texto: 'Rechazada' },
        rechazado: { variante: 'peligro', texto: 'Rechazado' },
        
        // estados de empleado
        alta: { variante: 'exito', texto: 'Alta' },
        baja: { variante: 'peligro', texto: 'Baja' },
        baja_temporal: { variante: 'advertencia', texto: 'Baja temporal' },
        
        // estados de proyecto
        activo: { variante: 'exito', texto: 'Activo' },
        en_pausa: { variante: 'advertencia', texto: 'En pausa' },
        finalizado: { variante: 'gris', texto: 'Finalizado' },
        
        // estados de tarea
        en_proceso: { variante: 'info', texto: 'En proceso' },
        finalizada: { variante: 'exito', texto: 'Finalizada' },
        
        // estados de timesheet
        borrador: { variante: 'gris', texto: 'Borrador' },
        enviado: { variante: 'info', texto: 'Enviado' },
        
        // prioridades (usando prefijo para evitar duplicados)
        prioridad_baja: { variante: 'gris', texto: 'Baja' },
        prioridad_media: { variante: 'advertencia', texto: 'Media' },
        prioridad_alta: { variante: 'peligro', texto: 'Alta' }
    };

    // maneja prioridades especiales
    const estadoNormalizado = estado?.toLowerCase();
    let config = mapeo[estadoNormalizado];
    
    // si no encuentra, busca con prefijo prioridad_
    if (!config && ['baja', 'media', 'alta'].includes(estadoNormalizado)) {
        config = mapeo[`prioridad_${estadoNormalizado}`];
    }
    
    config = config || { variante: 'gris', texto: estado || '—' };
    return <Etiqueta {...config} />;
}
