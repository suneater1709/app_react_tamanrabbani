<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\CmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    protected CmsService $cmsService;

    public function __construct(CmsService $cmsService)
    {
        $this->cmsService = $cmsService;
    }

    /**
     * Submit contact form message.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'message.required' => 'Pesan wajib diisi.',
            'message.min' => 'Pesan minimal berisi 10 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $contact = $this->cmsService->submitContactMessage($request->only([
            'name', 'email', 'phone', 'subject', 'message',
        ]));

        // Send real-time notification email to tamanrobbani23@gmail.com
        try {
            Mail::raw(
                "Pesan Baru Masuk dari Formulir Kontak PPDB:\n\n".
                "Nama: {$contact->name}\n".
                "Email: {$contact->email}\n".
                'Telepon: '.($contact->phone ?: '-')."\n".
                'Subjek: '.($contact->subject ?: '-')."\n\n".
                "Isi Pesan:\n{$contact->message}\n\n".
                'Waktu Kirim: '.now()->format('d/m/Y H:i:s')."\n",
                function ($mail) use ($contact) {
                    $mail->to('tamanrobbani23@gmail.com')
                        ->subject('Pesan Baru PPDB: '.($contact->subject ?: $contact->name))
                        ->replyTo($contact->email, $contact->name);
                }
            );
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim email kontak: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesan Anda berhasil dikirim. Terima kasih!',
            'data' => $contact,
        ]);
    }
}
