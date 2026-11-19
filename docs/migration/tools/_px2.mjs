import { decode } from './imagediff.mjs';
const A = decode(process.argv[2]), B = decode(process.argv[3]);
let n = 0, samples = [];
for (let y = 470; y < 660; y++) for (let x = 1030; x < 1400; x++) {
  const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
  const d = Math.max(Math.abs(A.data[i] - B.data[j]), Math.abs(A.data[i+1] - B.data[j+1]), Math.abs(A.data[i+2] - B.data[j+2]));
  if (d) { n++; if (samples.length < 8 && d > 40) samples.push([x, y, [A.data[i], A.data[i+1], A.data[i+2]].join(','), [B.data[j], B.data[j+1], B.data[j+2]].join(','), d]); }
}
console.log('diff pixels', n);
samples.forEach((s) => console.log(s.join(' | ')));
