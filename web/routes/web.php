<?php

/**
 * rutas de la aplicación gestime
 *
 * arquitectura: las rutas GET de navegación sirven la SPA (spa.blade.php).
 * react router maneja el enrutamiento del lado del cliente.
 * los datos de cada página se obtienen exclusivamente por la api json
 * (/api/datos/*), eliminando la duplicación servidor-cliente.
 *
 * agrupación por dominio:
 *   1. públicas / guest — login, csrf, setup
 *   2. usuario autenticado — api de datos + acciones de escritura
 *   3. admin + responsable — gestión operativa
 *   4. admin exclusivo — configuración del sistema
 *   5. catch-all SPA — react router toma el control
 */

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Api\DatosPaginaController;
use App\Http\Controllers\AusenciasController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\EmpleadosController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\ExportacionController;
use App\Http\Controllers\FestivosController;
use App\Http\Controllers\FichajeController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\ProyectosController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\TareasController;
use App\Http\Controllers\TimesheetController;
use App\Http\Controllers\TipoAusenciaController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/panel');

// ──────────────────────────────────────────────────────────
// rutas públicas / guest
// ──────────────────────────────────────────────────────────
Route::get('/csrf-token', fn () => response()->json(['csrf_token' => csrf_token()]));

Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.update');

Route::get('/login', function () {
    if (\App\Models\Empleado::count() === 0) {
        return redirect('/setup');
    }
    return view('spa');
})->middleware('guest');

Route::middleware('setup')->group(function () {
    Route::get('/setup', [SetupController::class, 'show']);
    Route::post('/setup', [SetupController::class, 'store']);
});

// ──────────────────────────────────────────────────────────
// rutas de usuario autenticado
// ──────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {

    // --- api de lectura (datos para cada página) ---
    Route::prefix('api/datos')->group(function () {
        Route::get('/panel', [DatosPaginaController::class, 'panel']);
        Route::get('/fichaje', [DatosPaginaController::class, 'fichaje']);
        Route::get('/ausencias', [DatosPaginaController::class, 'ausencias']);
        Route::get('/timesheets', [DatosPaginaController::class, 'timesheets']);
        Route::get('/calendario', [DatosPaginaController::class, 'calendario']);
        Route::get('/notificaciones', [DatosPaginaController::class, 'notificaciones']);
        Route::get('/contadores', [DatosPaginaController::class, 'contadores']);
        Route::get('/perfil', [PerfilController::class, 'mostrar']);
    });

    // --- fichaje ---
    Route::post('/fichaje/entrada', [FichajeController::class, 'entrada']);
    Route::post('/fichaje/salida', [FichajeController::class, 'salida']);
    Route::post('/fichaje/{registro}/pausa/abrir', [FichajeController::class, 'abrirPausa']);
    Route::post('/fichaje/pausa/{pausa}/cerrar', [FichajeController::class, 'cerrarPausa']);
    Route::post('/fichaje/{registro}/correcciones', [FichajeController::class, 'solicitarCorreccion']);

    // --- ausencias ---
    Route::post('/ausencias', [AusenciasController::class, 'crear']);

    // --- timesheets ---
    Route::post('/timesheets', [TimesheetController::class, 'crear']);
    Route::post('/timesheets/{timesheet}/enviar', [TimesheetController::class, 'enviar']);

    // --- tareas (acciones de usuario) ---
    Route::post('/tareas', [TareasController::class, 'crear']);
    Route::post('/tareas/{tarea}/imputar', [TareasController::class, 'imputarTiempo']);
    Route::post('/tiempos/{tiempo}/cerrar', [TareasController::class, 'cerrarTimer']);

    // --- calendario ---
    Route::get('/calendario/mis-eventos', [CalendarioController::class, 'misEventos']);
    Route::get('/calendario/mis-ausencias', [CalendarioController::class, 'misAusencias']);
    Route::post('/calendario/eventos', [CalendarioController::class, 'crear']);

    // --- chat ---
    Route::get('/chat/datos', [ChatController::class, 'indexData']);
    Route::get('/chat/mensajes', [ChatController::class, 'mensajes']);
    Route::get('/chat/mensajes/{contactoId}', [ChatController::class, 'mensajesConContacto']);
    Route::post('/chat', [ChatController::class, 'enviar']);
    Route::post('/chat/seleccionar', [ChatController::class, 'seleccionar']);
    Route::post('/chat/nuevo', [ChatController::class, 'nuevo']);

    // --- notificaciones ---
    Route::post('/notificaciones/{notificacion}/leer', [NotificacionesController::class, 'marcarLeida']);
    Route::post('/notificaciones/leer-todas', [NotificacionesController::class, 'marcarTodas']);

    // --- perfil ---
    Route::put('/perfil', [PerfilController::class, 'actualizar']);
});

