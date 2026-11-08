# Villa Permai

Halaman web pemesanan vila untuk usaha keluarga Pak Hendra di kawasan Puncak, Kabupaten Bogor. Halaman ini statis (HTML, CSS, JavaScript) tanpa server dan tanpa basis data.

Pengerja: Falza Yahya
Mata kuliah: Teknologi Web, UTS

## Fitur

- Tiga vila dirender dari array objek JavaScript memakai `createElement` dan `appendChild`.
- Status ketersediaan pada kartu berubah mengikuti tanggal yang diisi di formulir.
- Cari vila berdasarkan nama, lokasi, atau fasilitas, urutkan berdasarkan harga atau kapasitas, dan saring hanya yang tersedia.
- Ringkasan biaya muncul otomatis sebelum tombol "Pesan Sekarang" ditekan.
- Deteksi bentrok jadwal, termasuk terhadap pesanan yang dibuat pengunjung sendiri.
- Validasi berbahasa Indonesia dan penanganan error tanpa membuat halaman crash.
- Penyimpanan lokal (`localStorage`): nama tamu terakhir, daftar pesanan, vila favorit, dan pilihan tema.
- Konfirmasi pesanan lewat tautan WhatsApp ke pemilik.
- Mode terang dan gelap, responsif pada layar 768px dan 480px.

## Rumus total biaya

```
sewa           = harga per malam x jumlah malam
akhir pekan    = harga per malam x 15% x jumlah malam Jumat dan Sabtu
tamu tambahan  = (jumlah tamu - 4) x Rp75.000 x jumlah malam   (hanya jika tamu lebih dari 4)
diskon         = (sewa + akhir pekan) x 10%                    (hanya jika menginap 3 malam atau lebih)

total          = sewa + akhir pekan + tamu tambahan - diskon
```

Harga sewa berlaku per unit vila, bukan per orang. Satu vila punya batas kapasitas sendiri, dan pemesanan melebihi kapasitas ditolak dengan pesan yang jelas.

## Struktur folder

```
uts-vila-permai/
  index.html
  style.css
  script.js
  README.md
  .gitignore
  assets/
    vila-1.jpg
    vila-2.jpg
    vila-3.jpg
```

Foto vila sudah tersedia secara lokal agar kartu dan bagian hero tidak kosong saat halaman dibuka. Foto diunduh dari Unsplash dan digunakan sesuai [lisensi Unsplash](https://unsplash.com/license):

- [Foto Villa Kabut Pinus](https://images.unsplash.com/photo-1600596542815-ffad4c1539a9)
- [Foto Villa Lembah Teh](https://images.unsplash.com/photo-1613490493576-7fde63acd811)
- [Foto Villa Senja Gunung](https://images.unsplash.com/photo-1613977257363-707ba9348227)

## Cara menjalankan

Buka `index.html` langsung di peramban, atau gunakan ekstensi Live Server di VS Code. Tidak ada proses build dan tidak ada dependensi.

## Tangkapan layar

Tambahkan tangkapan layar ke folder `assets` lalu tampilkan di sini:

```
![Beranda](assets/screenshot-beranda.png)
![Formulir dan ringkasan biaya](assets/screenshot-pesan.png)
![Tampilan ponsel](assets/screenshot-mobile.png)
```

## Riwayat commit yang disarankan

1. `Buat struktur folder dan kerangka HTML`
2. `Tambah gaya, tata letak responsif, dan tema`
3. `Tambah data vila, render kartu, pencarian, dan filter`
4. `Tambah perhitungan biaya, validasi, dan penyimpanan lokal`
5. `Rapikan README dan tambah tangkapan layar`