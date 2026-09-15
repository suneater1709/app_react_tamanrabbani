<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    /**
     * Display a listing of programs (including soft-deleted if needed, but standard is active).
     */
    public function index(): JsonResponse
    {
        $programs = Program::orderBy('code', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    /**
     * Store a newly created program.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:programs,code',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ], [
            'name.required' => 'Nama program wajib diisi.',
            'code.required' => 'Kode program wajib diisi.',
            'code.unique' => 'Kode program sudah digunakan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $program = Program::create($request->only(['name', 'code', 'description', 'is_active']));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_program',
            'description' => "Created program class: {$program->name} ({$program->code})",
            'model_type' => Program::class,
            'model_id' => $program->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program baru berhasil ditambahkan.',
            'data' => $program,
        ], 201);
    }

    /**
     * Display the specified program.
     */
    public function show(int $id): JsonResponse
    {
        $program = Program::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $program,
        ]);
    }

    /**
     * Update the specified program.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $program = Program::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => "required|string|max:20|unique:programs,code,{$id}",
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ], [
            'name.required' => 'Nama program wajib diisi.',
            'code.required' => 'Kode program wajib diisi.',
            'code.unique' => 'Kode program sudah digunakan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $program->update($request->only(['name', 'code', 'description', 'is_active']));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_program',
            'description' => "Updated program: {$program->name} ({$program->code})",
            'model_type' => Program::class,
            'model_id' => $program->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program berhasil diperbarui.',
            'data' => $program,
        ]);
    }

    /**
     * Remove the specified program (soft delete).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $program = Program::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program tidak ditemukan.',
            ], 404);
        }

        $program->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_program',
            'description' => "Deleted program: {$program->name} ({$program->code})",
            'model_type' => Program::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program berhasil dihapus.',
        ]);
    }
}
