<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AusenciasController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\FichajeController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EmpleadosController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\TipoAusenciaController;
use App\Http\Controllers\ProyectosController;
use App\Http\Controllers\TareasController;
use App\Http\Controllers\TimesheetController;
use App\Http\Controllers\Web\SpaController;
use App\Http\Controllers\Api\DatosPaginaController;
use App\Http\Controllers\SetupController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\FestivosController;
use App\Http\Controllers\ExportacionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/panel');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.update');

Route::get('/login', function () {
    if (App\Models\Empleado::count() === 0) {
        return redirect('/setup');
    }
    // sirve la spa sin usuario autenticado
    return view('spa', ['datosPagina' => []]);
})->middleware('guest');

Route::middleware('setup')->group(function () {
    Route::get('/setup', [SetupController::class, 'show']);
    Route::post('/setup', [SetupController::class, 'store']);
});

Route::middleware(['auth'])->group(function () {
    // rutas spa con datos inyectados por el controlador
    Route::get('/panel', [SpaController::class, 'panel']);
    Route::get('/fichaje', [SpaController::class, 'fichaje']);
    Route::get('/ausencias', [SpaController::class, 'ausencias']);
    Route::get('/timesheets', [SpaController::class, 'timesheets']);
    Route::get('/calendario', [SpaController::class, 'calendario']);
    Route::get('/chat', [SpaController::class, 'chat']);
    Route::get('/notificaciones', [SpaController::class, 'notificaciones']);

    // api de datos para cada página (navegación SPA sin recargar)
    Route::get('/api/datos/panel', [DatosPaginaController::class, 'panel']);
    Route::get('/api/datos/fichaje', [DatosPaginaController::class, 'fichaje']);
    Route::get('/api/datos/ausencias', [DatosPaginaController::class, 'ausencias']);
    Route::get('/api/datos/timesheets', [DatosPaginaController::class, 'timesheets']);
    Route::get('/api/datos/calendario', [DatosPaginaController::class, 'calendario']);
    Route::get('/api/datos/notificaciones', [DatosPaginaController::class, 'notificaciones']);
    Route::get('/api/datos/contadores', [DatosPaginaController::class, 'contadores']);
    
    // api de chat
    Route::get('/chat/datos', [ChatController::class, 'indexData']);
    Route::get('/chat/mensajes', [ChatController::class, 'mensajes']);
    Route::get('/chat/mensajes/{contactoId}', [ChatController::class, 'mensajesConContacto']);
    Route::post('/chat/seleccionar', [ChatController::class, 'seleccionar']);
    Route::post('/chat/nuevo', [ChatController::class, 'nuevo']);

    // fichaje
    Route::post('/fichaje/entrada', [FichajeController::class, 'entrada']);
    Route::post('/fichaje/salida', [FichajeController::class, 'salida']);
    Route::post('/fichaje/{registro}/pausa/abrir', [FichajeController::class, 'abrirPausa']);
    Route::post('/fichaje/pausa/{pausa}/cerrar', [FichajeController::class, 'cerrarPausa']);
    Route::post('/fichaje/{registro}/correcciones', [FichajeController::class, 'solicitarCorreccion']);

    // ausencias
    Route::post('/ausencias', [AusenciasController::class, 'crear']);

    // timesheets
    Route::post('/timesheets', [TimesheetController::class, 'crear']);
    Route::post('/timesheets/{timesheet}/enviar', [TimesheetController::class, 'enviar']);

    // tareas
    Route::post('/tareas', [TareasController::class, 'crear']);
    Route::post('/tareas/{tarea}/imputar', [TareasController::class, 'imputarTiempo']);
    Route::post('/tiempos/{tiempo}/cerrar', [TareasController::class, 'cerrarTimer']);

    // calendario
    Route::get('/calendario/mis-eventos', [CalendarioController::class, 'misEventos']);
    Route::get('/calendario/mis-ausencias', [CalendarioController::class, 'misAusencias']);
    Route::post('/calendario/eventos', [CalendarioController::class, 'crear']);

    // chat y notificaciones
    Route::post('/chat', [ChatController::class, 'enviar']);
    Route::post('/notificaciones/{notificacion}/leer', [NotificacionesController::class, 'marcarLeida']);
    Route::post('/notificaciones/leer-todas', [NotificacionesController::class, 'marcarTodas']);

    // perfil del usuario autenticado
    Route::get('/perfil', [SpaController::class, 'panel']);
    Route::get('/api/datos/perfil', [PerfilController::class, 'mostrar']);
    Route::put('/perfil', [PerfilController::class, 'actualizar']);
});

