"use strict";

const KUNCI_PESANAN = "vp:pesanan";
const KUNCI_NAMA = "vp:nama";
const KUNCI_FAVORIT = "vp:favorit";
const KUNCI_TEMA = "vp:tema";
const NOMOR_PEMILIK = "6281234567890";
const BATAS_TAMU_DASAR = 4;
const BIAYA_TAMU_TAMBAHAN = 75000;
const PERSEN_AKHIR_PEKAN = 0.15;
const PERSEN_DISKON = 0.1;
const MINIMAL_MALAM_DISKON = 3;

const hariDariSekarang = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

const DATA_VILA = [
  {
    id: "kabut-pinus",
    nama: "Villa Kabut Pinus",
    tipe: "Villa 3 kamar tidur",
    lokasi: "Cisarua, Puncak",
    harga: 1850000,
    kapasitas: 8,
    fasilitas: ["Kolam renang air hangat", "Dapur lengkap", "Gazebo BBQ", "Wi-Fi cepat"],
    foto: "assets/vila-1.jpg",
    terpesan: [[3, 5], [12, 15]]
  },
  {
    id: "lembah-teh",
    nama: "Villa Lembah Teh",
    tipe: "Villa 2 kamar tidur",
    lokasi: "Ciawi, Puncak",
    harga: 1250000,
    kapasitas: 5,
    fasilitas: ["Pemandangan kebun teh", "Pemanas air", "Perapian", "Parkir 2 mobil"],
    foto: "assets/vila-2.jpg",
    terpesan: [[1, 4], [9, 11]]
  },
  {
    id: "senja-gunung",
    nama: "Villa Senja Gunung",
    tipe: "Villa 4 kamar tidur",
    lokasi: "Megamendung, Puncak",
    harga: 2400000,
    kapasitas: 10,
    fasilitas: ["Kolam renang pribadi", "Ruang karaoke", "Taman luas", "Pengelola 24 jam"],
    foto: "assets/vila-3.jpg",
    terpesan: [[6, 8], [20, 24]]
  }
];

const elemen = {
  daftarVila: document.getElementById("daftarVila"),
  kataKunci: document.getElementById("kataKunci"),
  urutan: document.getElementById("urutan"),
  hanyaTersedia: document.getElementById("hanyaTersedia"),
  form: document.getElementById("formPesan"),
  nama: document.getElementById("nama"),
  unit: document.getElementById("unitVila"),
  checkin: document.getElementById("checkin"),
  checkout: document.getElementById("checkout"),
  tamu: document.getElementById("tamu"),
  tombolCek: document.getElementById("tombolCek"),
  hasil: document.getElementById("areaHasil"),
  pesanan: document.getElementById("daftarPesanan"),
  toast: document.getElementById("toast"),
  tema: document.getElementById("tombolTema")
};

const buat = (tag, kelas, teks) => {
  const node = document.createElement(tag);
  if (kelas) node.className = kelas;
  if (teks !== undefined) node.textContent = teks;
  return node;
};

const rupiah = (angka) => "Rp" + Math.round(angka).toLocaleString("id-ID");

const keISO = (tanggal) => {
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return tanggal.getFullYear() + "-" + bulan + "-" + hari;
};

const dariISO = (teks) => (teks ? new Date(teks + "T00:00:00") : null);

const formatTanggal = (teks) =>
  dariISO(teks).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const hitungMalam = (masuk, keluar) => Math.round((dariISO(keluar) - dariISO(masuk)) / 86400000);

const bacaPenyimpanan = (kunci, awal) => {
  try {
    const mentah = localStorage.getItem(kunci);
    return mentah === null ? awal : JSON.parse(mentah);
  } catch (error) {
    return awal;
  }
};

const tulisPenyimpanan = (kunci, nilai) => {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (error) {
    return false;
  }
};

