<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GalleryController extends Controller
{
    /**
     * Display a listing of gallery.
     */
    public function index(Request $request): JsonResponse
    {
        $gallery = Gallery::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $gallery,
        ]);
    }

    /**
     * Store a newly created gallery item.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpg,jpeg,png|max:3072', // max 3MB
            'category' => 'required|in:general,fasilitas,kegiatan',
            'caption' => 'nullable|string',
        ], [
            'title.required' => 'Judul foto wajib diisi.',
            'image.required' => 'File foto wajib diunggah.',
            'image.image' => 'Berkas harus berupa gambar.',
            'category.required' => 'Kategori foto wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['title', 'category', 'caption']);

        // Upload file
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('gallery', 'public');
            $data['image'] = $path;
        }

        $item = Gallery::create($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_gallery',
            'description' => "Uploaded photo to gallery: {$item->title} (category: {$item->category})",
            'model_type' => Gallery::class,
            'model_id' => $item->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil ditambahkan ke galeri.',
            'data' => $item,
        ], 201);
    }

    /**
     * Display the specified gallery item.
     */
    public function show(int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Foto tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Update the specified gallery item.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Foto tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:3072',
            'category' => 'required|in:general,fasilitas,kegiatan',
            'caption' => 'nullable|string',
        ], [
            'title.required' => 'Judul foto wajib diisi.',
            'category.required' => 'Kategori foto wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['title', 'category', 'caption']);

        // Upload new file if provided
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            // Delete old file if exists
            Storage::disk('public')->delete($item->image);

            $path = $request->file('image')->store('gallery', 'public');
            $data['image'] = $path;
        }

        $item->update($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_gallery',
            'description' => "Updated gallery photo details: {$item->title}",
            'model_type' => Gallery::class,
            'model_id' => $item->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail foto berhasil diperbarui.',
            'data' => $item,
        ]);
    }

    /**
     * Remove the specified gallery item.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Foto tidak ditemukan.',
            ], 404);
        }

        // Delete photo file
        Storage::disk('public')->delete($item->image);

        $item->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_gallery',
            'description' => "Deleted photo from gallery: {$item->title}",
            'model_type' => Gallery::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus dari galeri.',
        ]);
    }
}
