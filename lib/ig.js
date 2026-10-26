/**
 * AlixDev Bot - template "balas catatan Instagram" dengan nama & teks bebas
 * © Ali Ibnu Jabir - All Rights Reserved
 *
 * Template ada di assets/templates/ig.png (teks aslinya sudah dihapus). Foto template
 * miring ±9,87°, jadi semua elemen digambar di bingkai lurus lalu diputar mengikuti
 * foto lewat matriks MAT. Yang diganti: bubble besar, bubble kecil di atas (blur),
 * dan tulisan "Balas ke <nama>".
 *
 * Inti gambar (drawIg) tidak butuh modul apa pun supaya gampang diuji; semua
 * ketergantungan (canvas, blur, emoji) disuntik lewat parameter deps.
 *
 * Versi Termux: tanpa sharp. Resize & JPEG lewat @napi-rs/canvas, blur dihitung
 * manual (blurRGBA) karena sharp nggak punya binary Android.
 */

const TW = 415 // ukuran template (px)
const TH = 739
const S = 2 // diperbesar 2x biar teks tajam

// bingkai lurus → template (a, b, c, d, e, f untuk ctx.setTransform), hasil ukur
const MAT = [0.9851992129804021, -0.1714132746983038, 0.1714132746983038, 0.9851992129804021, -124.52039271422996, 21.765965396125587]

const BOLD = 'BratBold'
const REG = 'BratFont'

// bubble besar (balasan): menempel di kiri, tinggi/lebar mengikuti teks
const BIG = { left: 151, cy: 418, padX: 25, vpad: 36, lh: 22, size: 18, minSize: 14, maxTextW: 250, minW: 80, maxLines: 2, color: '#950153' }
// bubble kecil di atas (ukuran tetap, ikut ada di template)
const TOP = { cx: 208.5, cy: 70.5, maxTextW: 99, size: 15.7, minSize: 9, pitchK: 1.16, maxLines: 4, maxBlockH: 62, color: 'rgba(204,168,222,0.92)', blur: 1.1 }
// tulisan "Balas ke ..." di kotak balasan
const REPLY = { x: 42.4, base: 523.5, size: 21.5, maxW: 262, color: '#9ea2be' }

const clean = (t, max = 70) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, max)

