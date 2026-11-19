import { decode } from './imagediff.mjs';
const [pa, pb, y0, y1, x0, x1, sx] = process.argv.slice(2);
const A = decode(pa), B = decode(pb);
const Y0 = +y0, Y1 = +y1, X0 = +x0, X1 = +x1, S = +(sx || 4);
for (let y = Y0; y < Y1; y += S) {
  let line = '';
  for (let x = X0; x < X1; x += S) {
    let mx = 0;
    for (let yy = y; yy < Math.min(y + S, Y1); yy++) for (let xx = x; xx < Math.min(x + S, X1); xx++) {
      const i = (yy * A.w + xx) * 4, j = (yy * B.w + xx) * 4;
      mx = Math.max(mx, Math.abs(A.data[i] - B.data[j]), Math.abs(A.data[i+1] - B.data[j+1]), Math.abs(A.data[i+2] - B.data[j+2]));
    }
    line += mx === 0 ? '.' : mx < 8 ? ':' : mx < 24 ? '+' : mx < 48 ? '#' : '@';
  }
  console.log(String(y).padStart(4), line);
}
// also show proto pixel colours on a diff row
