<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ config('app.name', 'Gestime') }}</title>
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
      @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @else
      <link rel="stylesheet" href="/resources/css/app.css">
    @endif
    @php
      $usuarioInicial = null;
      if (auth()->check()) {
        $usuarioInicial = [
          'id_empleado' => auth()->user()->id_empleado,
          'nombre' => auth()->user()->nombre,
          'email' => auth()->user()->email,
          'roles' => auth()->user()->roles ?? []
        ];
      }
      $empresaNombre = \App\Models\Empresa::first()?->nombre ?? null;
    @endphp
    <script>
      // datos del usuario autenticado
      window.__USUARIO_INICIAL__ = @json($usuarioInicial);
      // nombre de la empresa
      window.__EMPRESA_NOMBRE__ = @json($empresaNombre);
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
