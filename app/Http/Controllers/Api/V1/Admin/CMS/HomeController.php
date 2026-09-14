<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\SchoolProfile;
use App\Models\Tenant\Slider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HomeController extends Controller
{
    /**
     * Get aggregated home CMS data (settings and all sliders).
     */
    public function index(): JsonResponse
    {
        $tagline = SchoolProfile::where('key', 'hero_tagline')->value('value') ?: "Berkarakter Qur'an";
        $videoUrl = SchoolProfile::where('key', 'about_video_url')->value('value') ?: "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        $sliders = Slider::orderBy('order', 'asc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'hero_tagline' => $tagline,
                'about_video_url' => $videoUrl,
                'sliders' => $sliders,
            ],
        ]);
    }

    /**
     * Update home settings (hero tagline and YouTube about video URL).
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'hero_tagline' => 'required|string|max:255',
            'about_video_url' => 'required|string|max:500',
        ], [
            'hero_tagline.required' => 'Tagline hero beranda wajib diisi.',
            'about_video_url.required' => 'Link video YouTube tentang kami wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        SchoolProfile::updateOrCreate(
            ['key' => 'hero_tagline'],
            ['value' => $request->input('hero_tagline')]
        );

        SchoolProfile::updateOrCreate(
            ['key' => 'about_video_url'],
            ['value' => $request->input('about_video_url')]
        );

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_home_cms_settings',
            'description' => 'Updated Home CMS settings (hero tagline & about video URL)',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan beranda berhasil disimpan.',
        ]);
    }

    /**
     * Get all sliders.
     */
    public function sliders(): JsonResponse
    {
        $sliders = Slider::orderBy('order', 'asc')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $sliders,
        ]);
    }

    /**
     * Store a new slider.
     */
    public function storeSlider(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // max 5MB
            'link_url' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|in:0,1,true,false',
        ], [
            'title.required' => 'Judul / keterangan foto slider wajib diisi.',
            'image.required' => 'File foto slider wajib diunggah.',
            'image.image' => 'Berkas harus berupa gambar (JPG, PNG, WEBP).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $path = $request->file('image')->store('sliders', 'public');

        $slider = Slider::create([
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'image' => $path,
            'link_url' => $request->input('link_url', '/ppdb'),
            'order' => (int) $request->input('order', 0),
            'is_active' => filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_slider',
            'description' => "Uploaded new hero slider: {$slider->title}",
            'model_type' => Slider::class,
            'model_id' => $slider->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto slider berhasil ditambahkan.',
            'data' => $slider,
        ], 201);
    }

    /**
     * Update an existing slider.
     */
    public function updateSlider(Request $request, int $id): JsonResponse
    {
        $slider = Slider::find($id);

        if (! $slider) {
            return response()->json([
                'success' => false,
                'message' => 'Foto slider tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'link_url' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|in:0,1,true,false',
        ], [
            'title.required' => 'Judul / keterangan foto slider wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = [
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'link_url' => $request->input('link_url', $slider->link_url),
            'order' => (int) $request->input('order', $slider->order),
        ];

        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            // Delete old file if stored locally
            if ($slider->image && ! str_starts_with($slider->image, 'http') && ! str_starts_with($slider->image, '/')) {
                Storage::disk('public')->delete($slider->image);
            }
            $data['image'] = $request->file('image')->store('sliders', 'public');
        }

        $slider->update($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_slider',
            'description' => "Updated hero slider: {$slider->title}",
            'model_type' => Slider::class,
            'model_id' => $slider->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto slider berhasil diperbarui.',
            'data' => $slider,
        ]);
    }

    /**
     * Toggle slider active state.
     */
    public function toggleSlider(Request $request, int $id): JsonResponse
    {
        $slider = Slider::find($id);

        if (! $slider) {
            return response()->json([
                'success' => false,
                'message' => 'Foto slider tidak ditemukan.',
            ], 404);
        }

        $slider->is_active = ! $slider->is_active;
        $slider->save();

        return response()->json([
            'success' => true,
            'message' => 'Status aktif slider berhasil diubah.',
            'data' => $slider,
        ]);
    }

    /**
     * Delete a slider.
     */
    public function destroySlider(Request $request, int $id): JsonResponse
    {
        $slider = Slider::find($id);

        if (! $slider) {
            return response()->json([
                'success' => false,
                'message' => 'Foto slider tidak ditemukan.',
            ], 404);
        }

        if ($slider->image && ! str_starts_with($slider->image, 'http') && ! str_starts_with($slider->image, '/')) {
            Storage::disk('public')->delete($slider->image);
        }

        $title = $slider->title;
        $slider->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_slider',
            'description' => "Deleted hero slider: {$title}",
            'model_type' => Slider::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto slider berhasil dihapus.',
        ]);
    }
}
