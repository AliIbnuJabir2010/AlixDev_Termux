# Changelog — AlixDev Bot © Ali Ibnu Jabir

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