let pesananTersimpan = bacaPenyimpanan(KUNCI_PESANAN, []);
let favorit = bacaPenyimpanan(KUNCI_FAVORIT, []);
if (!Array.isArray(pesananTersimpan)) pesananTersimpan = [];
if (!Array.isArray(favorit)) favorit = [];

const rentangTerpesan = (vila) => {
  const bawaan = vila.terpesan.map(([mulai, selesai]) => ({
    mulai: keISO(hariDariSekarang(mulai)),
    selesai: keISO(hariDariSekarang(selesai))
  }));
  const milikTamu = pesananTersimpan
    .filter((p) => p.vilaId === vila.id)
    .map((p) => ({ mulai: p.masuk, selesai: p.keluar }));
  return bawaan.concat(milikTamu);
};

const cekKetersediaan = (vila, masuk, keluar) =>
  !rentangTerpesan(vila).some((r) => masuk < r.selesai && keluar > r.mulai);

const hitungTotalHarga = (vila, masuk, keluar, tamu) => {
  const malam = hitungMalam(masuk, keluar);
  let malamAkhirPekan = 0;
  for (let i = 0; i < malam; i++) {
    const hari = dariISO(masuk);
    hari.setDate(hari.getDate() + i);
    if (hari.getDay() === 5 || hari.getDay() === 6) malamAkhirPekan++;
  }
  const sewa = vila.harga * malam;
  const akhirPekan = vila.harga * PERSEN_AKHIR_PEKAN * malamAkhirPekan;
  const tamuTambahan = Math.max(0, tamu - BATAS_TAMU_DASAR) * BIAYA_TAMU_TAMBAHAN * malam;
  const diskon = malam >= MINIMAL_MALAM_DISKON ? (sewa + akhirPekan) * PERSEN_DISKON : 0;
  return { malam, malamAkhirPekan, sewa, akhirPekan, tamuTambahan, diskon, total: sewa + akhirPekan + tamuTambahan - diskon };
};

const ambilInput = () => ({
  nama: elemen.nama.value.trim(),
  vilaId: elemen.unit.value,
  masuk: elemen.checkin.value,
  keluar: elemen.checkout.value,
  tamu: Number(elemen.tamu.value)
});

const validasiForm = (data, { tanpaNama = false } = {}) => {
  const galat = {};
  const hariIni = keISO(hariDariSekarang(0));
  const vila = DATA_VILA.find((v) => v.id === data.vilaId);

  if (!tanpaNama && !data.nama) galat.nama = "Nama tamu wajib diisi.";
  if (!vila) galat.unit = "Pilih salah satu vila terlebih dahulu.";
  if (!data.masuk) galat.checkin = "Tanggal check-in wajib diisi.";
  else if (data.masuk < hariIni) galat.checkin = "Tanggal check-in tidak boleh di masa lalu.";
  if (!data.keluar) galat.checkout = "Tanggal check-out wajib diisi.";
  else if (data.keluar < hariIni) galat.checkout = "Tanggal check-out tidak boleh di masa lalu.";
  else if (data.masuk && data.keluar <= data.masuk) galat.checkout = "Tanggal check-out harus setelah tanggal check-in.";
  if (!Number.isInteger(data.tamu) || data.tamu < 1 || data.tamu > 10) galat.tamu = "Jumlah tamu harus antara 1 sampai 10 orang.";
  else if (vila && data.tamu > vila.kapasitas) galat.tamu = vila.nama + " maksimal untuk " + vila.kapasitas + " tamu.";
  return galat;
};

const tampilkanGalat = (galat) => {
  document.querySelectorAll("[data-error]").forEach((node) => {
    const pesan = galat[node.dataset.error] || "";
    node.textContent = pesan;
    const input = node.parentElement.querySelector(".field__input");
    if (input) input.classList.toggle("field__input--salah", Boolean(pesan));
  });
};

