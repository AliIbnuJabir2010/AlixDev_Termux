# Changelog — AlixDev Bot © Ali Ibnu Jabir

## v1.5.0 (Termux) — fitur disamakan lagi dengan versi PC (v1.9.5)
- Baru: `.play <judul lagu / link youtube>` → cover + judul, lalu audionya (yt-dlp, maks 10 menit). `termux-setup.sh` sekarang ikut memasang yt-dlp & ffmpeg
- Baru: `.toimg` → reply stiker jadi foto (latar transparan jadi putih, stiker animasi diambil frame pertama). Tanpa sharp, lewat @napi-rs/canvas
- Baru: `.ig <teks>` → tampilan balas catatan Instagram (template assets/templates/ig.png). Tanpa sharp, blur dihitung manual (`blurRGBA`, paham transparansi)
- Baru: `.owner` → foto + info singkat pemilik (assets/templates/owner.jpg, moto di config.ownerMotto)
- Baru: `.off` / `.of` → matikan bot dari WhatsApp, khusus nomor owner terdaftar (config.owners / env OWNER_NUMBERS)
- Error di chat tidak lagi menampilkan isi error mentah; detail cuma di terminal. Bot beri reaksi ❌ + pesan santai (lib/usererror.js)
- Semua pesan bantuan & error disamakan jadi bahasa santai seperti versi PC
- Fix .brat/.iphone/.ustad: emoji yang gambarnya nggak ketemu dibuang (nggak jadi kotak kosong)
- Menu diperbarui (MAINMENU, DOWNLOADER, TOOLSMENU)

## v1.4.0 (Termux) — fitur disamakan dengan versi PC
- Baru: `.iphone <teks> | <jam> | <tema>` → tampilan chat iPhone (reaksi + pesan + menu tahan-lama), tema terang/gelap
- Baru: `.ustad <kata-kata>` → kotak "Soalan" di foto template (assets/templates/ustad.jpg)
- Banner baru untuk `.menu`
- Tetap tanpa `sharp`: blur manual di canvas, resize & JPEG lewat @napi-rs/canvas
- assets/templates/ masuk .gitignore (foto orang jangan ikut ter-upload ke GitHub)

## v1.3.0
- Bisa jalan di Termux (Android arm64): `sharp` dan `wa-sticker-formatter` dibuang (tidak punya binary Android)
- Stiker `.s` / `.brat` dibuat lewat `lib/sticker.js` (@napi-rs/canvas + node-webpmux), blur .brat dihitung manual
- Tambah `termux-setup.sh`, panduan Termux di README, pilihan login default ke pairing code saat di Termux
- Tambah `jimp` (pure JS) buat thumbnail gambar Baileys; `package-lock.json` dihapus biar dibuat ulang sesuai platform

## v1.2.0
- .brat mendukung emoji gaya iPhone (paket emoji-datasource-apple, ±100MB saat npm i)

## v1.1.0 (stable) — versi aman, titik balik
- Startup: konfirmasi y/n, pilih login QR / pairing code
- Anti-ulang pesan lama (filter waktu + ID tersimpan + getMessage store)
- Filter log "Bad MAC", `npm run reset-session`
- Perintah: .menu .info .dl .dls .rvo .s .brat
- .brat: latar putih, teks pendek dibesarkan & di tengah
- Proteksi: LICENSE, AI_NOTICE.md, OWNER_AUTH.json, checkCredit()
