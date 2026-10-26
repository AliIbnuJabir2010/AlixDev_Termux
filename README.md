# AlixDev Bot
WhatsApp bot simpel — © Ali Ibnu Jabir

## Jalankan (PC)
```bash
npm install
npm start
```

## Jalankan di Termux (Android)
Pakai Termux dari **F-Droid** atau GitHub (versi Play Store sudah usang). HP harus **arm64**.

```bash
termux-setup-storage          # opsional, kalau mau akses file HP
pkg install -y unzip
unzip alixdev-bot.zip && cd alixdev-bot
bash termux-setup.sh          # pasang nodejs-lts, git, dan dependensi
termux-wake-lock              # biar bot nggak dimatikan saat layar mati
npm start
```

Catatan Termux:
- **Login pakai pairing code** (pilihan 2). WA ada di HP yang sama, jadi QR tidak bisa discan sendiri.
- Matikan optimasi baterai untuk Termux di pengaturan Android supaya bot tidak mati sendiri.
- Folder `session` jangan disalin antar perangkat. Login ulang di Termux; kalau dobel dipakai bisa logout.
- Kalau muncul error `Bad MAC`: stop bot, `npm run reset-session`, lalu login ulang.

Perintah: `.menu` `.info` `.owner` `.play <judul lagu>` `.dl <link>` `.dls <link>` `.rvo` `.s` `.toimg` `.brat <teks>` `.iphone <teks> | <jam>` `.ustad <kata>` `.ig <teks>`
Khusus owner: `.off` / `.of` (matikan bot dari WA, balasan "Memverifikasi..." lalu diedit jadi berhasil/gagal)

## .play (Termux)
Butuh `yt-dlp` dan `ffmpeg` (dipasang otomatis oleh `termux-setup.sh`). Cek: `yt-dlp --version`. Kalau gagal terpasang: `pkg install yt-dlp ffmpeg`.
Opsional (variabel lingkungan): `YTDLP_PATH`, `YTDLP_COOKIES`, `PLAY_MAX_SECONDS`.

## Owner (.off)
Isi nomor owner di `OWNER_NUMBER` (index.js), atau lewat env `OWNER_NUMBERS=628111,628222`. Di Termux tidak ada pm2, jadi setelah `.off` bot benar-benar berhenti; nyalakan lagi dengan `npm start`.

Lisensi: lihat `LICENSE`. Dilarang edit/jual tanpa izin pemilik.
