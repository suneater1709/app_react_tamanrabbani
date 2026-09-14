<?php

namespace Database\Seeders;

use App\Models\Tenant\Announcement;
use App\Models\Tenant\Contact;
use App\Models\Tenant\Faq;
use App\Models\Tenant\Gallery;
use App\Models\Tenant\News;
use App\Models\Tenant\Pendaftar;
use App\Models\Tenant\Program;
use App\Models\Tenant\SchoolProfile;
use App\Models\Tenant\Setting;
use App\Models\Tenant\Slider;
use App\Models\Tenant\StudentDocument;
use App\Models\Tenant\StudentParent;
use App\Models\Tenant\StudentStatusLog;
use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Programs
        $programs = [
            [
                'name' => 'Kelompok Bermain (Playgroup)',
                'code' => 'KB',
                'description' => 'Program yang dirancang khusus untuk anak usia 3 - 4 tahun demi mengoptimalkan masa keemasan tumbuh kembang anak.',
                'is_active' => true,
            ],
            [
                'name' => 'Taman Kanak-Kanak A (TK A)',
                'code' => 'TK-A',
                'description' => 'Program pendidikan terstruktur untuk anak usia 4 - 5 tahun yang memadukan pembiasaan ibadah praktis.',
                'is_active' => true,
            ],
            [
                'name' => 'Taman Kanak-Kanak B (TK B)',
                'code' => 'TK-B',
                'description' => 'Program persiapan matang untuk anak usia 5 - 6 tahun dalam menghadapi transisi menuju Sekolah Dasar (SD).',
                'is_active' => true,
            ],
        ];

        $progModels = [];
        foreach ($programs as $prog) {
            $progModels[$prog['code']] = Program::updateOrCreate(
                ['code' => $prog['code']],
                $prog
            );
        }

        // 2. Seed Settings
        $settings = [
            'school_name' => 'KB-TK IT Taman Robbani Sidoarjo',
            'school_address' => 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
            'school_phone' => '087752439572',
            'school_email' => 'tamanrobbani23@gmail.com',
            'admission_open' => 'true',
            'admission_start_date' => '2027-01-01',
            'admission_end_date' => '2027-06-30',
            'registration_fee' => 'Rp 250.000',
            'bank_account_info' => 'Bank Syariah Indonesia (BSI) - 7123456789 a.n. Yayasan Taman Robbani',
        ];

        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 3. Seed School Profile
        $profiles = [
            'history' => 'KB-TK IT Taman Robbani didirikan pada tahun 2015 dengan visi mencetak generasi unggul, berakhlak mulia, cerdas, dan mandiri berlandaskan nilai-nilai Islam.',
            'vision' => 'Terwujudnya anak usia dini yang berkarakter Islami, cerdas, kreatif, mandiri, dan berwawasan lingkungan.',
            'mission' => "1. Menyelenggarakan pendidikan berbasis nilai-nilai Islam.\n2. Mengembangkan bakat, kreativitas, dan kemandirian anak.\n3. Menciptakan lingkungan belajar yang menyenangkan, bersih, sehat, dan kondusif.\n4. Membangun sinergi yang harmonis antara sekolah, orang tua, dan masyarakat.",
            'welcome_message' => 'Selamat datang di PPDB Online KB-TK IT Taman Robbani Sidoarjo. Kami berkomitmen memberikan layanan pendidikan anak usia dini terbaik dengan kurikulum Islami terpadu.',
        ];

        foreach ($profiles as $key => $val) {
            SchoolProfile::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 4. Seed FAQs
        $faqs = [
            [
                'question' => 'Berapa usia minimal untuk masuk KB-A?',
                'answer' => 'Usia minimal untuk mendaftar di program KB-A adalah 3 tahun per bulan Juli pada tahun ajaran berjalan.',
                'category' => 'Persyaratan',
                'is_active' => true,
            ],
            [
                'question' => 'Dokumen apa saja yang harus disiapkan saat mendaftar?',
                'answer' => 'Orang tua perlu menyiapkan softcopy/scan file Kartu Keluarga (KK), Akta Kelahiran anak, dan Pas Foto anak berwarna.',
                'category' => 'Pendaftaran',
                'is_active' => true,
            ],
            [
                'question' => 'Bagaimana cara mengetahui status penerimaan pendaftar?',
                'answer' => 'Anda dapat memasukkan Nomor Pendaftaran (contoh: TR-2027-0001) dan Nama Lengkap anak di halaman "Cek Status" untuk melihat hasil verifikasi berkas.',
                'category' => 'Pengumuman',
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }

        // 5. Seed Announcements
        $announcements = [
            [
                'title' => 'Pembukaan PPDB Ajaran 2027/2028',
                'content' => 'Pendaftaran online siswa baru KB-TK IT Taman Robbani Sidoarjo resmi dibuka mulai tanggal 1 Januari 2027. Kuota terbatas untuk setiap jenjang kelas.',
                'is_active' => true,
                'publish_date' => '2027-01-01',
            ],
            [
                'title' => 'Alur Pendaftaran PPDB Online',
                'content' => 'Orang tua mengisi formulir pendaftaran 4 tahap (Program -> Data Siswa -> Data Orang Tua -> Upload Berkas) dan menyimpan nomor registrasi untuk pelacakan.',
                'is_active' => true,
                'publish_date' => '2027-01-02',
            ],
        ];

        foreach ($announcements as $ann) {
            Announcement::create($ann);
        }

        // 6. Seed Sliders
        $sliders = [
            [
                'title' => 'Mencetak Generasi Islami & Kreatif',
                'subtitle' => 'Selamat Datang di KB-TK IT Taman Robbani Sidoarjo',
                'image' => 'slider1.jpg',
                'link_url' => '/ppdb',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Lingkungan Belajar yang Menyenangkan',
                'subtitle' => 'Menstimulasi Tumbuh Kembang Anak Secara Optimal',
                'image' => 'slider2.jpg',
                'link_url' => '/profil',
                'order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($sliders as $slide) {
            Slider::create($slide);
        }

        // 7. Seed News Articles
        $news = [
            [
                'title' => 'Kegiatan Outbound Edukatif KB-TK IT Taman Robbani Sidoarjo',
                'slug' => 'kegiatan-outbound-edukatif-kb-tk-it-taman-robbani-sidoarjo',
                'content' => '<p>Pada tanggal 15 Mei kemarin, seluruh siswa KB-TK IT Taman Robbani Sidoarjo mengikuti outbound seru di Pacet. Kegiatan ini bertujuan melatih motorik kasar, keberanian, kemandirian, dan kerjasama tim sejak dini. Berbagai permainan tali, rintangan bambu, dan susur sungai kecil diikuti siswa dengan sangat antusias didampingi ustadzah dan instruktur profesional.</p>',
                'image' => 'news_outbound.jpg',
                'is_published' => true,
                'seo_title' => 'Outbound Seru KB-TK IT Taman Robbani Sidoarjo',
                'seo_description' => 'Keseruan outbound edukatif luar ruangan siswa KB-TK IT Taman Robbani Sidoarjo di Pacet untuk melatih motorik kasar dan kerjasama.',
            ],
            [
                'title' => 'Peringatan Hari Anak Nasional: Menggambar Masa Depan',
                'slug' => 'peringatan-hari-anak-nasional-menggambar-masa-depan',
                'content' => '<p>Sekolah memperingati Hari Anak Nasional dengan menggelar lomba menggambar bersama orang tua. Kegiatan ini dirancang untuk merekatkan ikatan emosional (bonding) orang tua dengan anak sekaligus memfasilitasi ekspresi seni visual siswa. Selamat hari anak!</p>',
                'image' => 'news_harianak.jpg',
                'is_published' => true,
                'seo_title' => 'Hari Anak Nasional di KB-TK IT Taman Robbani',
                'seo_description' => 'Kegiatan mewarnai dan menggambar bersama orang tua di KB-TK IT Taman Robbani Sidoarjo memperingati Hari Anak Nasional.',
            ],
        ];

        foreach ($news as $n) {
            News::create($n);
        }

        // 8. Seed Gallery
        $galleries = [
            ['title' => 'Ruang Kelas TK-A yang Luas dan Nyaman', 'image' => 'gallery_class.jpg', 'category' => 'fasilitas', 'caption' => 'Kelas dilengkapi AC, karpet pengaman, dan mainan edukatif.'],
            ['title' => 'Kegiatan Sholat Dhuha Berjamaah', 'image' => 'gallery_sholat.jpg', 'category' => 'kegiatan', 'caption' => 'Membiasakan ibadah sunnah harian sejak dini.'],
            ['title' => 'Peralatan Edukasi Motorik Luar Ruangan', 'image' => 'gallery_playground.jpg', 'category' => 'fasilitas', 'caption' => 'Area bermain outdoor dengan rumput sintetis higienis.'],
        ];

        foreach ($galleries as $g) {
            Gallery::create($g);
        }

        // 9. Seed Contacts
        Contact::create([
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'phone' => '0899-8888-7777',
            'subject' => 'Tanya Biaya PPDB Gelombang 2',
            'message' => 'Apakah biaya masuk TK-A bisa dicicil 3 kali pembayaran? Terima kasih.',
            'is_read' => false,
        ]);

        // 10. Seed Pendaftar (Applicants)
        // Applicant 1: Pending
        $pendaftar1 = Pendaftar::create([
            'registration_number' => 'TR-2027-0001',
            'program_id' => $progModels['TK-A']->id,
            'email' => 'parent1@example.com',
            'phone' => '0812-1111-2222',
            'full_name' => 'Fatih Rizqi Robbani',
            'nickname' => 'Fatih',
            'nik' => '3515012345670001',
            'gender' => 'L',
            'birth_place' => 'Sidoarjo',
            'birth_date' => '2021-04-12',
            'religion' => 'Islam',
            'address' => 'Perum Taman Robbani Indah Blok A4/12, Buduran, Sidoarjo',
            'previous_school' => 'KB Al-Ikhlas Sidoarjo',
            'status' => 'pending',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar1->id,
            'type' => 'father',
            'name' => 'Ahmad Robbani',
            'occupation' => 'Wiraswasta',
            'education' => 'S1 Teknik Informatika',
            'phone' => '0812-1111-2222',
            'email' => 'ahmad.parent1@example.com',
            'income' => 'Rp 5.000.000 - Rp 10.000.000',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar1->id,
            'type' => 'mother',
            'name' => 'Siti Aminah',
            'occupation' => 'Ibu Rumah Tangga',
            'education' => 'D3 Kebidanan',
            'phone' => '0812-3333-4444',
            'email' => 'siti.parent1@example.com',
            'income' => 'Tidak Ada Pendapatan',
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar1->id,
            'document_type' => 'birth_certificate',
            'file_path' => 'documents/TR-2027-0001/birth_certificate.pdf',
            'file_size' => 102450,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar1->id,
            'document_type' => 'family_card',
            'file_path' => 'documents/TR-2027-0001/family_card.pdf',
            'file_size' => 205600,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar1->id,
            'document_type' => 'photo',
            'file_path' => 'documents/TR-2027-0001/photo.jpg',
            'file_size' => 84200,
        ]);

        StudentStatusLog::create([
            'pendaftar_id' => $pendaftar1->id,
            'old_status' => 'pending',
            'new_status' => 'pending',
            'changed_by' => null,
            'notes' => 'Pendaftaran online berhasil dikirim.',
        ]);

        // Applicant 2: Revision
        $pendaftar2 = Pendaftar::create([
            'registration_number' => 'TR-2027-0002',
            'program_id' => $progModels['KB']->id,
            'email' => 'parent2@example.com',
            'phone' => '0812-2222-3333',
            'full_name' => 'Aisyah Azzahra',
            'nickname' => 'Aisyah',
            'nik' => '3515012345670002',
            'gender' => 'P',
            'birth_place' => 'Surabaya',
            'birth_date' => '2023-08-25',
            'religion' => 'Islam',
            'address' => 'Jl. Pahlawan Gg. 3 No. 45, Sidoarjo',
            'previous_school' => null,
            'status' => 'revision',
            'verifier_notes' => 'File scan Kartu Keluarga kurang jelas, mohon diunggah kembali yang terlihat jelas.',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar2->id,
            'type' => 'father',
            'name' => 'Rachmat Hidayat',
            'occupation' => 'Pegawai Swasta',
            'education' => 'S1 Manajemen',
            'phone' => '0812-2222-3333',
            'email' => 'rachmat.parent2@example.com',
            'income' => 'Rp 3.000.000 - Rp 5.000.000',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar2->id,
            'type' => 'mother',
            'name' => 'Lailatul Fitri',
            'occupation' => 'Guru',
            'education' => 'S1 PGSD',
            'phone' => '0812-4444-5555',
            'email' => 'laila.parent2@example.com',
            'income' => 'Rp 1.500.000 - Rp 3.000.000',
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar2->id,
            'document_type' => 'birth_certificate',
            'file_path' => 'documents/TR-2027-0002/birth_certificate.pdf',
            'file_size' => 98400,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar2->id,
            'document_type' => 'family_card',
            'file_path' => 'documents/TR-2027-0002/family_card.pdf',
            'file_size' => 194300,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar2->id,
            'document_type' => 'photo',
            'file_path' => 'documents/TR-2027-0002/photo.jpg',
            'file_size' => 76200,
        ]);

        StudentStatusLog::create([
            'pendaftar_id' => $pendaftar2->id,
            'old_status' => 'pending',
            'new_status' => 'pending',
            'notes' => 'Pendaftaran online berhasil dikirim.',
        ]);

        StudentStatusLog::create([
            'pendaftar_id' => $pendaftar2->id,
            'old_status' => 'pending',
            'new_status' => 'revision',
            'changed_by' => 2, // Verifier
            'notes' => 'File scan Kartu Keluarga kurang jelas, mohon diunggah kembali yang terlihat jelas.',
        ]);

        // Applicant 3: Accepted
        $pendaftar3 = Pendaftar::create([
            'registration_number' => 'TR-2027-0003',
            'program_id' => $progModels['TK-B']->id,
            'email' => 'parent3@example.com',
            'phone' => '0812-3333-4444',
            'full_name' => 'Muhammad Yusuf Al-Fatih',
            'nickname' => 'Yusuf',
            'nik' => '3515012345670003',
            'gender' => 'L',
            'birth_place' => 'Sidoarjo',
            'birth_date' => '2020-11-05',
            'religion' => 'Islam',
            'address' => 'Perumahan Sidoarjo Permai C/9, Candi, Sidoarjo',
            'previous_school' => 'KB IT Robbani',
            'status' => 'accepted',
            'verifier_notes' => 'Seluruh dokumen lengkap dan valid. Selamat datang di KB-TK IT Taman Robbani Sidoarjo!',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar3->id,
            'type' => 'father',
            'name' => 'Supriyono',
            'occupation' => 'PNS',
            'education' => 'S2 Administrasi Publik',
            'phone' => '0812-3333-4444',
            'email' => 'supri.parent3@example.com',
            'income' => 'Rp 5.000.000 - Rp 10.000.000',
        ]);

        StudentParent::create([
            'pendaftar_id' => $pendaftar3->id,
            'type' => 'mother',
            'name' => 'Dwi Lestari',
            'occupation' => 'Apoteker',
            'education' => 'S1 Farmasi',
            'phone' => '0812-5555-6666',
            'email' => 'dwi.parent3@example.com',
            'income' => 'Rp 3.000.000 - Rp 5.000.000',
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar3->id,
            'document_type' => 'birth_certificate',
            'file_path' => 'documents/TR-2027-0003/birth_certificate.pdf',
            'file_size' => 112000,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar3->id,
            'document_type' => 'family_card',
            'file_path' => 'documents/TR-2027-0003/family_card.pdf',
            'file_size' => 220000,
        ]);

        StudentDocument::create([
            'pendaftar_id' => $pendaftar3->id,
            'document_type' => 'photo',
            'file_path' => 'documents/TR-2027-0003/photo.jpg',
            'file_size' => 90500,
        ]);

        StudentStatusLog::create([
            'pendaftar_id' => $pendaftar3->id,
            'old_status' => 'pending',
            'new_status' => 'pending',
            'notes' => 'Pendaftaran online berhasil dikirim.',
        ]);

        StudentStatusLog::create([
            'pendaftar_id' => $pendaftar3->id,
            'old_status' => 'pending',
            'new_status' => 'accepted',
            'changed_by' => 1, // Admin
            'notes' => 'Seluruh dokumen lengkap dan valid. Selamat datang di KB-TK IT Taman Robbani Sidoarjo!',
        ]);
    }
}
