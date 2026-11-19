// Report the y-bands where a blade/proto pair differs, so a visual delta can be located quickly.
import fs from 'node:fs';
import { decode } from './imagediff.mjs';
const [a, b] = process.argv.slice(2);
const A = decode(a), B = decode(b);
const h = Math.min(A.h, B.h), w = Math.min(A.w, B.w);
const rows = [];
for (let y = 0; y < h; y++) {
  let n = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
    if (A.data[i] !== B.data[j] || A.data[i + 1] !== B.data[j + 1] || A.data[i + 2] !== B.data[j + 2]) n++;
  }
  if (n) rows.push([y, n]);
}
let bands = [], cur = null;
for (const [y, n] of rows) {
  if (cur && y - cur[1] <= 6) { cur[1] = y; cur[2] += n; }
  else { cur = [y, y, n]; bands.push(cur); }
}
bands.sort((x, y) => y[2] - x[2]);
console.log('size', `${A.w}x${A.h}`, `${B.w}x${B.h}`);
for (const [y0, y1, n] of bands.slice(0, 8)) console.log(`  y=${y0}..${y1} (${y1 - y0 + 1}px) diffPixels=${n}`);
