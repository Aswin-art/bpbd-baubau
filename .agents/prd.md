# Product Requirement Document (PRD) - Website BPBD Kota Baubau

**Versi:** 1.0  
**Status:** Draft / Ready for Development  
**Tech Stack:** Next.js 16 (App Router), shadcn/ui, Tailwind CSS, Lucide Icons  
**Design Vibe:** *Minimalist Authority* (Professional, Clean, Trustworthy)

---

## 1. Executive Summary
Website BPBD Kota Baubau bertujuan untuk menjadi portal informasi bencana yang andal, transparan, dan mudah diakses oleh warga. Fokus utama pengembangan adalah kecepatan akses (performance), kemudahan navigasi (UX), dan fitur pencarian global (Global Search) untuk data arsip dan dokumen penting.

---

## 2. Design Vibe & Branding
Untuk menghilangkan kesan kaku pada situs pemerintah, desain akan mengikuti prinsip **"Minimalist Authority"**:

*   **Palet Warna:**
    *   **Primary:** `#F97316` (Safety Orange) - Identitas BPBD & Aksi Cepat.
    *   **Secondary:** `#0F172A` (Navy Deep) - Kesan stabil, formal, dan berwibawa.
    *   **Background:** `#F8FAFC` (Slate White) - Bersih dan fokus pada konten.
*   **Tipografi:** `Geist Sans` atau `Inter` (Sans-serif) untuk keterbacaan maksimal pada dokumen SOP.
*   **Karakteristik UI:** *Subtle shadows*, *rounded corners* (0.5rem), dan penggunaan *whitespace* yang luas agar informasi tidak menumpuk.

---

## 3. Sitemap & Spesifikasi Halaman

### 3.1 Landing Page (Pusat Informasi)
*   **Hero Section:** Search Bar utama (Trigger Global Search) + Headline Visi BPBD.
*   **Emergency Alert (Sticky):** Komponen `Alert` dari shadcn untuk status siaga bencana yang muncul di paling atas.
*   **Quick Links:** Shortcut ke nomor darurat, form aspirasi, dan SOP terbaru.
*   **Latest News:** Grid 3 kolom menampilkan cuplikan berita terkini.

### 3.2 Berita (Newsroom)
*   **Features:** Filter kategori (Edukasi, Siaran Pers, Berita Utama).
*   **UI:** Kartu berita dengan gambar *thumbnail* yang bersih dan tanggal publikasi yang jelas.
*   **Detail:** Layout artikel yang fokus pada teks (Typography-first).

### 3.3 Dokumen & SOP (Repository)
*   **Interface:** `DataTable` dari shadcn dengan fitur filter instan.
*   **Data:** Nama File, Kategori (SOP/Regulasi), Tanggal, dan Tombol Download.
*   **UX:** Akses cepat untuk mengunduh dokumen publik tanpa harus login.

### 3.4 Aspirasi (Layanan Masyarakat)
*   **Tujuan:** Wadah laporan atau masukan warga terkait kebencanaan.
*   **Form Field:** Nama, Kontak, Jenis Laporan, Deskripsi, dan Lampiran Foto (Drag & Drop).
*   **Validation:** Menggunakan `Zod` untuk memastikan data yang masuk valid.

### 3.5 Arsip Bencana (Data Historis)
*   **Interface:** Tabel atau List kronologis kejadian bencana di Baubau.
*   **Search:** Filter berdasarkan Tahun dan Kecamatan/Kelurahan.
*   **Goal:** Transparansi data kejadian untuk masyarakat dan peneliti.

### 3.6 Global Search (Command Palette)
*   **Trigger:** `Ctrl + K` (Desktop) atau Ikon Search (Mobile).
*   **Scope:** Mencari di seluruh konten (Berita, Dokumen, Arsip).
*   **UI:** Modal interaktif menggunakan `Command` component shadcn.

---

## 4. Technical Stack & Architecture

| Layer | Technology | Reason |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Speed, SEO, dan Partial Pre-rendering (PPR). |
| **Styling** | Tailwind CSS | Kustomisasi desain "Clean" dengan cepat. |
| **UI Components** | shadcn/ui | Berbasis Radix UI yang sangat *accessible* (WCAG compliant). |
| **Icons** | Lucide React | Ikonografi modern dan ringan. |
| **Form Handling** | React Hook Form + Zod | Validasi input yang *robust* dan aman. |
| **Performance** | Image Optimization | Otomatis optimasi foto kegiatan BPBD. |

---

## 5. Non-Functional Requirements (Kualitas)

1.  **Mobile First:** Navigasi harus optimal untuk layar smartphone (jempol-friendly).
2.  **Performance:** Skor Lighthouse (Performance, Accessibility, SEO) minimal 90+.
3.  **Security:** Proteksi terhadap *spam* pada form Aspirasi dan enkripsi data pelapor.
4.  **Accessibility:** Kontras warna dan navigasi keyboard harus memenuhi standar situs publik.

---

## 6. Development Roadmap

*   **Fase 1:** Setup Project, Theme Configuration, & Landing Page.
*   **Fase 2:** Integrasi CMS untuk Berita dan Dokumen & SOP.
*   **Fase 3:** Pengembangan fitur Aspirasi, Arsip Bencana, dan Global Search.
*   **Fase 4:** Final QA, SEO Optimization, dan Launching.