<?php

namespace Database\Seeders;

use App\Models\Tenant\Announcement;
use App\Models\Tenant\Contact;
use App\Models\Tenant\CurriculumProgram;
use App\Models\Tenant\Extracurricular;
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
        $defaultFees = [
            'kb' => [
                'name' => 'Kelompok Bermain (KB)',
                'items' => [
                    ['name' => 'Infaq Pendidikan', 'amount' => 550000],
                    ['name' => 'Perlengkapan (1 tahun)', 'amount' => 850000],
                    ['name' => 'Kegiatan (1 tahun)', 'amount' => 1000000],
                    ['name' => 'Seragam', 'amount' => 400000],
                ],
            ],
            'tk' => [
                'name' => 'Taman Kanak-Kanak (TK A & TK B)',
                'items' => [
                    ['name' => 'Infaq Pendidikan (2 tahun)', 'amount' => 750000],
                    ['name' => 'Perlengkapan (1 tahun)', 'amount' => 1050000],
                    ['name' => 'Kegiatan (1 tahun)', 'amount' => 1500000],
                    ['name' => 'Seragam', 'amount' => 650000],
                ],
            ],
        ];

        $settings = [
            'school_name' => 'KB-TK IT Taman Robbani Sidoarjo',
            'school_address' => 'Jl. Mangkurejo 41, Kwangsan, Sedati, Sidoarjo',
            'school_phone' => '087752439572',
            'school_email' => 'tamanrobbani23@gmail.com',
            'admission_open' => 'true',
            'admission_start_date' => '2027-01-01',
            'admission_end_date' => '2027-06-30',
            'registration_fee' => 'Rp 100.000',
            'ppdb_form_fee' => 'Rp 100.000',
            'bank_account_info' => 'Bank Syariah Indonesia (BSI) - 7122107207 a.n. Rumi Salam Muhaimin',
            'ppdb_fee_structure' => json_encode($defaultFees),
        ];

        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 3. Seed School Profile (Official Hand Out Book)
        $officialMisi = "1. Meletakkan dasar-dasar agama Islam sejak dini\n2. Membiasakan berperilaku dan bertutur kata yang baik\n3. Meletakkan dasar-dasar calistung (baca-tulis-hitung) sesuai tahapan usia perkembangan\n4. Mengenalkan anak dengan sains sederhana";

        $officialGoals = "1. Menumbuhkan keimanan & ketakwaan sesuai Al-Qur'an dan As-Sunnah\n2. Menanamkan rasa cinta pada Al-Qur'an dan mengamalkannya sehari-hari\n3. Menumbuhkan karakter Islami melalui adab-adab sederhana ala Rasulullah\n4. Mengembangkan potensi moral & nilai agama (akhlak), sosial emosional, dan kemandirian\n5. Mengembangkan kemampuan kognitif, bahasa, fisik/motorik\n6. Mengembangkan kreativitas dan seni\n7. Mengembangkan kecakapan hidup\n8. Menumbuhkan karakter cinta lingkungan\n9. Membiasakan anak senang belajar\n10. Menyiapkan anak memasuki jenjang SD";

        $officialSkl = "1. Berakhlakul karimah (adab Islami sesuai sunnah Rasulullah)\n2. Mandiri memenuhi kebutuhan diri\n3. Bertanggung jawab terhadap teman\n4. Melaksanakan tata tertib sesuai usia\n5. Kemampuan kognitif dasar (hafal Juz 30, Hadits Shohih, doa harian, lulus UMMI jilid 4, baca buku cerita sederhana, menulis kata sederhana, hitung dasar, berpikir logis-kritis)\n6. Inisiatif bersikap (mengemukakan ide sederhana)\n7. Kemampuan berbahasa\n8. Ketuntasan fisik motorik (kasar & halus)";

        $profiles = [
            'history' => 'KB-TK IT Taman Robbani didirikan pada tahun 2015 dengan visi mencetak generasi unggul, berakhlak mulia, cerdas, dan mandiri berlandaskan nilai-nilai Islam Terpadu. Kami terus berinovasi mendampingi tumbuh kembang ananda secara holistik.',
            'vision' => 'Menciptakan Generasi Robbani Sejak Dini',
            'mission' => $officialMisi,
            'goals' => $officialGoals,
            'grad_competencies' => $officialSkl,
            'welcome_message' => 'Selamat datang di PPDB Online KB-TK IT Taman Robbani Sidoarjo. Kami berkomitmen memberikan layanan pendidikan anak usia dini terbaik dengan kurikulum Islami terpadu.',
        ];

        foreach ($profiles as $key => $val) {
            SchoolProfile::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 3.1. Seed 44 Curriculum Programs (Hand Out Book Section C - E)
        $curriculumPrograms = [
            // I. Program Sekolah (18 items)
            ['category' => 'sekolah', 'title' => 'Masa Pengenalan Sekolah (MPLS)', 'description' => 'Pengenalan lingkungan & budaya sekolah, membentuk karakter, melatih kemandirian, membiasakan adab harian Islami.', 'time_allocation' => '2 pekan pertama awal ajaran baru (Juli)', 'order' => 1],
            ['category' => 'sekolah', 'title' => 'Sosialisasi Program & Pembelajaran', 'description' => 'Silaturahim awal ortu: samakan visi-misi, paparkan program, pembagian seragam & peralatan.', 'time_allocation' => 'Menjelang tahun ajaran baru', 'order' => 2],
            ['category' => 'sekolah', 'title' => 'Parenting Skill', 'description' => 'Pelatihan/seminar untuk wali santri & asatidz soal mendidik anak secara bijak & islami.', 'time_allocation' => 'Oktober', 'order' => 3],
            ['category' => 'sekolah', 'title' => 'P5 (Projek Penguatan Profil Pelajar Pancasila)', 'description' => 'Rangkaian kegiatan menyelesaikan projek sederhana yang menumbuhkan gotong royong dan kemandirian.', 'time_allocation' => '1x per semester', 'order' => 4],
            ['category' => 'sekolah', 'title' => 'Outing Class', 'description' => 'Edukasi & pengenalan alam di luar sekolah.', 'time_allocation' => 'Pertengahan semester 2', 'order' => 5],
            ['category' => 'sekolah', 'title' => 'Ramadhan Kids', 'description' => 'Tarhib Ramadhan, buka puasa bersama, dan amaliyah Ramadhan berkah.', 'time_allocation' => 'Jelang & selama Ramadhan', 'order' => 6],
            ['category' => 'sekolah', 'title' => 'Latihan Sholat Idul Adha', 'description' => 'Media belajar sholat ied dan edukasi kurban sejak dini.', 'time_allocation' => 'Bulan Dzulhijjah', 'order' => 7],
            ['category' => 'sekolah', 'title' => 'Mading Santri dan Guru', 'description' => 'Majalah dinding untuk asah kreativitas santri & guru.', 'time_allocation' => 'Sebulan sekali', 'order' => 8],
            ['category' => 'sekolah', 'title' => 'Tugas Liburan', 'description' => 'Tugas belajar mandiri di rumah (mis. muroja\'ah dan pembiasaan adab).', 'time_allocation' => 'Setiap libur panjang', 'order' => 9],
            ['category' => 'sekolah', 'title' => 'Makan Sehat', 'description' => 'Kenalkan makanan bergizi seimbang, latih suka sayur & kemandirian makan.', 'time_allocation' => 'Jum\'at pekan ke-3', 'order' => 10],
            ['category' => 'sekolah', 'title' => 'Kunjungan Perpustakaan', 'description' => 'Kunjungan terjadwal per kelas untuk memupuk kecintaan membaca buku.', 'time_allocation' => 'Setiap hari terjadwal', 'order' => 11],
            ['category' => 'sekolah', 'title' => 'Bina Karakter (TK B)', 'description' => 'Latihan kemandirian dan kepemimpinan persiapan TK B menuju jenjang SD.', 'time_allocation' => '1x setahun', 'order' => 12],
            ['category' => 'sekolah', 'title' => 'Akhirussanah', 'description' => 'Pelepasan dan wisuda santri KB dan TK B.', 'time_allocation' => 'Juni', 'order' => 13],
            ['category' => 'sekolah', 'title' => 'PPDB', 'description' => 'Program penerimaan & seleksi calon santri baru.', 'time_allocation' => 'Oktober s.d Juni', 'order' => 14],
            ['category' => 'sekolah', 'title' => 'Komunikasi Interaktif', 'description' => 'Komunikasi guru kelas dan orang tua mengenai perkembangan ananda.', 'time_allocation' => '2 bulan sekali', 'order' => 15],
            ['category' => 'sekolah', 'title' => 'Ekstrakurikuler Terjadwal', 'description' => 'Kegiatan tambahan pengembangan bakat dan minat pilihan anak.', 'time_allocation' => 'Jum\'at pekan 1 & 2', 'order' => 16],
            ['category' => 'sekolah', 'title' => 'Puncak Topik', 'description' => 'Penguatan tema dan pameran karya setiap topik pembelajaran selesai.', 'time_allocation' => 'Setiap topik selesai', 'order' => 17],
            ['category' => 'sekolah', 'title' => 'Laporan Perkembangan Anak (LPA)', 'description' => 'Laporan capaian perkembangan anak komprehensif per semester.', 'time_allocation' => 'Semester 1: Des; Semester 2: Juni', 'order' => 18],

            // II. Program Kelas (11 items)
            ['category' => 'kelas', 'title' => 'Buku Penghubung', 'description' => 'Buku harian santri, monitoring aktivitas sekolah-rumah (guru & ortu).', 'time_allocation' => 'Setiap hari', 'order' => 1],
            ['category' => 'kelas', 'title' => 'Home Visit', 'description' => 'Kunjungan berkala pantau perkembangan anak & pererat silaturahim guru-ortu.', 'time_allocation' => 'Insidentil', 'order' => 2],
            ['category' => 'kelas', 'title' => 'Cooking Time', 'description' => 'Stimulasi life skill dan kreativitas olah makanan ramah anak.', 'time_allocation' => 'Jum\'at pekan ke-4', 'order' => 3],
            ['category' => 'kelas', 'title' => 'Infaq Harian', 'description' => 'Membiasakan santri gemar berinfaq dan peduli sesama sejak dini.', 'time_allocation' => 'Setiap hari', 'order' => 4],
            ['category' => 'kelas', 'title' => 'Pendampingan Adab Makan', 'description' => 'Kontrol adab, doa, dan ketertiban makan saat istirahat.', 'time_allocation' => 'Setiap hari', 'order' => 5],
            ['category' => 'kelas', 'title' => 'Tabungan Santri', 'description' => 'Menumbuhkan jiwa suka menabung dan berhemat.', 'time_allocation' => '2x sepekan', 'order' => 6],
            ['category' => 'kelas', 'title' => 'Morning Motivation / Activity', 'description' => 'Kegiatan bermain pagi untuk stimulasi keceriaan dan perkembangan anak.', 'time_allocation' => 'Setiap hari', 'order' => 7],
            ['category' => 'kelas', 'title' => 'Outdoor Class Concept', 'description' => 'Konsep belajar mengeksplorasi lingkungan di luar kelas.', 'time_allocation' => 'Insidentil', 'order' => 8],
            ['category' => 'kelas', 'title' => 'Fisik Motorik & Permainan Tradisional', 'description' => 'Latih perkembangan motorik kasar dan ketangkasan anak.', 'time_allocation' => 'Setiap hari', 'order' => 9],
            ['category' => 'kelas', 'title' => 'Literasi Cilik', 'description' => 'Membaca & bercerita, latih kecakapan berbahasa dan imajinasi positif.', 'time_allocation' => 'Jum\'at pekan 1 & 3', 'order' => 10],
            ['category' => 'kelas', 'title' => 'Lomba Menghias Kelas', 'description' => 'Kompetisi tata ruang, ketertiban, kebersihan, dan kerapian kelas.', 'time_allocation' => 'Awal semester 1', 'order' => 11],

            // III. Program Akhlakul Karimah (6 items)
            ['category' => 'akhlak', 'title' => 'Pembiasaan Adab Islami Sehari-hari', 'description' => 'Pendidikan karakter, tanamkan adab islami (salam, senyum, terima kasih, minta tolong).', 'time_allocation' => 'Setiap hari', 'order' => 1],
            ['category' => 'akhlak', 'title' => 'Fiqih Ibadah (Wudhu & Sholat)', 'description' => 'Praktik langsung tata cara wudhu dan sholat berjamaah.', 'time_allocation' => 'Setiap Jum\'at', 'order' => 2],
            ['category' => 'akhlak', 'title' => 'Penyambutan & Pemulangan Santri', 'description' => 'Sambut dan dampingi anak dengan ramah saat datang dan pulang sekolah.', 'time_allocation' => 'Setiap hari', 'order' => 3],
            ['category' => 'akhlak', 'title' => 'Cek Kedisiplinan', 'description' => 'Penerapan kedisiplinan waktu, seragam, dan tata tertib sekolah.', 'time_allocation' => 'Setiap hari', 'order' => 4],
            ['category' => 'akhlak', 'title' => 'Cek Kebersihan & Kerapian Kelas', 'description' => 'Penerapan budaya membuang sampah pada tempatnya dan merapikan mainan.', 'time_allocation' => 'Setiap hari', 'order' => 5],
            ['category' => 'akhlak', 'title' => 'Cek Kebersihan Diri', 'description' => 'Pemeriksaan kebersihan kuku, rambut, dan kerapian diri santri.', 'time_allocation' => 'Setiap Jum\'at', 'order' => 6],

            // IV. Program Al-Qur'an (8 items)
            ['category' => 'quran', 'title' => 'Kontrol & Evaluasi UMMI dan Tahfidz', 'description' => 'Mengontrol kualitas pembelajaran Al-Qur\'an & ketepatan bacaan santri.', 'time_allocation' => 'Setiap bulan', 'order' => 1],
            ['category' => 'quran', 'title' => 'Tes Kenaikan Jilid dan Surat', 'description' => 'Evaluasi berkala kenaikan jilid metode UMMI dan target surat.', 'time_allocation' => 'Setiap hari', 'order' => 2],
            ['category' => 'quran', 'title' => 'Remedial UMMI dan Tahfidz', 'description' => 'Pendampingan khusus pemantapan materi sebelum naik jilid.', 'time_allocation' => 'Setiap hari', 'order' => 3],
            ['category' => 'quran', 'title' => 'Pra-Munaqosah UMMI dan Tahfidz', 'description' => 'Seleksi kualitas bacaan, langkah awal sebelum munaqosah resmi.', 'time_allocation' => 'April', 'order' => 4],
            ['category' => 'quran', 'title' => 'Munaqosah UMMI dan Tahfidz', 'description' => 'Ujian sertifikasi bacaan Al-Qur\'an tingkat eksternal bersama UMMI Foundation.', 'time_allocation' => 'Mei', 'order' => 5],
            ['category' => 'quran', 'title' => 'Hubbul Qur\'an', 'description' => 'Pertanggungjawaban terbuka ke wali santri mengenai capaian hafalan dan tilawah.', 'time_allocation' => 'Maret', 'order' => 6],
            ['category' => 'quran', 'title' => 'Pemilihan Santri Terbaik (UMMI & Tahfidz)', 'description' => 'Apresiasi dan kompetisi prestasi bidang Al-Qur\'an.', 'time_allocation' => 'Saat Hubbul Qur\'an', 'order' => 7],
            ['category' => 'quran', 'title' => 'Takhosus Al-Qur\'an', 'description' => 'Kelas percepatan tahfidz untuk santri yang melampaui target standar.', 'time_allocation' => 'Setiap hari', 'order' => 8],

            // V. Program UKS (1 item)
            ['category' => 'uks', 'title' => 'Cek Tumbuh Kembang Anak', 'description' => 'Pemeriksaan dan kontrol berat badan, tinggi badan, lingkar kepala, dan kesehatan fisik anak secara berkala.', 'time_allocation' => 'Sebulan sekali (Jum\'at pekan ke-3)', 'order' => 1],
        ];

        CurriculumProgram::truncate();
        foreach ($curriculumPrograms as $item) {
            CurriculumProgram::create($item);
        }

        // 3.2. Seed Extracurriculars
        $extracurriculars = [
            // KB
            ['level' => 'KB', 'name' => 'Gardening', 'order' => 1],
            ['level' => 'KB', 'name' => '3K (Kekuatan, Ketangkasan, Keseimbangan)', 'order' => 2],
            ['level' => 'KB', 'name' => 'Tilawah Cilik', 'order' => 3],

            // TK
            ['level' => 'TK', 'name' => 'Menari Islami', 'order' => 1],
            ['level' => 'TK', 'name' => 'Bahasa Inggris', 'order' => 2],
            ['level' => 'TK', 'name' => 'Mewarnai & Seni', 'order' => 3],
            ['level' => 'TK', 'name' => 'Musik & Perkusi', 'order' => 4],
            ['level' => 'TK', 'name' => 'Komputer Cilik', 'order' => 5],
        ];

        Extracurricular::truncate();
        foreach ($extracurriculars as $ekskul) {
            Extracurricular::create($ekskul);
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
            Faq::firstOrCreate(['question' => $faq['question']], $faq);
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
            Announcement::firstOrCreate(['title' => $ann['title']], $ann);
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
            Slider::firstOrCreate(['title' => $slide['title']], $slide);
        }

        // 7. Seed News Articles
        $news = [
            [
                'title' => 'Kegiatan Outbound Edukatif KB-TK IT Taman Robbani Sidoarjo',
                'slug' => 'kegiatan-outbound-edukatif-kb-tk-it-taman-robbani-sidoarjo',
                'content' => '<p>Pada tanggal 15 Mei kemarin, seluruh siswa KB-TK IT Taman Robbani Sidoarjo mengikuti outbound seru di Pacet. Kegiatan ini bertujuan melatih motorik kasar, keberanian, kemandirian, dan kerjasama tim sejak dini. Berbagai permainan tali, rintangan bambu, dan susur sungai kecil diikuti siswa dengan sangat antusias didampingi ustadzah dan instruktur profesional.</p>',
                'image' => 'news_outbound.jpg',
                'content_type' => 'image',
                'is_published' => true,
                'seo_title' => 'Outbound Seru KB-TK IT Taman Robbani Sidoarjo',
                'seo_description' => 'Keseruan outbound edukatif luar ruangan siswa KB-TK IT Taman Robbani Sidoarjo di Pacet untuk melatih motorik kasar dan kerjasama.',
            ],
            [
                'title' => 'Peringatan Hari Anak Nasional: Menggambar Masa Depan',
                'slug' => 'peringatan-hari-anak-nasional-menggambar-masa-depan',
                'content' => '<p>Sekolah memperingati Hari Anak Nasional dengan menggelar lomba menggambar bersama orang tua. Kegiatan ini dirancang untuk merekatkan ikatan emosional (bonding) orang tua dengan anak sekaligus memfasilitasi ekspresi seni visual siswa. Selamat hari anak!</p>',
                'image' => 'news_harianak.jpg',
                'content_type' => 'image',
                'is_published' => true,
                'seo_title' => 'Hari Anak Nasional di KB-TK IT Taman Robbani',
                'seo_description' => 'Kegiatan mewarnai dan menggambar bersama orang tua di KB-TK IT Taman Robbani Sidoarjo memperingati Hari Anak Nasional.',
            ],
        ];

        foreach ($news as $n) {
            News::updateOrCreate(['slug' => $n['slug']], $n);
        }

        // 8. Seed Gallery
        $galleries = [
            ['title' => 'Ruang Kelas TK-A yang Luas dan Nyaman', 'image' => 'gallery_class.jpg', 'category' => 'fasilitas', 'caption' => 'Kelas dilengkapi AC, karpet pengaman, dan mainan edukatif.'],
            ['title' => 'Kegiatan Sholat Dhuha Berjamaah', 'image' => 'gallery_sholat.jpg', 'category' => 'kegiatan', 'caption' => 'Membiasakan ibadah sunnah harian sejak dini.'],
            ['title' => 'Peralatan Edukasi Motorik Luar Ruangan', 'image' => 'gallery_playground.jpg', 'category' => 'fasilitas', 'caption' => 'Area bermain outdoor dengan rumput sintetis higienis.'],
        ];

        foreach ($galleries as $g) {
            Gallery::firstOrCreate(['title' => $g['title']], $g);
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
        if (Pendaftar::count() === 0) {
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
}
