<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    private function admin(Request $request): void { abort_unless($request->user()->esAdministrador() && $request->user()->institution_id, 403); }

    public function index(Request $request)
    {
        $this->admin($request);
        return UserResource::collection(User::where('institution_id', $request->user()->institution_id)->where('rol', 'docente')->latest()->paginate(30));
    }

    public function store(Request $request)
    {
        $this->admin($request);
        $data = $request->validate(['nombre' => ['required', 'string', 'max:255'], 'correo' => ['required', 'email', 'max:255', 'unique:users,correo'], 'password' => ['required', 'string', 'min:8']]);
        $teacher = User::create($data + ['institution_id' => $request->user()->institution_id, 'rol' => 'docente', 'active' => true]);
        return response()->json(['data' => new UserResource($teacher)], 201);
    }

    public function show(Request $request, User $docente)
    {
        $this->admin($request);
        abort_unless($docente->esDocente() && (int) $docente->institution_id === (int) $request->user()->institution_id, 404);
        return response()->json(['data' => new UserResource($docente)]);
    }

    public function update(Request $request, User $docente)
    {
        $this->show($request, $docente);
        $data = $request->validate(['nombre' => ['sometimes', 'required', 'string', 'max:255'], 'correo' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,correo,' . $docente->id], 'password' => ['sometimes', 'required', 'string', 'min:8'], 'active' => ['sometimes', 'boolean']]);
        $docente->update($data);
        return response()->json(['data' => new UserResource($docente->fresh())]);
    }

    public function destroy(Request $request, User $docente)
    {
        $this->show($request, $docente);
        $docente->update(['active' => false]);
        return response()->json(['message' => 'Docente desactivado.']);
    }
}
