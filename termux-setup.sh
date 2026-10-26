#!/data/data/com.termux/files/usr/bin/bash
# AlixDev Bot © Ali Ibnu Jabir - setup sekali jalan untuk Termux
# Pakai: bash termux-setup.sh
set -e

echo "==> Update paket Termux"
pkg update -y && pkg upgrade -y

echo "==> Pasang nodejs-lts & git (git wajib: Baileys narik libsignal dari GitHub)"
pkg install -y nodejs-lts git

if [ "$(uname -m)" != "aarch64" ]; then
  echo "!! CPU kamu $(uname -m), bukan arm64. Binary @napi-rs/canvas cuma ada untuk arm64,"
  echo "   fitur .brat dan .s kemungkinan gagal. Perintah lain tetap bisa jalan."
fi

echo "==> Pasang yt-dlp & ffmpeg (khusus perintah .play)"
pkg install -y yt-dlp ffmpeg || echo "!! yt-dlp/ffmpeg gagal dipasang, .play nggak akan jalan. Perintah lain tetap bisa. Coba manual: pkg install yt-dlp ffmpeg"

echo "==> Pasang dependensi bot (emoji Apple ±100MB, sabar ya)"
npm install --no-audit --no-fund

echo
echo "✅ Selesai. Jalankan bot:"
echo "   termux-wake-lock    # biar nggak dimatikan Android saat layar mati"
echo "   npm start"
