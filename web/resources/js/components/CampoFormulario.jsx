/**
 * componente input de formulario
 * soporta diferentes tipos y estados
 */
import React from 'react';

export default function CampoFormulario({
    etiqueta,
    nombre,
    tipo = 'text',
    valor,
    onChange,
    placeholder = '',
    requerido = false,
    deshabilitado = false,
    error = '',
    ayuda = '',
    opciones = [], // para select
    filas = 3, // para textarea
    className = '',
    ...props
}) {
    // estilos comunes para inputs
    const estilosInput = `
        w-full px-3 py-2 rounded-md
        bg-white border border-gray-300
        text-gray-900 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors duration-150
        ${error ? 'border-red-500 focus:ring-red-500' : ''}
    `;

    // renderiza el input según el tipo
    const renderizarCampo = () => {
        if (tipo === 'select') {
            return (
                <select
                    name={nombre}
                    value={valor}
                    onChange={onChange}
                    required={requerido}
                    disabled={deshabilitado}
                    className={estilosInput}
                    {...props}
                >
                    {opciones.map((opcion, index) => (
                        <option 
                            key={opcion.valor ?? index} 
                            value={opcion.valor ?? ''}
                            disabled={opcion.deshabilitado}
                        >
                            {opcion.texto}
                        </option>
                    ))}
                </select>
            );
        }

        if (tipo === 'textarea') {
            return (
                <textarea
                    name={nombre}
                    value={valor}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={requerido}
                    disabled={deshabilitado}
                    rows={filas}
                    className={estilosInput}
                    {...props}
                />
            );
        }

        if (tipo === 'checkbox') {
            return (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name={nombre}
                        checked={valor}
                        onChange={onChange}
                        disabled={deshabilitado}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        {...props}
                    />
                    {etiqueta && <span className="text-gray-700">{etiqueta}</span>}
                </div>
            );
        }

        return (
            <input
                type={tipo}
                name={nombre}
                value={valor}
                onChange={onChange}
                placeholder={placeholder}
                required={requerido}
                disabled={deshabilitado}
                className={estilosInput}
                {...props}
            />
        );
    };

    // si es checkbox, no usar wrapper con etiqueta arriba
    if (tipo === 'checkbox') {
        return (
            <div className={`${className}`}>
                {renderizarCampo()}
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {ayuda && !error && <p className="mt-1 text-sm text-gray-500">{ayuda}</p>}
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {etiqueta && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {etiqueta}
                    {requerido && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            {renderizarCampo()}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {ayuda && !error && <p className="mt-1 text-sm text-gray-500">{ayuda}</p>}
        </div>
    );
}
