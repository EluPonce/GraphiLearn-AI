<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario (docente o administrador).
     *
     * POST /api/v1/register
     */
    public function register(\App\Http\Requests\Auth\RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nombre' => $request->validated('nombre'),
            'correo' => $request->validated('correo'),
            'password' => Hash::make($request->validated('password')),
            'rol' => $request->validated('rol'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Usuario registrado exitosamente.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ], 201);
    }

    /**
     * Inicio de sesión y generación de token Sanctum.
     *
     * POST /api/v1/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('correo', $request->validated('correo'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Revocar tokens anteriores del mismo dispositivo (opcional: comentar para permitir múltiples)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Inicio de sesión exitoso.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ]);
    }

    /**
     * Cierre de sesión y revocación del token actual.
     *
     * POST /api/v1/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente.',
        ]);
    }

    /**
     * Obtener los datos del usuario autenticado.
     *
     * GET /api/v1/auth/me
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