// ──────────────────────────────────────────────────────────
// rutas admin + responsable (gestión operativa)
// ──────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin,responsable'])->group(function () {

    // api de lectura
    Route::prefix('api/datos')->group(function () {
        Route::get('/proyectos', [DatosPaginaController::class, 'proyectos']);
        Route::get('/tareas', [DatosPaginaController::class, 'tareas']);
        Route::get('/equipo', [DatosPaginaController::class, 'equipo']);
        Route::get('/revisiones', [DatosPaginaController::class, 'revisiones']);
        Route::get('/reporting', [DatosPaginaController::class, 'reporting']);
    });

    // aprobaciones
    Route::post('/fichaje/correcciones/{correccion}/resolver', [FichajeController::class, 'resolverCorreccion']);
    Route::post('/ausencias/{solicitud}/resolver', [AusenciasController::class, 'resolver']);
    Route::post('/timesheets/{timesheet}/revisar', [TimesheetController::class, 'revisar']);

    // proyectos
    Route::post('/proyectos', [ProyectosController::class, 'crear']);
    Route::put('/proyectos/{proyecto}', [ProyectosController::class, 'actualizar']);
    Route::delete('/proyectos/{proyecto}', [ProyectosController::class, 'eliminar']);
    Route::post('/proyectos/{proyecto}/asignar', [ProyectosController::class, 'asignar']);
    Route::post('/proyectos/{proyecto}/desasignar', [ProyectosController::class, 'desasignar']);
    Route::post('/proyectos/{proyecto}/estado', [ProyectosController::class, 'estado']);

    // tareas (acciones admin)
    Route::post('/tareas/{tarea}/asignar', [TareasController::class, 'asignar']);
    Route::put('/tareas/{tarea}', [TareasController::class, 'actualizar']);
    Route::delete('/tareas/{tarea}', [TareasController::class, 'eliminar']);

    // equipo
    Route::post('/equipo', [EmpleadosController::class, 'crear']);
    Route::put('/equipo/{empleado}', [EmpleadosController::class, 'actualizar']);
    Route::delete('/equipo/{empleado}', [EmpleadosController::class, 'desactivar']);

    // exportación csv
    Route::get('/exportar/fichajes', [ExportacionController::class, 'fichajes']);
    Route::get('/exportar/proyectos', [ExportacionController::class, 'proyectos']);
    Route::get('/exportar/ausencias', [ExportacionController::class, 'ausencias']);
});

// ──────────────────────────────────────────────────────────
// rutas admin exclusivo (configuración del sistema)
// ──────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->group(function () {

    // api de lectura
    Route::prefix('api/datos')->group(function () {
        Route::get('/empresa', [DatosPaginaController::class, 'empresa']);
        Route::get('/departamentos', [DatosPaginaController::class, 'departamentos']);
        Route::get('/tipos-ausencia', [DatosPaginaController::class, 'tiposAusencia']);
        Route::get('/festivos', [DatosPaginaController::class, 'festivos']);
    });

    // empresa
    Route::post('/empresa', [EmpresaController::class, 'actualizar']);

    // departamentos
    Route::post('/departamentos', [DepartamentosController::class, 'crear']);
    Route::put('/departamentos/{departamento}', [DepartamentosController::class, 'actualizar']);
    Route::delete('/departamentos/{departamento}', [DepartamentosController::class, 'eliminar']);

    // tipos de ausencia
    Route::post('/tipos-ausencia', [TipoAusenciaController::class, 'crear']);
    Route::put('/tipos-ausencia/{tipoAusencium}', [TipoAusenciaController::class, 'actualizar']);
    Route::delete('/tipos-ausencia/{tipoAusencium}', [TipoAusenciaController::class, 'eliminar']);

    // festivos
    Route::get('/festivos/listar', [FestivosController::class, 'listar']);
    Route::post('/festivos', [FestivosController::class, 'crear']);
    Route::put('/festivos/{festivo}', [FestivosController::class, 'actualizar']);
    Route::delete('/festivos/{festivo}', [FestivosController::class, 'eliminar']);

    Route::get('/admin/ping', fn () => ['ok' => true]);
});

// ──────────────────────────────────────────────────────────
// catch-all: react router maneja cualquier ruta no capturada
// ──────────────────────────────────────────────────────────
Route::get('/{any}', fn () => view('spa'))
    ->where('any', '.*')
    ->middleware('auth');