// nama WhatsApp → username ala Instagram (huruf kecil, tanpa spasi/emoji)
function igName(pushName) {
  const u = String(pushName || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.').replace(/[^a-z0-9._]/g, '').replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 30)
  return u || 'user'
}

// ---------- tata letak teks (kata → bagian teks/emoji) ----------
const atomize = (parts) => parts.flatMap((p) => (p.t === 'emo' ? [p] : Array.from(p.v).map((v) => ({ t: 'txt', v }))))
function merge(atoms) {
  const out = []
  for (const a of atoms) {
    if (a.t === 'txt' && out.length && out[out.length - 1].t === 'txt') out[out.length - 1] = { t: 'txt', v: out[out.length - 1].v + a.v }
    else out.push(a)
  }
  return out
}
const partsW = (ctx, parts, emo) => parts.reduce((w, p) => w + (p.t === 'emo' ? emo : ctx.measureText(p.v).width), 0)

// kata yang lebih lebar dari baris dipotong per huruf
function breakLong(ctx, parts, maxW, emo) {
  if (partsW(ctx, parts, emo) <= maxW) return [parts]
  const chunks = []
  let cur = []
  for (const a of atomize(parts)) {
    const next = [...cur, a]
    if (cur.length && partsW(ctx, merge(next), emo) > maxW) { chunks.push(merge(cur)); cur = [a] } else cur = next
  }
  if (cur.length) chunks.push(merge(cur))
  return chunks
}

function wrap(ctx, text, maxW, size, family, toParts) {
  ctx.font = `${size}px ${family}`
  const emo = size * 1.1
  const sp = ctx.measureText(' ').width
  const words = text.split(' ').filter(Boolean).flatMap((w) => breakLong(ctx, toParts(w), maxW, emo))
  const lines = []
  let cur = [], curW = 0
  for (const w of words) {
    const ww = partsW(ctx, w, emo)
    if (cur.length && curW + sp + ww > maxW) { lines.push({ words: cur, w: curW }); cur = []; curW = 0 }
    curW += (cur.length ? sp : 0) + ww
    cur.push(w)
  }
  if (cur.length) lines.push({ words: cur, w: curW })
  return { lines, sp, emo }
}

// cari ukuran font terbesar yang muat; kalau tetap tidak muat, potong dengan "…"
function fit(ctx, text, { maxW, size, minSize, maxLines, family, toParts, ok = () => true }) {
  let res
  for (let s = size; s >= minSize - 1e-6; s -= 0.5) {
    res = { ...wrap(ctx, text, maxW, s, family, toParts), size: s }
    if (res.lines.length <= maxLines && ok(res)) return res
  }
  res.lines = res.lines.slice(0, maxLines)
  const last = res.lines[res.lines.length - 1]
  ctx.font = `${res.size}px ${family}`
  const ellW = ctx.measureText('…').width
  while (last.words.length > 1 && last.w + ellW > maxW) {
    const w = last.words.pop()
    last.w -= partsW(ctx, w, res.emo) + res.sp
  }
  last.words[last.words.length - 1] = merge([...last.words[last.words.length - 1], { t: 'txt', v: '…' }])
  last.w = last.words.reduce((a, w, i) => a + (i ? res.sp : 0) + partsW(ctx, w, res.emo), 0)
  return res
}

const emojiFiles = (res) => [...new Set(res.lines.flatMap((l) => l.words.flatMap((w) => w.filter((p) => p.t === 'emo').map((p) => p.file))))]

// gambar baris-baris teks rata tengah di sekitar cx; baris pertama di y = base0
function drawLines(ctx, res, { cx, base0, pitch, family, color, imgs }) {
  ctx.font = `${res.size}px ${family}`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  res.lines.forEach((ln, li) => {
    let x = cx - ln.w / 2
    const base = base0 + li * pitch
    ln.words.forEach((w, wi) => {
      if (wi) x += res.sp
      for (const p of w) {
        if (p.t === 'emo') { ctx.drawImage(imgs.get(p.file), x, base - res.emo * 0.84, res.emo, res.emo); x += res.emo }
        else { ctx.fillText(p.v, x, base); x += ctx.measureText(p.v).width }
      }
    })
  })
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// ---------- inti: gambar ke canvas ----------
// deps: { createCanvas(w,h), loadImage(src), blur(canvas, sigmaPx) → Promise<drawable>, toParts(kata) }
async function drawIg(deps, { plateImg, name, text }) {
  const { createCanvas, loadImage, blur, toParts } = deps
  const W = TW * S, H = TH * S
  const frame = (c) => c.setTransform(MAT[0] * S, MAT[1] * S, MAT[2] * S, MAT[3] * S, MAT[4] * S, MAT[5] * S)
  const note = clean(text) || '...'

  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(plateImg, 0, 0, W, H)

  const layer = createCanvas(W, H) // bubble kecil di atas (akan di-blur)
  const lx = layer.getContext('2d')
  const sharpLayer = createCanvas(W, H) // bubble besar + tulisan balas (tajam)
  const sx = sharpLayer.getContext('2d')
  frame(lx); frame(sx)

  // 1) bubble besar
  const big = fit(sx, note, { maxW: BIG.maxTextW, size: BIG.size, minSize: BIG.minSize, maxLines: BIG.maxLines, family: BOLD, toParts })
  const bigLH = BIG.lh * (big.size / BIG.size)
  const bigW = Math.max(BIG.minW, Math.max(...big.lines.map((l) => l.w)) + BIG.padX * 2)
  const bigH = big.lines.length * bigLH + BIG.vpad
  sx.fillStyle = BIG.color
  rr(sx, BIG.left, BIG.cy - bigH / 2, bigW, bigH, Math.min(29, bigH / 2)); sx.fill()

  // 2) bubble kecil di atas (ukuran bubble tetap, hanya teksnya)
  const top = fit(lx, note, {
    maxW: TOP.maxTextW, size: TOP.size, minSize: TOP.minSize, maxLines: TOP.maxLines, family: REG, toParts,
    ok: (r) => r.lines.length * r.size * TOP.pitchK <= TOP.maxBlockH,
  })
  const topPitch = top.size * TOP.pitchK

  // 3) "Balas ke <nama>"
  sx.font = `${REPLY.size}px ${REG}`
  const prefix = 'Balas ke '
  const room = REPLY.maxW - sx.measureText(prefix).width
  let uname = String(name || 'user')
  if (sx.measureText(uname).width > room) {
    while (uname.length > 1 && sx.measureText(uname + '…').width > room) uname = uname.slice(0, -1)
    uname = uname.replace(/[._]+$/, '') + '…'
  }

  // emoji (kalau ada) dimuat dulu
  const imgs = new Map()
  for (const f of [...emojiFiles(big), ...emojiFiles(top)]) imgs.set(f, await loadImage(f))

  drawLines(sx, big, { cx: BIG.left + bigW / 2, base0: BIG.cy - ((big.lines.length - 1) * bigLH) / 2 + 4.5, pitch: bigLH, family: BOLD, color: '#ffffff', imgs })
  sx.font = `${REPLY.size}px ${REG}`
  sx.fillStyle = REPLY.color
  sx.textAlign = 'left'
  sx.textBaseline = 'alphabetic'
  sx.fillText(prefix + uname, REPLY.x, REPLY.base)
  drawLines(lx, top, { cx: TOP.cx, base0: TOP.cy - ((top.lines.length - 1) * topPitch) / 2 + 5, pitch: topPitch, family: REG, color: TOP.color, imgs })

  ctx.drawImage(await blur(layer, TOP.blur * S), 0, 0)
  ctx.drawImage(sharpLayer, 0, 0)
  return canvas
}

// ---------- blur gaussian yang paham transparansi (pengganti sharp().blur()) ----------
// px = data RGBA (Uint8ClampedArray, non-premultiplied) dan diubah di tempat.
// Dihitung dalam bentuk premultiplied supaya tepi bubble yang transparan nggak jadi hitam/abu-abu.
// Hanya area yang berisi gambar (+ radius blur) yang diproses, jadi ringan di HP.
function blurRGBA(px, w, h, sigma) {
  let minX = w, minY = h, maxX = -1, maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3]) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return px // layer kosong, tidak ada yang di-blur

  // kernel dipotong seperti sharp/libvips (amplitudo minimal 0.2), supaya hasilnya sama dengan versi PC
  const r = Math.max(1, Math.floor(sigma * Math.sqrt(2 * Math.log(5))))
  const x0 = Math.max(0, minX - r), x1 = Math.min(w - 1, maxX + r)
  const y0 = Math.max(0, minY - r), y1 = Math.min(h - 1, maxY + r)
  const rw = x1 - x0 + 1, rh = y1 - y0 + 1

  const k = new Float32Array(r * 2 + 1)
  let sum = 0
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + r] }
  for (let i = 0; i < k.length; i++) k[i] /= sum

  // premultiplied: R*a, G*a, B*a, A  (skala 0..255)
  const src = new Float32Array(rw * rh * 4)
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const i = ((y + y0) * w + (x + x0)) * 4
      const o = (y * rw + x) * 4
      const a = px[i + 3] / 255
      src[o] = px[i] * a; src[o + 1] = px[i + 1] * a; src[o + 2] = px[i + 2] * a; src[o + 3] = px[i + 3]
    }
  }

  // di luar area dianggap transparan (nol), jadi tidak perlu clamp tepi
  const tmp = new Float32Array(src.length)
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let c0 = 0, c1 = 0, c2 = 0, c3 = 0
      for (let i = -r; i <= r; i++) {
        const xx = x + i
        if (xx < 0 || xx >= rw) continue
        const idx = (y * rw + xx) * 4
        const wt = k[i + r]
        c0 += src[idx] * wt; c1 += src[idx + 1] * wt; c2 += src[idx + 2] * wt; c3 += src[idx + 3] * wt
      }
      const o = (y * rw + x) * 4
      tmp[o] = c0; tmp[o + 1] = c1; tmp[o + 2] = c2; tmp[o + 3] = c3
    }
  }
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let c0 = 0, c1 = 0, c2 = 0, c3 = 0
      for (let i = -r; i <= r; i++) {
        const yy = y + i
        if (yy < 0 || yy >= rh) continue
        const idx = (yy * rw + x) * 4
        const wt = k[i + r]
        c0 += tmp[idx] * wt; c1 += tmp[idx + 1] * wt; c2 += tmp[idx + 2] * wt; c3 += tmp[idx + 3] * wt
      }
      const o = ((y + y0) * w + (x + x0)) * 4
      if (c3 < 0.5) { px[o] = 0; px[o + 1] = 0; px[o + 2] = 0; px[o + 3] = 0; continue }
      const inv = 255 / c3
      px[o] = c0 * inv; px[o + 1] = c1 * inv; px[o + 2] = c2 * inv; px[o + 3] = c3
    }
  }
  return px
}

