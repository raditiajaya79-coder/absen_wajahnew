# Ringkasan Fitur Proyek Absensi Wajah

Proyek "Absen Wajah" adalah sistem absensi biometrik berbasis web yang menggunakan pengenalan wajah untuk mencatat kehadiran. Proyek ini dirancang dengan antarmuka pengguna yang modern dan responsif, serta dilengkapi dengan dashboard admin untuk pengelolaan data.

Berikut adalah ringkasan fitur-fitur utama:

## 1. Halaman Utama (Landing Page)
*   *Desain Modern dan Responsif:* Antarmuka yang menarik dengan efek visual seperti latar belakang grid dan animasi fadeInScaleUp serta fadeInTranslateUp untuk elemen judul dan tombol.
*   *Akses Cepat:* Tombol langsung menuju "Dashboard Admin" dan "Absensi Wajah" untuk navigasi yang mudah.
*   *Logo Branding:* Menampilkan logo SMK PGRI 1 Kediri.

## 2. Dashboard Admin
*   *Tampilan Ringkasan (Overview):*
    *   Menampilkan tanggal dan waktu saat ini.
    *   Statistik absensi harian: jumlah yang sudah absen, terlambat, dan belum absen.
    *   Total wajah terdaftar.
    *   Data diperbarui secara real-time.
*   *Grafik Interaktif:*
    *   *Rasio Kehadiran (Doughnut Chart):* Visualisasi persentase kehadiran (tepat waktu, terlambat, belum absen).
    *   *Distribusi Pengguna (Bar Chart):* Menampilkan jumlah wajah terdaftar berdasarkan peran (Siswa, Guru, Staff, Lainnya).
*   *Detail Absensi:*
    *   Daftar pengguna yang sudah absen hari ini, lengkap dengan waktu dan status (tepat waktu/terlambat).
    *   Daftar pengguna yang belum absen hari ini.
    *   Fungsionalitas "Lihat Semua" dan "Tutup" untuk menampilkan/menyembunyikan daftar lengkap dengan scrollbar tersembunyi.
*   *Navigasi Sidebar:* Menu navigasi ke Dashboard, Daftar Wajah, dan Registrasi Wajah.
*   *Tombol Export Data:* Tombol untuk mengekspor semua data (fungsionalitas global).
*   *Logout:* Tombol untuk keluar dari sesi admin.
*   *Tabbed Interface:* Memungkinkan perpindahan antara "Ringkasan", "Absensi Detail", dan "Pengaturan" (konten "Absensi Detail" dan "Pengaturan" masih placeholder).

## 3. Registrasi Wajah
*   *Formulir Pendaftaran:*
    *   Input untuk Nama Lengkap, ID (NIS/NIP/NIK), dan Role (Siswa, Guru, Staff, Lainnya).
    *   Pilihan jenis jadwal: Default (Otomatis) atau Atur Khusus.
    *   Jika "Atur Khusus" dipilih, input untuk Jam Datang dan Jam Pulang akan muncul.
*   *Pengambilan Foto Wajah:*
    *   Integrasi kamera web untuk mengambil foto wajah secara langsung.
    *   Tombol "Ambil Foto" untuk menangkap gambar.
*   *Pesan Status:* Menampilkan pesan keberhasilan atau kegagalan registrasi.
*   *Navigasi Sidebar:* Menu navigasi ke Dashboard, Daftar Wajah, dan Registrasi Wajah.
*   *Logout:* Tombol untuk keluar.

## 4. Daftar Wajah Terdaftar
*   *Pencarian dan Penyortiran:*
    *   Input pencarian untuk mencari wajah berdasarkan nama atau ID.
    *   Opsi penyortiran berdasarkan Nama (A-Z, Z-A) dan ID (Asc, Desc).
*   *Tampilan Daftar Wajah:* Menampilkan kartu-kartu wajah yang terdaftar, masing-masing dengan foto, nama, ID, dan peran.
*   *Aksi pada Wajah:*
    *   *Edit:* Membuka modal untuk mengedit data wajah (Nama Lengkap, Role, Jadwal Khusus). ID tidak dapat diubah.
    *   *Hapus:* Menghapus data wajah tertentu.
*   *Export Data:* Tombol untuk mengekspor data wajah ke format JSON.
*   *Hapus Semua:* Tombol untuk menghapus semua data wajah terdaftar.
*   *Pesan Kosong:* Menampilkan pesan jika belum ada wajah terdaftar.
*   *Navigasi Sidebar:* Menu navigasi ke Dashboard, Daftar Wajah, dan Registrasi Wajah.
*   *Logout:* Tombol untuk keluar.

## 5. Absensi Wajah (Halaman Pengguna)
*   *Tampilan Real-time:* Menampilkan jam dan tanggal saat ini secara real-time.
*   *Deteksi Wajah:*
    *   Menggunakan kamera web untuk mendeteksi wajah.
    *   Overlay "MEMINDAI..." saat sistem sedang memproses.
*   *Status Verifikasi:*
    *   Menampilkan status sistem (SISTEM SIAP, Menunggu deteksi, Terdeteksi, Gagal, Tidak Dikenal).
    *   Menampilkan data pengguna yang terdeteksi: Nama Pegawai, ID Karyawan, Waktu Absen, Tanggal Absen, dan Keterangan Absen (Hadir, Terlambat, Pulang).
*   *Absen Manual:*
    *   Tombol untuk mengaktifkan/menyembunyikan bagian absen manual.
    *   Input untuk memasukkan ID/NIS secara manual.
    *   Tombol "Absen Sekarang" untuk mencatat kehadiran secara manual.
    *   Sistem akan memeriksa jadwal (default atau khusus) untuk menentukan status absensi (Hadir, Terlambat, Pulang).
*   *Logout:* Tombol untuk kembali ke halaman utama.

## Teknologi yang Digunakan
*   *Frontend:* HTML, CSS (Tailwind CSS), JavaScript.
*   *Grafik:* Chart.js untuk visualisasi data.
*   *Penyimpanan Data:* localStorage untuk menyimpan data wajah terdaftar dan catatan absensi.
*   *Pengenalan Wajah:* Saat ini menggunakan metode perbandingan signature (array piksel grayscale) untuk deteksi wajah. Ekstraksi embedding wajah disimulasikan.

Proyek ini menyediakan solusi lengkap untuk sistem absensi berbasis pengenalan wajah dengan fitur administrasi dan pelaporan yang memadai.
