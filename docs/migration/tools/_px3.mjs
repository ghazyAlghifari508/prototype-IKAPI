import { decode } from './imagediff.mjs';
const A = decode(process.argv[2]), B = decode(process.argv[3]);
const [x0,x1,y0,y1] = process.argv.slice(4).map(Number);
const rows = new Map();
for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
  const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
  const d = Math.max(Math.abs(A.data[i]-B.data[j]), Math.abs(A.data[i+1]-B.data[j+1]), Math.abs(A.data[i+2]-B.data[j+2]));
  if (!d) continue;
  const key = Math.floor(x / 80) * 80;
  const e = rows.get(key) || { n: 0, max: 0, sample: null };
  e.n++; if (d > e.max) { e.max = d; e.sample = `${A.data[i]},${A.data[i+1]},${A.data[i+2]} vs ${B.data[j]},${B.data[j+1]},${B.data[j+2]} @${x},${y}`; }
  rows.set(key, e);
}
[...rows.entries()].sort((a,b) => b[1].n - a[1].n).slice(0, 6).forEach(([k, e]) => console.log(`x=${k}..${k+79} n=${e.n} max=${e.max} ${e.sample}`));
