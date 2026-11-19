// P06 recon: inventory of the 17 target pages (state keys, script blocks, shell markers, sections).
import fs from 'node:fs';
import path from 'node:path';
const SRC = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/design/prototype-copy/user';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p6-recon.json';
const files = ['masuk_login_desktop','daftar_akun_register_desktop','lupa_kata_sandi_desktop','verifikasi_email_desktop','onboarding_preferensi_bacaan_desktop','status_pendaftaran_penerbit_desktop','akun_saya_profil_dropdown_navigasi_desktop','pengaturan_akun_desktop','bantuan_akun_desktop','keranjang_pembayaran_terpadu_desktop','riwayat_pesanan_desktop','perpustakaan_saya_desktop','web_reader_desktop','riwayat_ulasan_desktop','agenda_berita_literasi_desktop','detail_agenda_desktop','chatbot_bantuan_rekomendasi_desktop'];
const out = {};
for (const f of files) {
  const html = fs.readFileSync(path.join(SRC, f + '.html'), 'utf8');
  const lines = html.split('\n');
  const keys = [...new Set(html.match(/ikapi_[a-z0-9_]+/g) || [])].sort();
  const scripts = [];
  const re = /<script\b([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1].trim();
    const start = html.slice(0, m.index).split('\n').length;
    const end = html.slice(0, html.indexOf('</script>', m.index)).split('\n').length;
    scripts.push({ attrs: attrs.slice(0, 90), start, end, loc: end - start });
  }
  const ids = [...new Set((html.match(/\bid="([^"]+)"/g) || []).map((x) => x.slice(4, -1)))];
  const topSections = [...html.matchAll(/<(section|main|header|footer|aside|div)\b[^>]*class="([^"]*)"[^>]*>/g)]
    .filter((x) => /(^|\s)(w-full|max-w-\[)/.test(x[2]))
    .slice(0, 12)
    .map((x) => ({ tag: x[1], cls: x[2].slice(0, 120) }));
  out[f] = {
    loc: lines.length,
    title: (html.match(/<title>([^<]*)/) || [])[1],
    keys,
    scripts,
    hasHeader: /<header/.test(html),
    hasFooter: /<footer/.test(html),
    headerIds: ids.filter((i) => /header|nav|menu|drawer|modal|toast|empty|tab|panel|step/i.test(i)).slice(0, 40),
    topSections,
    functions: [...new Set((html.match(/function\s+([a-zA-Z0-9_]+)/g) || []).map((x) => x.split(/\s+/)[1]))],
  };
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(`${k.padEnd(38)} loc=${String(v.loc).padStart(4)} keys=${String(v.keys.length).padStart(2)} fns=${String(v.functions.length).padStart(2)} hdr=${v.hasHeader ? 'Y' : 'n'} ftr=${v.hasFooter ? 'Y' : 'n'} scripts=${v.scripts.map((s) => s.loc).join('+')}`);
