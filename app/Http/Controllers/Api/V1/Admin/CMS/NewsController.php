<?php

namespace App\Http\Controllers\Api\V1\Admin\CMS;

use App\Http\Controllers\Controller;
use App\Models\Admin\ActivityLog;
use App\Models\Tenant\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Display a listing of news.
     */
    public function index(Request $request): JsonResponse
    {
        $news = News::orderBy('created_at', 'desc')->paginate($request->query('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $news,
        ]);
    }

    /**
     * Store a newly created news article.
     */
    public function store(Request $request): JsonResponse
    {
        $contentType = $request->input('content_type', 'image');

        $rules = [
            'title' => 'required|string|max:255',
            'content_type' => 'nullable|in:image,file,link',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'external_link' => 'nullable|url|max:500',
            'is_published' => 'required|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ];

        if ($contentType === 'link') {
            $rules['external_link'] = 'required|url|max:500';
            $rules['content'] = 'nullable|string';
        } elseif ($contentType === 'file') {
            $rules['content'] = 'nullable|string';
        } else {
            $rules['content'] = 'required|string';
        }

        $validator = Validator::make($request->all(), $rules, [
            'title.required' => 'Judul berita wajib diisi.',
            'content.required' => 'Isi konten berita wajib diisi.',
            'image.image' => 'Cover harus berupa berkas gambar.',
            'image.max' => 'Ukuran cover tidak boleh melebihi 3MB.',
            'file.mimes' => 'File dokumen harus berupa PDF, DOC, atau DOCX.',
            'file.max' => 'Ukuran dokumen tidak boleh melebihi 10MB.',
            'pdf_file.mimes' => 'File dokumen harus berupa PDF, DOC, atau DOCX.',
            'pdf_file.max' => 'Ukuran dokumen tidak boleh melebihi 10MB.',
            'external_link.required' => 'Alamat tautan sumber (URL) wajib diisi.',
            'external_link.url' => 'Format tautan eksternal harus berupa URL yang valid (diawali http:// atau https://).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['title', 'content_type', 'external_link', 'is_published', 'seo_title', 'seo_description']);
        $data['content_type'] = $contentType;
        $data['content'] = $request->input('content') ?? '';

        // Generate Unique Slug
        $slug = Str::slug($request->title);
        $count = News::where('slug', 'like', "{$slug}%")->count();
        $data['slug'] = $count > 0 ? "{$slug}-".($count + 1) : $slug;

        // Handle Image Upload
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('news', 'public');
            $data['image'] = $path;
        }

        // Handle File Document Upload (support both file and pdf_file input names)
        $docUpload = $request->file('file') ?? $request->file('pdf_file');
        if ($docUpload && $docUpload->isValid()) {
            $filePath = $docUpload->store('news_docs', 'public');
            $data['file_path'] = $filePath;
        }

        $news = News::create($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_news',
            'description' => "Published news article: {$news->title}",
            'model_type' => News::class,
            'model_id' => $news->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berita baru berhasil ditambahkan.',
            'data' => $news,
        ], 201);
    }

    /**
     * Display the specified news article.
     */
    public function show(int $id): JsonResponse
    {
        $news = News::find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $news,
        ]);
    }

    /**
     * Update the specified news article.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $news = News::find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $contentType = $request->input('content_type', $news->content_type ?? 'image');

        $rules = [
            'title' => 'required|string|max:255',
            'content_type' => 'nullable|in:image,file,link',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'external_link' => 'nullable|url|max:500',
            'is_published' => 'required|boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ];

        if ($contentType === 'link') {
            $rules['external_link'] = 'required|url|max:500';
            $rules['content'] = 'nullable|string';
        } elseif ($contentType === 'file') {
            $rules['content'] = 'nullable|string';
        } else {
            $rules['content'] = 'required|string';
        }

        $validator = Validator::make($request->all(), $rules, [
            'title.required' => 'Judul berita wajib diisi.',
            'content.required' => 'Isi konten berita wajib diisi.',
            'image.image' => 'Cover harus berupa berkas gambar.',
            'image.max' => 'Ukuran cover tidak boleh melebihi 3MB.',
            'file.mimes' => 'File dokumen harus berupa PDF, DOC, atau DOCX.',
            'file.max' => 'Ukuran dokumen tidak boleh melebihi 10MB.',
            'pdf_file.mimes' => 'File dokumen harus berupa PDF, DOC, atau DOCX.',
            'pdf_file.max' => 'Ukuran dokumen tidak boleh melebihi 10MB.',
            'external_link.required' => 'Alamat tautan sumber (URL) wajib diisi.',
            'external_link.url' => 'Format tautan eksternal harus berupa URL yang valid (diawali http:// atau https://).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['title', 'content_type', 'external_link', 'is_published', 'seo_title', 'seo_description']);
        $data['content_type'] = $contentType;
        if ($request->has('content')) {
            $data['content'] = $request->input('content') ?? '';
        }

        // Update Slug if title changed
        if ($news->title !== $request->title) {
            $slug = Str::slug($request->title);
            $count = News::where('slug', 'like', "{$slug}%")->where('id', '!=', $id)->count();
            $data['slug'] = $count > 0 ? "{$slug}-".($count + 1) : $slug;
        }

        // Handle Image Upload
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            // Delete old file if exists
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $path = $request->file('image')->store('news', 'public');
            $data['image'] = $path;
        }

        // Handle File Document Upload
        $docUpload = $request->file('file') ?? $request->file('pdf_file');
        if ($docUpload && $docUpload->isValid()) {
            if ($news->file_path) {
                Storage::disk('public')->delete($news->file_path);
            }
            $filePath = $docUpload->store('news_docs', 'public');
            $data['file_path'] = $filePath;
        }

        $news->update($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_news',
            'description' => "Updated news article: {$news->title}",
            'model_type' => News::class,
            'model_id' => $news->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil diperbarui.',
            'data' => $news,
        ]);
    }

    /**
     * Remove the specified news article.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $news = News::find($id);

        if (! $news) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        // Delete associated image
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_news',
            'description' => "Deleted news article: {$news->title}",
            'model_type' => News::class,
            'model_id' => $id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berita berhasil dihapus.',
        ]);
    }
}
