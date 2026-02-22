<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        if (! Auth::check()) {
            throw new HttpException(401, 'Unauthenticated');
        }

        $user = $request->user();

        if (! $user->hasRole($roles)) {
            throw new HttpException(403, 'Forbidden');
        }

        return $next($request);
    }
}
