import { decode } from './imagediff.mjs';
const [pa, pb] = process.argv.slice(2);
const A = decode(pa), B = decode(pb);
const h = Math.min(A.h, B.h), w = Math.min(A.w, B.w);
const bands = new Map();
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
    const d = Math.max(Math.abs(A.data[i] - B.data[j]), Math.abs(A.data[i+1] - B.data[j+1]), Math.abs(A.data[i+2] - B.data[j+2]));
    if (d > 0) {
      const k = Math.floor(y / 40) * 40;
      const e = bands.get(k) || { n: 0, x0: 1e9, x1: -1, max: 0 };
      e.n++; e.x0 = Math.min(e.x0, x); e.x1 = Math.max(e.x1, x); e.max = Math.max(e.max, d);
      bands.set(k, e);
    }
  }
}
[...bands.entries()].sort((a,b)=>b[1].n-a[1].n).slice(0,6).forEach(([k,e]) => console.log(`y=${k}..${k+39} n=${e.n} x=${e.x0}..${e.x1} delta<=${e.max}`));