const tampilkanToast = (pesan) => {
  elemen.toast.textContent = pesan;
  elemen.toast.classList.add("toast--tampil");
  clearTimeout(tampilkanToast.waktu);
  tampilkanToast.waktu = setTimeout(() => elemen.toast.classList.remove("toast--tampil"), 3200);
};

const rentangTerpilih = () => {
  const { masuk, keluar } = ambilInput();
  const hariIni = keISO(hariDariSekarang(0));
  return masuk && keluar && masuk >= hariIni && keluar > masuk ? { masuk, keluar } : null;
};

const statusVila = (vila) => {
  const rentang = rentangTerpilih();
  if (rentang) {
    return cekKetersediaan(vila, rentang.masuk, rentang.keluar)
      ? { teks: "Tersedia di tanggal Anda", tersedia: true }
      : { teks: "Terisi di tanggal Anda", tersedia: false };
  }
  const hariIni = keISO(hariDariSekarang(0));
  const besok = keISO(hariDariSekarang(1));
  const sedangTerisi = cekKetersediaan(vila, hariIni, besok) === false;
  return sedangTerisi
    ? { teks: "Sedang terisi hari ini", tersedia: false }
    : { teks: "Tersedia hari ini", tersedia: true };
};

const buatKartuVila = (vila) => {
  const status = statusVila(vila);
  const kartu = buat("article", "villa-card");

  const foto = buat("div", "villa-card__foto");
  const gambar = buat("img", "villa-card__gambar");
  gambar.src = vila.foto;
  gambar.alt = "Foto " + vila.nama;
  gambar.loading = "lazy";
  gambar.addEventListener("error", () => gambar.remove());
  foto.appendChild(gambar);

  foto.appendChild(buat("span", "villa-card__status villa-card__status--" + (status.tersedia ? "tersedia" : "penuh"), status.teks));

  const tombolFav = buat("button", "villa-card__fav" + (favorit.includes(vila.id) ? " villa-card__fav--aktif" : ""), "♥");
  tombolFav.type = "button";
  tombolFav.setAttribute("aria-label", "Simpan " + vila.nama + " sebagai favorit");
  tombolFav.addEventListener("click", () => alihkanFavorit(vila.id));
  foto.appendChild(tombolFav);

  const isi = buat("div", "villa-card__isi");
  isi.appendChild(buat("h3", "villa-card__nama", vila.nama));
  isi.appendChild(buat("p", "villa-card__meta", vila.tipe + ", " + vila.lokasi + ", hingga " + vila.kapasitas + " tamu"));

  const daftarFasilitas = buat("ul", "villa-card__fasilitas");
  vila.fasilitas.forEach((f) => daftarFasilitas.appendChild(buat("li", "", f)));
  isi.appendChild(daftarFasilitas);

  const harga = buat("p", "villa-card__harga", rupiah(vila.harga));
  harga.appendChild(buat("small", "", " per malam"));
  isi.appendChild(harga);

  const aksi = buat("div", "villa-card__aksi");
  const tombolPilih = buat("button", "btn btn--utama", "Pilih vila ini");
  tombolPilih.type = "button";
  tombolPilih.addEventListener("click", () => pilihVila(vila.id));
  aksi.appendChild(tombolPilih);
  isi.appendChild(aksi);

  kartu.appendChild(foto);
  kartu.appendChild(isi);
  return kartu;
};

const urutkan = (daftar, cara) => {
  const salinan = daftar.slice();
  if (cara === "murah") salinan.sort((a, b) => a.harga - b.harga);
  if (cara === "mahal") salinan.sort((a, b) => b.harga - a.harga);
  if (cara === "besar") salinan.sort((a, b) => b.kapasitas - a.kapasitas);
  return salinan;
};

