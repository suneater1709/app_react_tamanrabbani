<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\CurriculumProgram;
use App\Models\Tenant\Extracurricular;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CurriculumProgramController extends Controller
{
    /**
     * Display all curriculum programs grouped or listed.
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $query = CurriculumProgram::orderBy('order', 'asc')->orderBy('id', 'asc');

        if ($category && in_array(strtolower($category), ['sekolah', 'school', 'kelas', 'class', 'akhlak', 'quran', 'uks'])) {
            $catNormalized = match (strtolower($category)) {
                'school' => 'sekolah',
                'class' => 'kelas',
                default => strtolower($category),
            };
            $query->whereIn('category', [$catNormalized, $category]);
        }

        $programs = $query->get();
        $extracurriculars = Extracurricular::orderBy('order', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
            'programs' => $programs,
            'extracurriculars' => $extracurriculars,
        ]);
    }

    /**
     * Display extracurricular list.
     */
    public function getExtracurriculars(Request $request): JsonResponse
    {
        $level = $request->query('level');
        $query = Extracurricular::orderBy('order', 'asc')->orderBy('id', 'asc');

        if ($level && $level !== 'all') {
            $query->where('level', strtoupper($level));
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Store a new curriculum program.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string|in:sekolah,school,kelas,class,akhlak,quran,uks',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_allocation' => 'nullable|string|max:255',
            'frequency' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = match (strtolower($request->category)) {
            'school' => 'sekolah',
            'class' => 'kelas',
            default => strtolower($request->category),
        };

        $timeAllocation = $request->time_allocation ?? $request->frequency;

        $program = CurriculumProgram::create([
            'category' => $category,
            'title' => $request->title,
            'description' => $request->description,
            'time_allocation' => $timeAllocation,
            'order' => $request->order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_curriculum_program',
            'description' => "Created curriculum program: {$program->title} ({$program->category})",
            'model_type' => CurriculumProgram::class,
            'model_id' => $program->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program kurikulum berhasil ditambahkan.',
            'data' => $program,
        ], 201);
    }

    /**
     * Update a curriculum program.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $program = CurriculumProgram::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|in:sekolah,school,kelas,class,akhlak,quran,uks',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_allocation' => 'nullable|string|max:255',
            'frequency' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $category = match (strtolower($request->category)) {
            'school' => 'sekolah',
            'class' => 'kelas',
            default => strtolower($request->category),
        };

        $timeAllocation = $request->time_allocation ?? $request->frequency ?? $program->time_allocation;

        $program->update([
            'category' => $category,
            'title' => $request->title,
            'description' => $request->description,
            'time_allocation' => $timeAllocation,
            'order' => $request->order ?? $program->order,
            'is_active' => $request->has('is_active') ? $request->is_active : $program->is_active,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_curriculum_program',
            'description' => "Updated curriculum program: {$program->title} ({$program->category})",
            'model_type' => CurriculumProgram::class,
            'model_id' => $program->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program kurikulum berhasil diperbarui.',
            'data' => $program,
        ]);
    }

    /**
     * Delete a curriculum program.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $program = CurriculumProgram::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program tidak ditemukan.',
            ], 404);
        }

        $program->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_curriculum_program',
            'description' => "Deleted curriculum program: {$program->title}",
            'model_type' => CurriculumProgram::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program kurikulum berhasil dihapus.',
        ]);
    }

    /**
     * Toggle active status of a curriculum program.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $program = CurriculumProgram::find($id);

        if (! $program) {
            return response()->json([
                'success' => false,
                'message' => 'Program kurikulum tidak ditemukan.',
            ], 404);
        }

        $program->is_active = ! $program->is_active;
        $program->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'toggle_curriculum_status',
            'description' => "Toggled status of curriculum program {$program->title} to ".($program->is_active ? 'Active' : 'Inactive'),
            'model_type' => CurriculumProgram::class,
            'model_id' => $program->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status program kurikulum berhasil diubah.',
            'data' => $program,
        ]);
    }

    /**
     * Store extracurricular item.
     */
    public function storeExtracurricular(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'level' => 'required|in:KB,TK,ALL,kb,tk,all',
            'name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'instructor' => 'nullable|string|max:255',
            'schedule' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $name = $request->input('name') ?: $request->input('title');
        if (empty($name)) {
            return response()->json([
                'success' => false,
                'errors' => ['name' => ['Nama kegiatan ekstrakurikuler wajib diisi.']],
            ], 422);
        }

        $ekskul = Extracurricular::create([
            'level' => strtoupper($request->level),
            'name' => $name,
            'instructor' => $request->instructor,
            'schedule' => $request->schedule,
            'description' => $request->description,
            'order' => $request->order ?? 0,
            'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ekstrakurikuler berhasil ditambahkan.',
            'data' => $ekskul,
        ], 201);
    }

    /**
     * Update extracurricular item.
     */
    public function updateExtracurricular(Request $request, int $id): JsonResponse
    {
        $ekskul = Extracurricular::find($id);

        if (! $ekskul) {
            return response()->json([
                'success' => false,
                'message' => 'Ekstrakurikuler tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'level' => 'required|in:KB,TK,ALL,kb,tk,all',
            'name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'instructor' => 'nullable|string|max:255',
            'schedule' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $name = $request->input('name') ?: $request->input('title') ?: $ekskul->name;

        $ekskul->update([
            'level' => strtoupper($request->level),
            'name' => $name,
            'instructor' => $request->has('instructor') ? $request->instructor : $ekskul->instructor,
            'schedule' => $request->has('schedule') ? $request->schedule : $ekskul->schedule,
            'description' => $request->has('description') ? $request->description : $ekskul->description,
            'order' => $request->has('order') ? $request->order : $ekskul->order,
            'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : $ekskul->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ekstrakurikuler berhasil diperbarui.',
            'data' => $ekskul,
        ]);
    }

    /**
     * Toggle active status of an extracurricular item.
     */
    public function toggleExtracurricularStatus(Request $request, int $id): JsonResponse
    {
        $ekskul = Extracurricular::find($id);

        if (! $ekskul) {
            return response()->json([
                'success' => false,
                'message' => 'Ekstrakurikuler tidak ditemukan.',
            ], 404);
        }

        $ekskul->is_active = ! $ekskul->is_active;
        $ekskul->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'toggle_extracurricular_status',
            'description' => "Toggled status of extracurricular {$ekskul->name} to ".($ekskul->is_active ? 'Active' : 'Inactive'),
            'model_type' => Extracurricular::class,
            'model_id' => $ekskul->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status ekstrakurikuler berhasil diubah.',
            'data' => $ekskul,
        ]);
    }

    /**
     * Delete extracurricular item.
     */
    public function destroyExtracurricular(Request $request, int $id): JsonResponse
    {
        $ekskul = Extracurricular::find($id);

        if (! $ekskul) {
            return response()->json([
                'success' => false,
                'message' => 'Ekstrakurikuler tidak ditemukan.',
            ], 404);
        }

        $ekskul->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ekstrakurikuler berhasil dihapus.',
        ]);
    }
}
