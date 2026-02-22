<?php

namespace App\Http\Middleware;

use App\Models\Empleado;
use Closure;
use Illuminate\Http\Request;

class EnsureNoEmployees
{
    public function handle(Request $request, Closure $next)
    {
        if (Empleado::count() > 0) {
            return redirect('/login');
        }

        return $next($request);
    }
}
