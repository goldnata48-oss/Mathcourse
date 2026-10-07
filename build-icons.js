/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function renderPNG(width, height, draw) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = draw(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const C_TOP = [0x3D, 0x5A, 0x80];
const C_BOT = [0x2A, 0x34, 0x48];
const AMBER = [0xFF, 0xB0, 0x20];
const WHITE = [0xFF, 0xFF, 0xFF];
const TRANSPARENT = [0, 0, 0, 0];
/* Палитра квадратных иконок — синий градиент с янтарными акцентами. */
const ICON_PALETTE = { top: C_TOP, bot: C_BOT, amber: AMBER };
/* Палитра обложки для соцсетей — кораллово-фиолетовый градиент,
   созвучный цветовой схеме интерфейса, акценты белые для читаемости. */
const OG_PALETTE = { top: [0xFF, 0x7A, 0x45], bot: [0x9B, 0x5D, 0xE5], amber: WHITE };

function drawIcon(u, v, palette) {
  const pal = palette || ICON_PALETTE;
  const cor = 0.22;
  let qx = 0, qy = 0;
  if (u < cor) qx = cor - u; else if (u > 1 - cor) qx = u - (1 - cor);
  if (v < cor) qy = cor - v; else if (v > 1 - cor) qy = v - (1 - cor);
  if (u < 0 || u > 1 || v < 0 || v > 1 || Math.hypot(qx, qy) > cor) return TRANSPARENT;

  const t = Math.min(1, (u + v) / 2);
  const bg = [
    Math.round(pal.top[0] + (pal.bot[0] - pal.top[0]) * t),
    Math.round(pal.top[1] + (pal.bot[1] - pal.top[1]) * t),
    Math.round(pal.top[2] + (pal.bot[2] - pal.top[2]) * t),
    255
  ];

  const ecx = 0.5, ecy = 0.20, erx = 0.36, ery = 0.105;
  const rot = -18 * Math.PI / 180;
  const dx = u - ecx, dy = v - ecy;
  const lx = dx * Math.cos(-rot) - dy * Math.sin(-rot);
  const ly = dx * Math.sin(-rot) + dy * Math.cos(-rot);
  const d2 = Math.pow(lx / erx, 2) + Math.pow(ly / ery, 2);
  const orbitDist = Math.abs(Math.sqrt(d2) - 1) * Math.min(erx, ery);
  if (orbitDist < 0.028) return [...WHITE, 255];

  const thetaDot = Math.atan2(-0.08 / ery, -0.32 / erx);
  const relX = erx * Math.cos(thetaDot), relY = ery * Math.sin(thetaDot);
  const dtx = relX * Math.cos(rot) - relY * Math.sin(rot);
  const dty = relX * Math.sin(rot) + relY * Math.cos(rot);
  if (Math.hypot(u - (ecx + dtx), v - (ecy + dty)) < 0.045) return [...WHITE, 255];

  if (Math.hypot(u - 0.32, v - 0.44) < 0.055 || Math.hypot(u - 0.68, v - 0.44) < 0.055) return [...pal.amber, 255];
  if (Math.hypot(u - 0.335, v - 0.415) < 0.02 || Math.hypot(u - 0.695, v - 0.415) < 0.02) return [...WHITE, 255];

  const scx = 0.5, scy = 0.76, sr = 0.20, sw = 0.028;
  const sd = Math.hypot(u - scx, v - scy);
  if (v < scy && v > 0.5 && Math.abs(sd - sr) < sw) return [...pal.amber, 255];

  return bg;
}

function generateIcons(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const icon = (size) => renderPNG(size, size, (x, y) => drawIcon(x / size, y / size));
  const og = renderPNG(1200, 630, (x, y) => {
    const u = x / 1200, v = y / 630;
    const t = Math.min(1, (u + v) / 2);
    const bg = [
      Math.round(OG_PALETTE.top[0] + (OG_PALETTE.bot[0] - OG_PALETTE.top[0]) * t),
      Math.round(OG_PALETTE.top[1] + (OG_PALETTE.bot[1] - OG_PALETTE.top[1]) * t),
      Math.round(OG_PALETTE.top[2] + (OG_PALETTE.bot[2] - OG_PALETTE.top[2]) * t),
      255
    ];
    const q = 560, off = (1200 - q) / 2, offY = (630 - q) / 2;
    const p = drawIcon((x - off) / q, (y - offY) / q, OG_PALETTE);
    return p[3] === 0 ? bg : p;
  });
  fs.writeFileSync(path.join(outDir, "icon-180.png"), icon(180));
  fs.writeFileSync(path.join(outDir, "icon-192.png"), icon(192));
  fs.writeFileSync(path.join(outDir, "icon-512.png"), icon(512));
  fs.writeFileSync(path.join(outDir, "icon-og.png"), og);
  return ["icon-180.png", "icon-192.png", "icon-512.png", "icon-og.png"];
}

module.exports = { generateIcons, renderPNG };