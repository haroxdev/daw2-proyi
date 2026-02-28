// utilidades de formato de fechas, horas y cálculos temporales

// convierte fecha/string a Date de forma segura
const parsearFecha = (fecha) => {
    if (!fecha) return null;
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return isNaN(d.getTime()) ? null : d;
};

// formatea hora HH:MM (sin segundos)
export const formatearHora = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '--:--';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// formatea hora HH:MM:SS (con segundos, para relojes en tiempo real)
export const formatearHoraConSegundos = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '--:--:--';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// formatea fecha estándar dd/mm/yyyy
export const formatearFecha = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '—';
    return d.toLocaleDateString('es-ES');
};

// formatea fecha compacta dd/mm HH:mm (para chat y listados)
export const formatearFechaHora = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '';
    // evita reformatear valores ya formateados
    if (typeof fecha === 'string' && /^\d{2}\/\d{2}\s\d{2}:\d{2}$/.test(fecha)) return fecha;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// formatea fecha corta "Lun 05/02"
export const formatearFechaCorta = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '--';
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${dias[d.getDay()]} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

// formatea fecha larga "lunes, 5 de febrero de 2026"
export const formatearFechaLarga = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '';
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// formatea fecha con mes abreviado "05 feb 2026"
export const formatearFechaMesCorto = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '—';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

// formatea fecha relativa (hoy→hora, ayer, hace Xd, fecha corta)
export const formatearFechaRelativa = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '';
    const hoy = new Date();
    const diff = Math.floor((hoy - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `hace ${diff}d`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// convierte Date a string ISO "YYYY-MM-DD" (para inputs y api)
export const formatearFechaISO = (fecha) => {
    const d = parsearFecha(fecha);
    if (!d) return '';
    const a = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${a}-${m}-${dia}`;
};

// formatea duración decimal en horas a "Xh Ymin"
export const formatearDuracion = (horas) => {
    if (!horas || horas <= 0) return '0h';
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
};

// calcula horas entre dos fechas ISO
export const calcularHoras = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const diff = new Date(fin) - new Date(inicio);
    return Math.round((diff / 3600000) * 100) / 100;
};

// calcula tiempo trabajado neto descontando pausas
export const calcularTiempoTrabajado = (entrada, salida, pausas = []) => {
    if (!entrada || !salida) return '--:--';
    const inicio = new Date(entrada);
    const fin = new Date(salida);
    let diff = (fin - inicio) / 1000 / 60;

    if (Array.isArray(pausas)) {
        pausas.forEach(p => {
            if (p.inicio && p.fin) {
                diff -= (new Date(p.fin) - new Date(p.inicio)) / 1000 / 60;
            }
        });
    }

    if (diff < 0) diff = 0;
    const horas = Math.floor(diff / 60);
    const minutos = Math.floor(diff % 60);
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
};

// suma total de horas de un array de periodos {inicio, fin}
export const calcularHorasTotales = (tiempos = []) => {
    return tiempos.reduce((acc, t) => {
        if (!t.inicio || !t.fin) return acc;
        const diff = (new Date(t.fin) - new Date(t.inicio)) / 3600000;
        return acc + diff;
    }, 0);
};

// extrae las iniciales de un nombre o email
export const obtenerIniciales = (nombre, email = '') => {
    const texto = nombre || email || 'U';
    return texto.slice(0, 2).toUpperCase();
};
