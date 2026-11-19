import { decode } from './imagediff.mjs';
const A = decode(process.argv[2]), B = decode(process.argv[3]);
for (const [x, y] of [[1100, 500], [1200, 560], [1300, 620], [1050, 490], [1380, 520]]) {
  const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4;
  console.log(`(${x},${y}) P=${A.data[i]},${A.data[i+1]},${A.data[i+2]} B=${B.data[j]},${B.data[j+1]},${B.data[j+2]}`);
}
