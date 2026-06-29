'use strict';
// Gera imagens PNG ORIGINAIS (sólidos e uma vinheta) usadas pela cinemática.
// São formas geométricas geradas por código — nenhum asset de terceiros é usado.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- mini codificador PNG (RGBA, 8 bits) ----
let CRC;
function crcTable() {
  if (CRC) return CRC;
  CRC = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC[n] = c >>> 0;
  }
  return CRC;
}
function crc32(buf) {
  const t = crcTable();
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(width, height, fill) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filtro 0 (nenhum)
    for (let x = 0; x < width; x++) {
      const c = fill(x, y);
      raw[p++] = c[0]; raw[p++] = c[1]; raw[p++] = c[2]; raw[p++] = c[3];
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const SCREEN_W = 816, SCREEN_H = 624, BAR_H = 104;

function buildAssets(outDir) {
  const dir = path.join(outDir, 'img', 'pictures');
  fs.mkdirSync(dir, { recursive: true });
  const write = (name, buf) => { fs.writeFileSync(path.join(dir, name + '.png'), buf); return name; };

  const written = [];
  // preto e branco de tela cheia (fades/flashes)
  written.push(write('CineBlack', png(SCREEN_W, SCREEN_H, () => [0, 0, 0, 255])));
  written.push(write('CineWhite', png(SCREEN_W, SCREEN_H, () => [255, 255, 255, 255])));
  // barra de cinema (letterbox) — preto opaco
  written.push(write('CineBar', png(SCREEN_W, BAR_H, () => [0, 0, 0, 255])));
  // vinheta — preto transparente no centro, escuro nas bordas (suaviza a cena)
  const cx = SCREEN_W / 2, cy = SCREEN_H / 2;
  const maxD = Math.sqrt(cx * cx + cy * cy);
  written.push(write('CineVignette', png(SCREEN_W, SCREEN_H, (x, y) => {
    const dx = x - cx, dy = y - cy;
    const d = Math.sqrt(dx * dx + dy * dy) / maxD; // 0..1
    let t = (d - 0.45) / 0.55; // começa a escurecer a partir de ~45% do raio
    if (t < 0) t = 0; if (t > 1) t = 1;
    const a = Math.round(t * t * 210); // ease quadrático, até ~210 de alfa
    return [0, 0, 0, a];
  })));

  console.log('Assets de imagem gerados em', dir, '→', written.join(', '));
  return written;
}

module.exports = { buildAssets, SCREEN_W, SCREEN_H, BAR_H };
