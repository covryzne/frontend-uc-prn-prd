# Panduan Menjalankan Frontend (Step-by-Step)

Dokumen ini menjelaskan cara menjalankan aplikasi frontend di folder `frontend` secara detail, dari instalasi sampai menjalankan mode development, build production, dan test.

## 1. Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js versi 18 atau lebih baru (disarankan 20 LTS)
- npm (otomatis ikut saat instal Node.js)
- Opsional: Bun jika ingin memakai Bun sebagai package manager

Cek versi yang terpasang:

```bash
node -v
npm -v
```

Jika ingin pakai Bun:

```bash
bun -v
```

## 2. Masuk ke Folder Frontend

Dari root project (`mvp`), jalankan:

```bash
cd frontend
```

## 3. Install Dependency

Pilih salah satu package manager berikut.

### Opsi A (Direkomendasikan): npm

```bash
npm install
```

### Opsi B: Bun

```bash
bun install
```

Catatan:

- Di project ini ada `package-lock.json` dan `bun.lockb`, jadi keduanya bisa dipakai.
- Konsisten gunakan satu package manager dalam satu sesi kerja agar lockfile tidak sering berubah.

## 4. Jalankan Frontend (Development)

### Dengan npm

```bash
npm run dev
```

### Dengan Bun

```bash
bun run dev
```

Setelah berhasil, aplikasi berjalan di:

- `http://localhost:443`

Port default ini mengikuti konfigurasi Vite pada `frontend/vite.config.ts`.

## 5. Build untuk Production

### Dengan npm

```bash
npm run build
```

### Dengan Bun

```bash
bun run build
```

Hasil build akan dibuat di folder `frontend/dist`.

## 6. Preview Hasil Build Production

### Dengan npm

```bash
npm run preview
```

### Dengan Bun

```bash
bun run preview
```

## 7. Menjalankan Lint dan Test

### Lint

```bash
npm run lint
```

### Test sekali jalan

```bash
npm run test
```

### Test mode watch

```bash
npm run test:watch
```

Jika memakai Bun, ganti `npm run` menjadi `bun run`.

## 8. Script yang Tersedia

Script pada `frontend/package.json`:

- `dev`: menjalankan Vite dev server
- `build`: build production
- `build:dev`: build mode development
- `preview`: preview hasil build
- `lint`: pengecekan ESLint
- `test`: menjalankan test (Vitest) sekali jalan
- `test:watch`: menjalankan test mode watch

## 9. Troubleshooting Umum

### Port 443 sudah dipakai

Solusi cepat:

1. Matikan proses yang memakai port `443`, atau
2. Jalankan dev server di port lain:

```bash
npm run dev -- --port 444
```

### Dependency bermasalah / install gagal

Langkah bersih-bersih (npm):

```bash
rm -rf node_modules package-lock.json
npm install
```

Untuk Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Halaman kosong atau error setelah update dependency

1. Hapus `node_modules`
2. Install ulang dependency
3. Jalankan ulang `npm run dev`

## 10. Ringkasan Cepat (npm)

```bash
cd frontend
npm install
npm run dev
```

Selesai. Frontend siap dipakai di `http://localhost:443`.
