<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'GesTime')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --accent: #f43f5e;
            --accent-strong: #e11d48;
            --accent-soft: rgba(244, 63, 94, 0.16);
            --bg: #0a0f1a;
            --bg-2: #0d1422;
            --panel: #0f192d;
            --panel-alt: #121f38;
            --panel-border: #22314b;
            --text: #f8fafc;
            --muted: #cbd5e1;
            --muted-2: #94a3b8;
            --shadow: 0 18px 35px rgba(0, 0, 0, 0.45);
        }
        body { background: radial-gradient(circle at 20% 18%, rgba(244, 63, 94, 0.08), transparent 38%), radial-gradient(circle at 78% 0%, rgba(244, 63, 94, 0.06), transparent 32%), linear-gradient(145deg, var(--bg), var(--bg-2)); color: var(--text); }
        a { color: var(--accent); }
        h1, h2, h3, h4, h5, h6, label, .form-label { color: var(--text); }
        .text-muted, .form-text, small { color: var(--muted) !important; }
        .sidebar { width: 250px; background: linear-gradient(180deg, #0c1220, #0a0f1a); box-shadow: var(--shadow); }
        .sidebar .nav-link { color: var(--text); border-radius: 12px; padding: 0.65rem 0.95rem; font-weight: 600; letter-spacing: 0.01em; border: 1px solid transparent; transition: all 0.2s ease; }
        .sidebar .nav-link.active,
        .sidebar .nav-link:hover { color: #fff; background: var(--accent-soft); border: 1px solid rgba(244, 63, 94, 0.28); box-shadow: 0 10px 24px rgba(244, 63, 94, 0.18); }
        .sidebar .nav { --bs-nav-pills-link-active-bg: var(--accent-soft); }
        .card { background: linear-gradient(160deg, var(--panel), var(--panel-alt)); border-color: var(--panel-border); box-shadow: var(--shadow); color: var(--text); }
        .card-header { background: rgba(255,255,255,0.02); border-bottom-color: var(--panel-border); color: var(--text); font-weight: 600; }
        .list-group-item { background: rgba(255,255,255,0.02); border-color: var(--panel-border); color: var(--text); }
        .table { color: var(--text); }
        .table { font-size: 0.95rem; }
        .table thead th { border-color: var(--panel-border); color: var(--muted); font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.78rem; background: rgba(255,255,255,0.05); }
        .table td, .table th { border-color: var(--panel-border); vertical-align: middle; }
        .table tbody tr { background-color: rgba(255,255,255,0.01); transition: background-color 0.15s ease; }
        .table tbody tr:hover { background-color: rgba(244, 63, 94, 0.08); }
        .table-striped tbody tr:nth-of-type(odd) { background-color: rgba(255,255,255,0.04); }
        .table-striped tbody tr:nth-of-type(even) { background-color: rgba(255,255,255,0.02); }
        .table-responsive { border: 1px solid var(--panel-border); border-radius: 14px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.03); }
        .form-control, .form-select, .form-check-input { background: #0f1a2d; border-color: var(--panel-border); color: var(--text); box-shadow: inset 0 1px 0 rgba(255,255,255,0.02); }
        .form-control::placeholder, .form-select::placeholder { color: var(--muted-2); }
        .form-control:focus, .form-select:focus { box-shadow: 0 0 0 0.15rem rgba(244, 63, 94, 0.28); border-color: var(--accent); background: #12223a; color: var(--text); }
        .form-check-label { color: var(--text); }
        .btn { border-radius: 12px; font-weight: 700; letter-spacing: 0.01em; }
        .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-strong)); border-color: var(--accent-strong); box-shadow: 0 10px 24px rgba(244, 63, 94, 0.35); }
        .btn-primary:hover { background: var(--accent-strong); border-color: var(--accent-strong); }
        .btn-outline-primary { color: var(--accent); border-color: var(--accent); }
        .btn-outline-primary:hover { background: var(--accent); color: #fff; }
        .btn-outline-light { border-color: #f8fafc; color: #f8fafc; }
        .btn-outline-light:hover { background: #f8fafc; color: #0b0b0f; }
        .badge { border-radius: 10px; padding: 0.45rem 0.6rem; font-weight: 700; }
        .alert { border-radius: 12px; border: 1px solid var(--panel-border); }
        .alert-success { background: #0f2b1c; color: #befae3; border-color: #22c55e; }
        .alert-danger { background: #2a0d13; color: #fecdd3; border-color: #ef4444; }
        main { max-width: 1440px; }
        .chat-window { background: radial-gradient(circle at 12% 18%, rgba(244, 63, 94, 0.06), transparent 38%), #0c1526; border: 1px solid var(--panel-border); border-radius: 16px; padding: 1rem; height: 520px; overflow-y: auto; box-shadow: inset 0 1px 0 rgba(255,255,255,0.03); }
        .chat-bubble { max-width: 75%; padding: 0.75rem 0.9rem; border-radius: 14px; color: #f8fafc; box-shadow: 0 8px 18px rgba(0,0,0,0.28); }
        .chat-bubble.me { background: linear-gradient(135deg, var(--accent), var(--accent-strong)); margin-left: auto; }
        .chat-bubble.them { background: #162741; border: 1px solid var(--panel-border); }
        .chat-meta { font-size: 0.8rem; color: var(--muted-2); }
        .chat-avatar { width: 38px; height: 38px; border-radius: 10px; background: #182a45; display: grid; place-items: center; color: var(--muted); font-weight: 700; letter-spacing: 0.04em; border: 1px solid var(--panel-border); }
        @media (max-width: 992px) { .sidebar { width: 100%; } }
    </style>
</head>
<body>
@php $isAuthPage = request()->is('login'); @endphp
<div class="{{ $isAuthPage ? '' : 'd-flex min-vh-100' }}">
    @unless($isAuthPage)
    <aside class="sidebar bg-dark text-white d-flex flex-column p-3">
        <div class="d-flex align-items-center mb-4">
            <span class="fs-5 fw-bold">GesTime</span>
        </div>
        @auth
        <div class="mb-4">
            <div class="fw-semibold">{{ auth()->user()->nombre ?? auth()->user()->email }}</div>
            <small class="text-light text-opacity-75">{{ auth()->user()->email }}</small>
        </div>
        <nav class="nav nav-pills flex-column gap-1">
            <a class="nav-link" href="/panel">Panel</a>
            <a class="nav-link" href="/fichaje">Fichaje</a>
            <a class="nav-link" href="/ausencias">Ausencias</a>
            <a class="nav-link" href="/timesheets">Timesheets</a>
            <a class="nav-link" href="/calendario">Calendario</a>
            <a class="nav-link" href="/chat">Chat</a>
            <a class="nav-link" href="/notificaciones">Notificaciones</a>
            @if(auth()->user()?->hasRole(['admin', 'responsable']))
                <div class="text-uppercase text-light text-opacity-75 small mt-3 mb-1">Administracion</div>
                <a class="nav-link" href="/proyectos">Proyectos</a>
                <a class="nav-link" href="/tareas">Tareas</a>
                <a class="nav-link" href="/equipo">Equipo</a>
                <a class="nav-link" href="/empresa">Empresa</a>
                <a class="nav-link" href="/departamentos">Departamentos</a>
                <a class="nav-link" href="/tipos-ausencia">Tipos de ausencia</a>
                <a class="nav-link" href="/admin/revisiones">Revisiones</a>
                <a class="nav-link" href="/reporting">Reporting</a>
            @endif
        </nav>
        <div class="mt-auto pt-3">
            <form method="POST" action="/logout">
                @csrf
                <button class="btn btn-outline-light w-100 btn-sm">Salir</button>
            </form>
        </div>
        @else
            <a class="btn btn-outline-light" href="/login">Login</a>
        @endauth
    </aside>
    @endunless
    <main class="flex-grow-1 p-4 {{ $isAuthPage ? 'min-vh-100 d-flex align-items-center justify-content-center' : '' }}">
        <div class="{{ $isAuthPage ? 'w-100' : '' }}" style="{{ $isAuthPage ? 'max-width: 520px;' : '' }}">
            @if (session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @if (session('error'))
                <div class="alert alert-danger">{{ session('error') }}</div>
            @endif
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            @yield('content')
        </div>
    </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
@stack('scripts')
</body>
</html>