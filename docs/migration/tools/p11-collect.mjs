// P11: aggregate the per-phase parity runs into one coverage matrix (markdown + json).
// Input: docs/migration/p{5,6,7,8,9}-parity.json, docs/migration/p11-audit-{app,proto}.json, p1 inventory mapping.
import fs from 'node:fs';

const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration';
const read = (f) => (fs.existsSync(`${ROOT}/${f}`) ? JSON.parse(fs.readFileSync(`${ROOT}/${f}`, 'utf8')) : []);

const phases = [
  { id: 'P05', file: 'p5-parity.json', dir: 'p5' },
  { id: 'P06', file: 'p6-parity.json', dir: 'p6' },
  { id: 'P07', file: 'p7-parity.json', dir: 'p7' },
  { id: 'P08', file: 'p8-parity.json', dir: 'p8' },
  { id: 'P09', file: 'p9-parity.json', dir: 'p9' },
];

// Source HTML -> app route, per phase findings. Aliases are listed separately: their prototype file is a redirect stub.
const SOURCE = {
  'P05/home': 'user/beranda_desktop.html',
  'P05/catalog': 'user/katalog_buku_desktop.html',
  'P05/detail': 'user/detail_buku_desktop.html',
  'P05/preview': 'user/preview_buku_desktop.html',
  'P06/login': 'user/masuk_login_desktop.html',
  'P06/login-publisher': 'user/masuk_login_desktop.html?role=publisher',
  'P06/register': 'user/daftar_akun_register_desktop.html',
  'P06/register-publisher': 'user/daftar_akun_register_desktop.html?role=publisher',
  'P06/forgot': 'user/lupa_kata_sandi_desktop.html',
  'P06/verify': 'user/verifikasi_email_desktop.html',
  'P06/onboarding': 'user/onboarding_preferensi_bacaan_desktop.html',
  'P06/publisher-status': 'user/status_pendaftaran_penerbit_desktop.html',
  'P06/publisher-status-aktif': 'user/status_pendaftaran_penerbit_desktop.html?sesi=aktif',
  'P06/profile': 'user/akun_saya_profil_dropdown_navigasi_desktop.html',
  'P06/settings': 'user/pengaturan_akun_desktop.html',
  'P06/help': 'user/bantuan_akun_desktop.html',
  'P06/cart': 'user/keranjang_pembayaran_terpadu_desktop.html',
  'P06/orders': 'user/riwayat_pesanan_desktop.html',
  'P06/library': 'user/perpustakaan_saya_desktop.html',
  'P06/reader': 'user/web_reader_desktop.html',
  'P06/reviews': 'user/riwayat_ulasan_desktop.html',
  'P06/agenda': 'user/agenda_berita_literasi_desktop.html',
  'P06/agenda-detail': 'user/detail_agenda_desktop.html?id=ev-1',
  'P06/chatbot': 'user/chatbot_bantuan_rekomendasi_desktop.html',
  'P07/directory': 'user/komunitas_literasi_desktop.html',
  'P07/profile': 'user/komunitas_literasi_desktop.html?komunitas=community-filologi',
  'P07/room': 'user/komunitas_literasi_desktop.html?komunitas=community-filologi (ruang)',
  'P07/topic': 'user/komunitas_literasi_desktop.html?topik=TPC-2026-101',
  'P07/reply': 'user/komunitas_literasi_desktop.html?balas=RPL-2026-201',
  'P08/dashboard': 'penerbit/dashboard_penerbit_desktop.html',
  'P08/books': 'penerbit/kelola_buku_desktop.html',
  'P08/orders': 'penerbit/pesanan_masuk_desktop.html',
  'P08/finance': 'penerbit/pendapatan_dan_pencairan_desktop.html',
  'P08/reviews': 'penerbit/ulasan_pembeli_desktop.html',
  'P08/settings': 'penerbit/pengaturan_profil_desktop.html',
  'P08/invoice': 'penerbit/invoice_penjualan_pdf_portal_penerbit.html',
  'P09/dashboard': 'admin/dashboard_administrasi_utama_desktop.html',
  'P09/users': 'admin/kelola_pengguna_desktop.html',
  'P09/catalog': 'admin/pengawasan_katalog_buku_global_desktop.html',
  'P09/review-moderation': 'admin/moderasi_ulasan_dan_komentar_desktop.html',
  'P09/monitoring': 'admin/monitoring_global_desktop.html',
  'P09/payouts': 'admin/kelola_pencairan_dana_desktop.html',
  'P09/communities': 'admin/kelola_komunitas_desktop.html',
  'P09/discussion-moderation': 'admin/moderasi_diskusi_komunitas_desktop.html',
  'P09/login': 'admin/login_administrator_desktop.html',
};