function blurLayer(canvas, sigma) {
  const ctx = canvas.getContext('2d')
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  blurRGBA(img.data, canvas.width, canvas.height, sigma)
  ctx.putImageData(img, 0, 0)
  return canvas
}

// ---------- pembungkus untuk bot (cuma butuh @napi-rs/canvas, tanpa sharp) ----------
async function renderIg({ name, text }) {
  const fs = require('fs')
  const path = require('path')
  const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas')
  const { toParts } = require('./brat') // sekalian mendaftarkan font BratFont
  if (!(GlobalFonts.has && GlobalFonts.has(BOLD))) GlobalFonts.registerFromPath(path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSans-Bold.ttf'), BOLD)

  const PLATE = path.join(__dirname, '..', 'assets', 'templates', 'ig.png')
  if (!fs.existsSync(PLATE)) throw new Error('Foto template belum ada (assets/templates/ig.png)')

  // template diperbesar 2x lewat canvas (pengganti sharp().resize())
  const plateImg = createCanvas(TW * S, TH * S)
  const pctx = plateImg.getContext('2d')
  pctx.imageSmoothingEnabled = true
  pctx.imageSmoothingQuality = 'high'
  pctx.drawImage(await loadImage(PLATE), 0, 0, TW * S, TH * S)

  const canvas = await drawIg(
    {
      createCanvas,
      loadImage,
      toParts,
      blur: async (c, sigma) => blurLayer(c, Math.max(0.3, sigma)),
    },
    { plateImg, name, text },
  )
  return canvas.toBuffer('image/jpeg', 93)
}

module.exports = { renderIg, drawIg, igName, blurRGBA }
