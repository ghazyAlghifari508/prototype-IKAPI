import { decode } from './imagediff.mjs';
const A = decode(process.argv[2]), B = decode(process.argv[3]);
const sx = 16, sy = 16;
const W = Math.floor(Math.min(A.w, B.w) / sx), H = Math.floor(Math.min(A.h, B.h) / sy);
let out = '';
for (let ry = 0; ry < H; ry++) {
  let line = '';
  for (let rx = 0; rx < W; rx++) {
    let n = 0, mx = 0;
    for (let y = ry * sy; y < (ry + 1) * sy; y++) for (let x = rx * sx; x < (rx + 1) * sx; x++) {
      const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
      const d = Math.max(Math.abs(A.data[i] - B.data[j]), Math.abs(A.data[i+1] - B.data[j+1]), Math.abs(A.data[i+2] - B.data[j+2]));
      if (d) { n++; mx = Math.max(mx, d); }
    }
    line += n === 0 ? '.' : n < 40 ? ':' : n < 120 ? '+' : n < 220 ? '#' : '@';
  }
  if (line.replace(/\./g, '')) out += String(ry * sy).padStart(4) + ' ' + line + '\n';
}
console.log(out);
