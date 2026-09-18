<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FaqController extends Controller
{
    /**
     * Display a listing of FAQs for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faq::orderBy('id', 'asc');

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $faqs = $query->get();

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Store a newly created FAQ.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ], [
            'question.required' => 'Pertanyaan FAQ wajib diisi.',
            'answer.required' => 'Jawaban FAQ wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faq = Faq::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'category' => $request->category ?? 'Umum',
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_faq',
            'description' => "Created FAQ: {$faq->question}",
            'model_type' => Faq::class,
            'model_id' => $faq->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'FAQ berhasil ditambahkan.',
            'data' => $faq,
        ], 201);
    }

    /**
     * Display the specified FAQ.
     */
    public function show(int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $faq,
        ]);
    }

    /**
     * Update the specified FAQ.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ], [
            'question.required' => 'Pertanyaan FAQ wajib diisi.',
            'answer.required' => 'Jawaban FAQ wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faq->update([
            'question' => $request->question,
            'answer' => $request->answer,
            'category' => $request->category ?? $faq->category ?? 'Umum',
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $faq->is_active,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_faq',
            'description' => "Updated FAQ: {$faq->question}",
            'model_type' => Faq::class,
            'model_id' => $faq->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'FAQ berhasil diperbarui.',
            'data' => $faq,
        ]);
    }

    /**
     * Remove the specified FAQ.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ tidak ditemukan.',
            ], 404);
        }

        $faq->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_faq',
            'description' => "Deleted FAQ: {$faq->question}",
            'model_type' => Faq::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'FAQ berhasil dihapus.',
        ]);
    }
}