const renderVila = () => {
  const kata = elemen.kataKunci.value.trim().toLowerCase();
  let hasil = DATA_VILA.filter((v) =>
    [v.nama, v.lokasi, v.tipe, v.fasilitas.join(" ")].join(" ").toLowerCase().includes(kata)
  );
  if (elemen.hanyaTersedia.checked) hasil = hasil.filter((v) => statusVila(v).tersedia);
  hasil = urutkan(hasil, elemen.urutan.value);

  elemen.daftarVila.replaceChildren();
  if (hasil.length === 0) {
    elemen.daftarVila.appendChild(buat("p", "kosong", "Tidak ada vila yang cocok. Coba kata kunci lain atau matikan filter ketersediaan."));
    return;
  }
  hasil.forEach((v) => elemen.daftarVila.appendChild(buatKartuVila(v)));
};

const isiDropdown = () => {
  elemen.unit.replaceChildren();
  const awal = buat("option", "", "Pilih vila");
  awal.value = "";
  elemen.unit.appendChild(awal);
  DATA_VILA.forEach((v) => {
    const opsi = buat("option", "", v.nama + " (" + rupiah(v.harga) + " per malam)");
    opsi.value = v.id;
    elemen.unit.appendChild(opsi);
  });
};

const alihkanFavorit = (id) => {
  favorit = favorit.includes(id) ? favorit.filter((f) => f !== id) : favorit.concat(id);
  tulisPenyimpanan(KUNCI_FAVORIT, favorit);
  renderVila();
};

const pilihVila = (id) => {
  elemen.unit.value = id;
  perbaruiSemua();
  document.getElementById("pesan").scrollIntoView({ behavior: "smooth" });
  elemen.checkin.focus({ preventScroll: true });
};

const baris = (label, nilai, kelas) => {
  const node = buat("div", "ringkasan__baris" + (kelas ? " " + kelas : ""));
  node.appendChild(buat("span", "", label));
  node.appendChild(buat("span", "", nilai));
  return node;
};

const tampilkanPesanHasil = (teks, jenis) => {
  elemen.hasil.replaceChildren(buat("p", "ringkasan__pesan ringkasan__pesan--" + jenis, teks));
};

const tampilkanRingkasan = () => {
  const data = ambilInput();
  const vila = DATA_VILA.find((v) => v.id === data.vilaId);
  const galat = validasiForm(data, { tanpaNama: true });

  if (!vila || !rentangTerpilih() || galat.tamu) {
    elemen.hasil.replaceChildren(buat("p", "ringkasan__catatan", "Pilih vila, tanggal check-in dan check-out, serta jumlah tamu. Rincian biaya akan muncul di sini."));
    return;
  }

  const rincian = hitungTotalHarga(vila, data.masuk, data.keluar, data.tamu);
  const tersedia = cekKetersediaan(vila, data.masuk, data.keluar);
  const isi = document.createDocumentFragment();

  isi.appendChild(buat("p", "ringkasan__info", vila.nama + ", " + rincian.malam + " malam, " + data.tamu + " tamu"));
  isi.appendChild(baris(rupiah(vila.harga) + " x " + rincian.malam + " malam", rupiah(rincian.sewa)));
  if (rincian.akhirPekan > 0) isi.appendChild(baris("Akhir pekan (" + rincian.malamAkhirPekan + " malam, +15%)", rupiah(rincian.akhirPekan)));
  if (rincian.tamuTambahan > 0) isi.appendChild(baris("Tamu tambahan di atas " + BATAS_TAMU_DASAR + " orang", rupiah(rincian.tamuTambahan)));
  if (rincian.diskon > 0) isi.appendChild(baris("Diskon menginap 3 malam atau lebih (10%)", "-" + rupiah(rincian.diskon), "ringkasan__baris--diskon"));

  const total = buat("div", "ringkasan__total");
  total.appendChild(buat("span", "", "Total"));
  total.appendChild(buat("strong", "", rupiah(rincian.total)));
  isi.appendChild(total);

  isi.appendChild(
    buat("p", "ringkasan__pesan ringkasan__pesan--" + (tersedia ? "ok" : "gagal"),
      tersedia ? "Tanggal ini masih kosong. Silakan lanjutkan pemesanan." : "Maaf, vila ini sudah terisi di tanggal tersebut. Coba tanggal lain atau vila lain.")
  );
  elemen.hasil.replaceChildren(isi);
};

