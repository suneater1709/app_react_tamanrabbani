<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Step 1: Program & Contacts
            'program_id' => 'required|exists:programs,id',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'notes' => 'nullable|string',

            // Step 2: Student details
            'full_name' => 'required|string|max:255',
            'nickname' => 'required|string|max:100',
            'nik' => 'required|string|size:16|unique:pendaftar,nik' . ($this->route('regNumber') ? ',' . \App\Models\Tenant\Pendaftar::where('registration_number', $this->route('regNumber'))->value('id') : ''),
            'gender' => 'required|in:L,P',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'religion' => 'required|string|max:100',
            'address' => 'required|string',
            'previous_school' => 'nullable|string|max:255',

            // Step 3: Parents (Father & Mother are required, Guardian is optional)
            'parents.father.name' => 'required|string|max:255',
            'parents.father.occupation' => 'nullable|string|max:255',
            'parents.father.education' => 'nullable|string|max:255',
            'parents.father.phone' => 'nullable|string|max:50',
            'parents.father.email' => 'nullable|email|max:255',
            'parents.father.income' => 'nullable|string|max:100',

            'parents.mother.name' => 'required|string|max:255',
            'parents.mother.occupation' => 'nullable|string|max:255',
            'parents.mother.education' => 'nullable|string|max:255',
            'parents.mother.phone' => 'nullable|string|max:50',
            'parents.mother.email' => 'nullable|email|max:255',
            'parents.mother.income' => 'nullable|string|max:100',

            'parents.guardian.name' => 'nullable|string|max:255',
            'parents.guardian.occupation' => 'nullable|string|max:255',
            'parents.guardian.education' => 'nullable|string|max:255',
            'parents.guardian.phone' => 'nullable|string|max:50',
            'parents.guardian.email' => 'nullable|email|max:255',
            'parents.guardian.income' => 'nullable|string|max:100',

            // Step 4: Documents Upload
            'birth_certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'family_card' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo' => 'required|file|image|mimes:jpg,jpeg,png|max:2048',
            'payment_receipt' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
    }

    /**
     * Get custom error messages for validators.
     */
    public function messages(): array
    {
        return [
            'program_id.required' => 'Pilihan program pembelajaran wajib diisi.',
            'program_id.exists' => 'Program pembelajaran tidak valid.',
            'email.required' => 'Email kontak wajib diisi.',
            'email.email' => 'Format email kontak tidak valid.',
            'phone.required' => 'Nomor HP kontak wajib diisi.',
            'full_name.required' => 'Nama lengkap anak wajib diisi.',
            'nickname.required' => 'Nama panggilan anak wajib diisi.',
            'nik.required' => 'NIK anak wajib diisi.',
            'nik.size' => 'NIK anak harus tepat 16 karakter.',
            'nik.unique' => 'NIK anak sudah terdaftar.',
            'gender.required' => 'Jenis kelamin wajib diisi.',
            'gender.in' => 'Pilihan jenis kelamin tidak valid.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'religion.required' => 'Agama wajib diisi.',
            'address.required' => 'Alamat rumah wajib diisi.',

            'parents.father.name.required' => 'Nama ayah kandung wajib diisi.',
            'parents.mother.name.required' => 'Nama ibu kandung wajib diisi.',

            'birth_certificate.required' => 'Scan Akta Kelahiran wajib diunggah.',
            'birth_certificate.mimes' => 'Akta Kelahiran harus berupa file PDF, JPG, atau PNG.',
            'birth_certificate.max' => 'Ukuran Akta Kelahiran tidak boleh melebihi 2MB.',

            'family_card.required' => 'Scan Kartu Keluarga (KK) wajib diunggah.',
            'family_card.mimes' => 'Kartu Keluarga harus berupa file PDF, JPG, atau PNG.',
            'family_card.max' => 'Ukuran Kartu Keluarga tidak boleh melebihi 2MB.',

            'photo.required' => 'Pas foto anak wajib diunggah.',
            'photo.image' => 'Pas foto anak harus berupa gambar.',
            'photo.mimes' => 'Pas foto anak harus berupa file JPG, JPEG, atau PNG.',
            'photo.max' => 'Ukuran Pas foto tidak boleh melebihi 2MB.',
            'payment_receipt.required' => 'Upload Bukti Transfer Pembayaran wajib diunggah.',
            'payment_receipt.mimes' => 'Bukti Transfer harus berupa file PDF, JPG, atau PNG.',
            'payment_receipt.max' => 'Ukuran Bukti Transfer tidak boleh melebihi 2MB.',
        ];
    }
}