Route::middleware(['auth', 'role:admin,responsable'])->group(function () {
    // rutas spa admin con datos inyectados
    Route::get('/proyectos', [SpaController::class, 'proyectos']);
    Route::get('/tareas', [SpaController::class, 'tareas']);
    Route::get('/equipo', [SpaController::class, 'equipo']);
    Route::get('/empresa', [SpaController::class, 'empresa']);
    Route::get('/departamentos', [SpaController::class, 'departamentos']);
    Route::get('/tipos-ausencia', [SpaController::class, 'tiposAusencia']);
    Route::get('/admin/revisiones', [SpaController::class, 'revisiones']);
    Route::get('/reporting', [SpaController::class, 'reporting']);
    Route::get('/festivos', [SpaController::class, 'festivos']);

    // api de datos admin para navegación SPA
    Route::get('/api/datos/proyectos', [DatosPaginaController::class, 'proyectos']);
    Route::get('/api/datos/tareas', [DatosPaginaController::class, 'tareas']);
    Route::get('/api/datos/equipo', [DatosPaginaController::class, 'equipo']);
    Route::get('/api/datos/empresa', [DatosPaginaController::class, 'empresa']);
    Route::get('/api/datos/departamentos', [DatosPaginaController::class, 'departamentos']);
    Route::get('/api/datos/tipos-ausencia', [DatosPaginaController::class, 'tiposAusencia']);
    Route::get('/api/datos/revisiones', [DatosPaginaController::class, 'revisiones']);
    Route::get('/api/datos/reporting', [DatosPaginaController::class, 'reporting']);
    Route::get('/api/datos/festivos', [DatosPaginaController::class, 'festivos']);

    Route::post('/fichaje/correcciones/{correccion}/resolver', [FichajeController::class, 'resolverCorreccion']);

    Route::post('/ausencias/{solicitud}/resolver', [AusenciasController::class, 'resolver']);

    Route::post('/timesheets/{timesheet}/revisar', [TimesheetController::class, 'revisar']);

    Route::post('/proyectos', [ProyectosController::class, 'crear']);
    Route::put('/proyectos/{proyecto}', [ProyectosController::class, 'actualizar']);
    Route::delete('/proyectos/{proyecto}', [ProyectosController::class, 'eliminar']);
    Route::post('/proyectos/{proyecto}/asignar', [ProyectosController::class, 'asignar']);
    Route::post('/proyectos/{proyecto}/desasignar', [ProyectosController::class, 'desasignar']);
    Route::post('/proyectos/{proyecto}/estado', [ProyectosController::class, 'estado']);

    Route::post('/tareas/{tarea}/asignar', [TareasController::class, 'asignar']);
    Route::put('/tareas/{tarea}', [TareasController::class, 'actualizar']);
    Route::delete('/tareas/{tarea}', [TareasController::class, 'eliminar']);

    Route::post('/equipo', [EmpleadosController::class, 'crear']);
    Route::put('/equipo/{empleado}', [EmpleadosController::class, 'actualizar']);
    Route::delete('/equipo/{empleado}', [EmpleadosController::class, 'desactivar']);

    Route::post('/empresa', [EmpresaController::class, 'actualizar']);

    Route::post('/departamentos', [DepartamentosController::class, 'crear']);
    Route::put('/departamentos/{departamento}', [DepartamentosController::class, 'actualizar']);
    Route::delete('/departamentos/{departamento}', [DepartamentosController::class, 'eliminar']);

    Route::post('/tipos-ausencia', [TipoAusenciaController::class, 'crear']);
    Route::put('/tipos-ausencia/{tipoAusencium}', [TipoAusenciaController::class, 'actualizar']);
    Route::delete('/tipos-ausencia/{tipoAusencium}', [TipoAusenciaController::class, 'eliminar']);

    // festivos y calendario laboral
    Route::get('/festivos/listar', [FestivosController::class, 'listar']);
    Route::post('/festivos', [FestivosController::class, 'crear']);
    Route::put('/festivos/{festivo}', [FestivosController::class, 'actualizar']);
    Route::delete('/festivos/{festivo}', [FestivosController::class, 'eliminar']);

    // exportación de informes
    Route::get('/exportar/fichajes', [ExportacionController::class, 'fichajes']);
    Route::get('/exportar/proyectos', [ExportacionController::class, 'proyectos']);
    Route::get('/exportar/ausencias', [ExportacionController::class, 'ausencias']);

    Route::get('/admin/ping', fn () => ['ok' => true]);
});

// ruta catch-all para la SPA: cualquier GET no capturado por las rutas
// anteriores se redirige a la vista spa (React Router manejará la navegación)
Route::get('/{any}', [SpaController::class, 'panel'])
    ->where('any', '.*')
    ->middleware('auth');
