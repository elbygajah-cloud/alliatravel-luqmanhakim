# 🕋 ALLIA TOUR & TRAVEL
## Website Resmi Penyelenggara Umroh Sesuai Sunnah

Website profesional untuk pendaftaran dan pengelolaan paket umroh, dilengkapi Panel Admin penuh kendali serta basis data Firebase.

---

## ✨ Fitur Utama
✅ Tampilan elegan, mewah, dan ramah seluler (HP & Komputer)
✅ Halaman utama, daftar paket, keunggulan, galeri, formulir pendaftaran
✅ **Panel Admin Penuh Kendali**:
  - Tambah, Ubah, Hapus Paket Umroh
  - Lihat & Kelola Data Pendaftar Jamaah
  - Kelola Galeri Foto Dokumentasi
✅ Basis Data: Firebase Firestore
✅ Siap tayang di GitHub Pages

---

## 🚀 Cara Memasang & Menjalankan

### 1. Persiapan Berkas
Pastikan di repositori GitHub Bapak ada 1 berkas utama:
- 📄 `index.html` → Seluruh kode tampilan & fungsi situs

### 2. Pengaturan Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat proyek baru / pakai yang sudah ada: **`alliatravel`**
3. Aktifkan **Firestore Database**
4. **Ganti Aturan / Rules** menjadi seperti ini agar lancar:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
