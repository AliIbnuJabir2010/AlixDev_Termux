/**
 * AlixDev Bot - pembuat stiker WhatsApp (webp 512x512 + metadata pack/author)
 * © Ali Ibnu Jabir - All Rights Reserved
 *
 * Pengganti wa-sticker-formatter. Library itu butuh "sharp" lama yang harus
 * dikompilasi dan gagal di Termux (Android). Versi ini cuma pakai:
 *  - @napi-rs/canvas  : decode gambar, resize, encode ke webp (ada binary Android)
 *  - node-webpmux     : nulis EXIF (nama pack & author), JS/WebAssembly murni
 */
const crypto = require('crypto')
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const { Image: WebpImage } = require('node-webpmux')

const SIZE = 512

// EXIF khusus stiker WA: header TIFF tetap + JSON metadata
function buildExif(pack, author) {
  const json = Buffer.from(
    JSON.stringify({
      'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
      'sticker-pack-name': pack,
      'sticker-pack-publisher': author,
      emojis: [],
    }),
    'utf8'
  )
  const header = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ])
  const exif = Buffer.concat([header, json])
  exif.writeUIntLE(json.length, 14, 4)
  return exif
}

// tempel metadata ke file webp
async function addExif(webp, pack, author) {
  const img = new WebpImage()
  await img.load(webp)
  img.exif = buildExif(pack, author)
  return img.save(null)
}

/**
 * Gambar apa pun (jpg/png/webp/gif) -> stiker webp.
 * Gambar dimasukkan utuh ke kotak 512x512 (tidak dipotong), sisanya transparan.
 */
async function makeSticker(input, { pack = '', author = '', quality = 80 } = {}) {
  const img = await loadImage(input)
  const scale = Math.min(SIZE / img.width, SIZE / img.height)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, Math.round((SIZE - w) / 2), Math.round((SIZE - h) / 2), w, h)

  const webp = canvas.toBuffer('image/webp', quality)
  return addExif(webp, pack, author)
}

module.exports = { makeSticker, buildExif, addExif }
