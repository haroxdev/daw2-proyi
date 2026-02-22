<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        $empleado = $request->user();
        if ($empleado && $empleado->estado === 'baja') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($request->expectsJson()) {
            $user = $request->user();
            return response()->json([
                'message' => 'Login correcto',
                'usuario' => [
                    'id_empleado' => $user->id_empleado,
                    'nombre' => $user->nombre,
                    'email' => $user->email,
                    'roles' => $user->roles ?? [],
                ],
            ]);
        }

        return redirect()->intended('/panel');
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Logout correcto',
            ]);
        }

        return redirect('/login');
    }
}
