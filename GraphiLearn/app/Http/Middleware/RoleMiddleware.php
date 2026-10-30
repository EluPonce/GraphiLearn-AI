<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Maneja una solicitud entrante y verifica si el usuario cuenta con uno de los roles permitidos.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Normalizar los roles permitidos por si vienen como 'role1,role2' o argumentos separados
        $allowedRoles = [];
        foreach ($roles as $role) {
            foreach (explode(',', $role) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        $userRol = $user?->rol ?? $user?->role;

        if (! $user || ! in_array($userRol, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Acceso denegado: no cuenta con los permisos necesarios para este recurso.',
                'required_roles' => $allowedRoles,
            ], 403);
        }

        return $next($request);
    }
}