const perbaruiSemua = () => {
  if (elemen.checkin.value) {
    const minimal = dariISO(elemen.checkin.value);
    minimal.setDate(minimal.getDate() + 1);
    elemen.checkout.min = keISO(minimal);
  }
  renderVila();
  tampilkanRingkasan();
};

const buatKode = () => "VP-" + Date.now().toString(36).toUpperCase().slice(-6);

const linkWhatsApp = (pesanan, vila) => {
  const teks = [
    "Halo Pak Hendra, saya " + pesanan.nama + ".",
    "Saya memesan " + vila.nama + " (kode " + pesanan.kode + ").",
    "Check-in " + formatTanggal(pesanan.masuk) + ", check-out " + formatTanggal(pesanan.keluar) + ", " + pesanan.tamu + " tamu.",
    "Total " + rupiah(pesanan.total) + "."
  ].join(" ");
  return "https://wa.me/" + NOMOR_PEMILIK + "?text=" + encodeURIComponent(teks);
};

const renderPesanan = () => {
  elemen.pesanan.replaceChildren();
  if (pesananTersimpan.length === 0) {
    elemen.pesanan.appendChild(buat("p", "kosong", "Belum ada pesanan. Pilih vila lalu isi formulir untuk memulai."));
    return;
  }
  pesananTersimpan.slice().reverse().forEach((p) => {
    const vila = DATA_VILA.find((v) => v.id === p.vilaId);
    if (!vila) return;
    const tiket = buat("article", "tiket");
    tiket.appendChild(buat("p", "tiket__kode", p.kode));
    tiket.appendChild(buat("h3", "tiket__vila", vila.nama));
    tiket.appendChild(buat("p", "tiket__rincian", formatTanggal(p.masuk) + " sampai " + formatTanggal(p.keluar) + ", " + p.tamu + " tamu, atas nama " + p.nama));
    tiket.appendChild(buat("p", "tiket__total", rupiah(p.total)));

    const aksi = buat("div", "tiket__aksi");
    const wa = buat("a", "btn btn--utama", "Konfirmasi via WhatsApp");
    wa.href = linkWhatsApp(p, vila);
    wa.target = "_blank";
    wa.rel = "noopener";
    const batal = buat("button", "btn btn--ghost", "Batalkan");
    batal.type = "button";
    batal.addEventListener("click", () => batalkanPesanan(p.kode));
    aksi.appendChild(wa);
    aksi.appendChild(batal);
    tiket.appendChild(aksi);
    elemen.pesanan.appendChild(tiket);
  });
};

const batalkanPesanan = (kode) => {
  pesananTersimpan = pesananTersimpan.filter((p) => p.kode !== kode);
  tulisPenyimpanan(KUNCI_PESANAN, pesananTersimpan);
  renderPesanan();
  perbaruiSemua();
  tampilkanToast("Pesanan " + kode + " dibatalkan.");
};

const periksaKetersediaan = () => {
  const data = ambilInput();
  const galat = validasiForm(data, { tanpaNama: true });
  tampilkanGalat(galat);
  if (Object.keys(galat).length > 0) {
    tampilkanPesanHasil("Lengkapi data yang ditandai merah, lalu cek lagi.", "gagal");
    return;
  }
  const vila = DATA_VILA.find((v) => v.id === data.vilaId);
  if (cekKetersediaan(vila, data.masuk, data.keluar)) {
    tampilkanRingkasan();
    tampilkanToast(vila.nama + " tersedia di tanggal tersebut.");
  } else {
    tampilkanRingkasan();
    tampilkanToast(vila.nama + " sudah terisi di tanggal tersebut.");
  }
};

