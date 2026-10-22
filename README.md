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

Perintah: `.menu` `.info` `.dl <link>` `.dls <link>` `.rvo` `.s` `.brat <teks>` `.iphone <teks>` `.ustad <kata>`

Lisensi: lihat `LICENSE`. Dilarang edit/jual tanpa izin pemilik.