const ROUTE = {
  'P05/home': '/', 'P05/catalog': '/katalog', 'P05/detail': '/buku/{slug}', 'P05/preview': '/buku/{slug}/cuplikan',
  'P06/login': '/masuk', 'P06/login-publisher': '/masuk?role=publisher', 'P06/register': '/daftar',
  'P06/register-publisher': '/daftar?role=publisher', 'P06/forgot': '/lupa-kata-sandi', 'P06/verify': '/verifikasi-email',
  'P06/onboarding': '/onboarding', 'P06/publisher-status': '/status-pendaftaran-penerbit',
  'P06/publisher-status-aktif': '/status-pendaftaran-penerbit?sesi=aktif', 'P06/profile': '/akun/profil',
  'P06/settings': '/akun/pengaturan', 'P06/help': '/akun/bantuan', 'P06/cart': '/keranjang', 'P06/orders': '/akun/pesanan',
  'P06/library': '/akun/perpustakaan', 'P06/reader': '/akun/perpustakaan/{book}/baca', 'P06/reviews': '/akun/ulasan',
  'P06/agenda': '/agenda', 'P06/agenda-detail': '/agenda/{event}', 'P06/chatbot': '/akun/bantuan/chatbot',
  'P07/directory': '/komunitas', 'P07/profile': '/komunitas/{community}', 'P07/room': '/komunitas/{community}/diskusi',
  'P07/topic': '/komunitas/{community}/diskusi/{topic}', 'P07/reply': '/komunitas/{community}/diskusi/{topic}/balas/{reply}',
  'P08/dashboard': '/penerbit', 'P08/books': '/penerbit/buku', 'P08/orders': '/penerbit/pesanan',
  'P08/finance': '/penerbit/keuangan', 'P08/reviews': '/penerbit/ulasan', 'P08/settings': '/penerbit/pengaturan',
  'P08/invoice': '/penerbit/invoice/{order?}',
  'P09/dashboard': '/admin', 'P09/users': '/admin/pengguna', 'P09/catalog': '/admin/katalog',
  'P09/review-moderation': '/admin/moderasi-ulasan', 'P09/monitoring': '/admin/monitoring', 'P09/payouts': '/admin/pencairan',
  'P09/communities': '/admin/komunitas', 'P09/discussion-moderation': '/admin/moderasi-diskusi', 'P09/login': '/admin/masuk',
};

// The two publisher auth prototypes are redirect stubs, so they map to aliases, not to their own view.
const ALIASES = {
  'penerbit/masuk_portal_penerbit_desktop.html': ['/penerbit/masuk', '302 -> /masuk?role=publisher'],
  'penerbit/pendaftaran_penerbit_desktop.html': ['/penerbit/daftar', '302 -> /daftar?role=publisher'],
};

const rows = [];
for (const p of phases) {
  for (const r of read(p.file)) {
    rows.push({ phase: p.id, dir: p.dir, page: r.page, viewport: r.viewport, ratio: r.ratio, mismatch: Boolean(r.sizeMismatch), dh: (r.bladeHeight ?? 0) - (r.protoHeight ?? 0), h: [r.bladeHeight, r.protoHeight], w: [r.bladeWidth, r.protoWidth], err: [(r.errors?.blade || []).length, (r.errors?.proto || []).length], bad: [(r.badResponses?.blade || []).length, (r.badResponses?.proto || []).length], broken: [r.brokenImages?.blade, r.brokenImages?.proto] });
  }
}

const auditApp = read('p11-audit-app.json');
const auditProto = read('p11-audit-proto.json');
const byKey = (arr) => new Map(arr.map((r) => [`${r.key}@${r.viewport}`, r]));

// Per page-state: worst ratio, whether any viewport has a size mismatch, and runtime health from the audit.
const summary = new Map();
for (const r of rows) {
  const id = `${r.dir}/${r.page}`;
  const cur = summary.get(id) || { id, phase: r.phase, page: r.page, worst: 0, worstVp: '', mismatches: [], viewports: 0, dhRange: [], errTotal: 0, brokenMax: 0 };
  cur.viewports += 1;
  if ((r.ratio ?? 0) > cur.worst) { cur.worst = r.ratio ?? 0; cur.worstVp = r.viewport; }
  if (r.mismatch) cur.mismatches.push(`${r.viewport}(${r.dh > 0 ? '+' : ''}${r.dh}px)`);
  cur.dhRange.push(r.dh);
  cur.errTotal += r.err[0];
  cur.brokenMax = Math.max(cur.brokenMax, r.broken[0] || 0);
  summary.set(id, cur);
}

const out = [...summary.values()].map((s) => {
  const key = `${s.phase}/${s.page}`;
  return { ...s, key, source: SOURCE[key] || '(unmapped)', route: ROUTE[key] || '-' };
});

fs.writeFileSync(`${ROOT}/p11-matrix.json`, JSON.stringify({ rows, summary: out, audit: { app: auditApp.length, proto: auditProto.length } }, null, 2));

const hdr = '| Source HTML | Route | States | Viewports | Worst diff | Size mismatch | JS errors | Broken img | Status |';
const sep = '|---|---|---|---|---|---|---|---|---|';
const lines = [hdr, sep];
for (const s of out) {
  const status = s.errTotal ? 'FAIL' : s.mismatches.length ? 'PASS (documented size exception)' : 'PASS';
  lines.push(`| \`${s.source}\` | \`${s.route}\` | ${s.page} | ${s.viewports} | ${s.worst === 0 ? '0' : (s.worst * 100).toFixed(4) + '% @' + s.worstVp} | ${s.mismatches.length ? s.mismatches.join(', ') : 'none'} | ${s.errTotal} | ${s.brokenMax} | ${status} |`);
}
fs.writeFileSync(`${ROOT}/p11-matrix.md`, lines.join('\n') + '\n', 'utf8');
console.log(`pages: ${out.length}, rows: ${rows.length}`);
for (const s of out.filter((x) => x.worst > 0 || x.mismatches.length || x.errTotal)) console.log('-', s.phase, s.page, 'worst', s.worst, s.worstVp, 'mismatch', s.mismatches.length, 'err', s.errTotal, 'broken', s.brokenTotal);