const kirimPesanan = (event) => {
  event.preventDefault();
  const data = ambilInput();
  const galat = validasiForm(data);
  tampilkanGalat(galat);
  if (Object.keys(galat).length > 0) {
    tampilkanPesanHasil("Pesanan belum bisa dikirim. Periksa kolom yang ditandai merah.", "gagal");
    return;
  }

  const vila = DATA_VILA.find((v) => v.id === data.vilaId);
  if (!cekKetersediaan(vila, data.masuk, data.keluar)) {
    tampilkanPesanHasil("Maaf, " + vila.nama + " sudah terisi di tanggal tersebut. Silakan pilih tanggal lain.", "gagal");
    return;
  }

  const rincian = hitungTotalHarga(vila, data.masuk, data.keluar, data.tamu);
  const pesanan = {
    kode: buatKode(),
    nama: data.nama,
    vilaId: vila.id,
    masuk: data.masuk,
    keluar: data.keluar,
    tamu: data.tamu,
    total: rincian.total
  };

  pesananTersimpan.push(pesanan);
  const berhasil = tulisPenyimpanan(KUNCI_PESANAN, pesananTersimpan);
  tulisPenyimpanan(KUNCI_NAMA, data.nama);

  elemen.checkin.value = "";
  elemen.checkout.value = "";
  elemen.hasil.replaceChildren();
  const sukses = buat("p", "ringkasan__pesan ringkasan__pesan--ok", "Pesanan " + pesanan.kode + " untuk " + vila.nama + " tercatat dengan total " + rupiah(pesanan.total) + ".");
  const wa = buat("a", "btn btn--utama", "Konfirmasi via WhatsApp");
  wa.href = linkWhatsApp(pesanan, vila);
  wa.target = "_blank";
  wa.rel = "noopener";
  elemen.hasil.appendChild(sukses);
  elemen.hasil.appendChild(wa);
  if (!berhasil) elemen.hasil.appendChild(buat("p", "ringkasan__catatan", "Penyimpanan peramban tidak tersedia, jadi pesanan ini tidak akan muncul lagi setelah halaman ditutup."));

  renderPesanan();
  renderVila();
  tampilkanToast("Pesanan berhasil dibuat.");
};

const terapkanTema = (tema) => {
  document.documentElement.dataset.tema = tema;
  elemen.tema.textContent = tema === "gelap" ? "Mode terang" : "Mode gelap";
};

const mulai = () => {
  try {
    if (!Array.isArray(DATA_VILA) || DATA_VILA.length === 0) throw new Error("Data vila kosong");
    isiDropdown();
    const hariIni = keISO(hariDariSekarang(0));
    elemen.checkin.min = hariIni;
    elemen.checkout.min = keISO(hariDariSekarang(1));
    elemen.nama.value = bacaPenyimpanan(KUNCI_NAMA, "");
    renderVila();
    renderPesanan();
    tampilkanRingkasan();
  } catch (error) {
    elemen.daftarVila.replaceChildren(buat("p", "kosong", "Data vila belum bisa dimuat. Muat ulang halaman atau hubungi Pak Hendra."));
  }
};

terapkanTema(bacaPenyimpanan(KUNCI_TEMA, window.matchMedia("(prefers-color-scheme: dark)").matches ? "gelap" : "terang"));

elemen.tema.addEventListener("click", () => {
  const berikut = document.documentElement.dataset.tema === "gelap" ? "terang" : "gelap";
  terapkanTema(berikut);
  tulisPenyimpanan(KUNCI_TEMA, berikut);
});

elemen.form.addEventListener("submit", kirimPesanan);
elemen.tombolCek.addEventListener("click", periksaKetersediaan);
[elemen.unit, elemen.checkin, elemen.checkout, elemen.tamu].forEach((input) => input.addEventListener("input", perbaruiSemua));
[elemen.kataKunci, elemen.urutan, elemen.hanyaTersedia].forEach((input) => input.addEventListener("input", renderVila));

mulai();