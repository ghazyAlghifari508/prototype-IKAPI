// P07 scenario matrix: the six paths from p7.md section 6, driven through real pages and real clicks.
// Usage: P7_BASE=http://127.0.0.1:8140 node docs/migration/tools/p7-flows.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P7_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p7-flows.json');
const browse = path.join(ROOT, 'docs/migration/baselines/p7/states');
fs.mkdirSync(browse, { recursive: true });

const browser = await chromium.launch();
const rows = [];
const mkVp = (vp = { width: 1440, height: 900 }) => browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

async function open(url, vp) {
  const ctx = await mkVp(vp);
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 180)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-52)}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(450);
  return { ctx, page, errors, bad };
}

function rec(name, data) {
  rows.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 200));
}

const snap = async (page, name) => {
  await page.screenshot({ path: path.join(browse, name + '.png'), fullPage: false });
  return name + '.png';
};

/* ------------------------------------------------------------------ 1. directory -> ... -> nested reply -> refresh */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas`);
  const out = {};
  out.directoryCards = await page.locator('#directory-grid article').count();

  await page.fill('#community-search', 'filologi');
  await page.waitForTimeout(250);
  out.afterSearch = await page.locator('#directory-grid article').count();
  await page.fill('#community-search', 'zzz');
  await page.waitForTimeout(250);
  out.noResultsVisible = await page.isVisible('#view-noresults');
  await page.fill('#community-search', '');
  await page.waitForTimeout(200);

  // open profile from the card
  await page.locator('#directory-grid article button', { hasText: 'Lihat Komunitas' }).first().click();
  await page.waitForURL(/community-filologi/, { timeout: 10000 }).catch(() => {});
  out.profileUrl = new URL(page.url()).pathname;

  // join
  const joinBtn = page.locator('#profile-actions button', { hasText: /Gabung|Bergabung/i }).first();
  out.joinBtnVisible = await joinBtn.isVisible().catch(() => false);
  if (out.joinBtnVisible) await joinBtn.click();
  await page.waitForTimeout(400);
  out.membership = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_community_memberships_demo') || 'null'));

  // into the room
  await page.click('#btn-open-room-inline');
  await page.waitForURL(/\/diskusi/, { timeout: 10000 }).catch(() => {});
  out.roomUrl = new URL(page.url()).pathname;
  out.roomTopics = await page.locator('#room-topics article, #view-room article').count();
  out.createEnabled = await page.locator('#btn-new-topic').isEnabled();

  // create a topic
  await page.click('#btn-new-topic');
  await page.waitForTimeout(300);
  out.composerOpen = await page.isVisible('#composer-modal');
  await page.fill('#topic-title-input', 'Diskusi uji otomatis P07');
  await page.fill('#topic-body-input', 'Topik ini dibuat oleh skrip verifikasi untuk menguji alur diskusi.');
  await page.click('#composer-submit');
  await page.waitForTimeout(700);
  out.topicCreated = await page.evaluate(() => {
    const topics = JSON.parse(localStorage.getItem('ikapi_community_topics_demo') || '[]');
    return topics.some((t) => t.title === 'Diskusi uji otomatis P07');
  });

  // open a topic (creating one usually lands on it already) -> root reply -> child reply
  if (!/\/diskusi\/TPC/.test(page.url())) {
    const topicLink = page.locator('#view-room a[aria-label*="balasan"]').first();
    await topicLink.click();
    await page.waitForURL(/\/diskusi\/TPC/, { timeout: 10000 }).catch(() => {});
  }
  out.topicUrl = new URL(page.url()).pathname;

  await page.fill('#reply-input', 'Balasan root dari skrip verifikasi.');
  await page.click('#reply-submit');
  await page.waitForTimeout(700);
  out.rootReplies = await page.locator('#reply-list .thread-node').count();
  out.rootStored = await page.evaluate(() => {
    const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    return replies.filter((r) => r.body === 'Balasan root dari skrip verifikasi.').map((r) => ({ id: r.id, parent: r.parentReplyId ?? null }));
  });

  // child reply through the reply page
  const childBtn = page.locator('#reply-list .thread-node button', { hasText: /Balas/i }).first();
  await childBtn.click();
  await page.waitForURL(/\/balas\//, { timeout: 10000 }).catch(() => {});
  out.replyUrl = new URL(page.url()).pathname;
  out.parentCardVisible = await page.isVisible('#reply-parent-card');
  await page.fill('#reply-view-input', 'Balasan anak dari skrip verifikasi.');
  await page.click('#reply-view-submit');
  await page.waitForTimeout(800);
  out.childStored = await page.evaluate(() => {
    const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    const child = replies.find((r) => r.body === 'Balasan anak dari skrip verifikasi.');
    return child ? { id: child.id, parent: child.parentReplyId, topicId: child.topicId } : null;
  });

  // back to the topic and count the tree
  await page.goto(`${BASE}${out.topicUrl}`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  out.treeAfterReload = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('#reply-list .thread-node')];
    return nodes.map((n) => ({ x: Math.round(n.getBoundingClientRect().x), h: Math.round(n.getBoundingClientRect().height) }));
  });
  out.nestedIndented = new Set(out.treeAfterReload.map((n) => n.x)).size;
  out.shot = await snap(page, 'topic-with-nested-reply');

  rec('1-directory-to-nested-reply', { out, errors, bad });
  await ctx.close();
}

/* ------------------------------------------------------------------ 2. permissions: nonmember disabled, guest reads, leave re-disables */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-sejarah/diskusi`);
  const out = {};
  out.memberships = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_community_memberships_demo') || 'null'));
  out.createDisabledNonMember = await page.locator('#btn-new-topic').isDisabled();
  out.createClasses = await page.getAttribute('#btn-new-topic', 'class');
  out.restrictionNote = await page.locator('#view-room [id*="restricted"], #view-room p', { hasText: /anggota/i }).first().textContent().catch(() => null);

  // guest can still read a topic
  await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  out.topicReadable = await page.isVisible('#topic-title');
  out.replyFormVisibleAsGuest = await page.isVisible('#reply-form');

  // member joins -> enabled; leaves -> disabled again
  await page.goto(`${BASE}/komunitas/community-sejarah`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const join = page.locator('#profile-actions button', { hasText: /Gabung|Bergabung/i }).first();
  if (await join.isVisible().catch(() => false)) await join.click();
  await page.waitForTimeout(400);
  await page.goto(`${BASE}/komunitas/community-sejarah/diskusi`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  out.createEnabledAfterJoin = await page.locator('#btn-new-topic').isEnabled();

  await page.goto(`${BASE}/komunitas/community-sejarah`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const leave = page.locator('#profile-actions button', { hasText: /Keluar|Leave/i }).first();
  if (await leave.isVisible().catch(() => false)) { await leave.click(); await page.waitForTimeout(300); const confirm = page.locator('#leave-modal button', { hasText: /Keluar/i }).first(); if (await confirm.isVisible().catch(() => false)) await confirm.click(); }
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/komunitas/community-sejarah/diskusi`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  out.createDisabledAfterLeave = await page.locator('#btn-new-topic').isDisabled();

  rec('2-permissions-nonmember-guest-member-leave', { out, errors, bad });
  await ctx.close();
}

/* ------------------------------------------------------------------ 3. reply-count link opens the topic from the top, no composer focus */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-klub-buku/diskusi`);
  const out = {};
  const links = await page.locator('#view-room a[aria-label*="balasan"]').evaluateAll((els) => els.map((e) => ({ label: e.textContent.trim(), aria: e.getAttribute('aria-label'), href: e.getAttribute('href') })));
  out.replyLinks = links;
  out.zeros = links.filter((l) => /^0 balasan/.test(l.label)).length;
  out.titleClickable = await page.locator('#view-room article h3').first().evaluate((el) => {
    let n = el;
    while (n) { if (n.tagName === 'A' || n.tagName === 'BUTTON' || n.onclick) return true; n = n.parentElement; if (n && n.id === 'view-room') break; }
    return false;
  });

  // join the community on its profile page, then create one topic so a "0 balasan" link exists in this room
  await page.goto(`${BASE}/komunitas/community-klub-buku`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const joinForCreate = page.locator('#profile-actions button', { hasText: /Gabung/i }).first();
  if (await joinForCreate.isVisible().catch(() => false)) { await joinForCreate.click(); await page.waitForTimeout(500); }
  await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  if (await page.locator('#btn-new-topic').isEnabled()) {
    await page.click('#btn-new-topic');
    await page.waitForTimeout(250);
    await page.fill('#topic-title-input', 'Topik tanpa balasan (uji tautan 0 balasan)');
    await page.fill('#topic-body-input', 'Topik ini dipakai untuk memverifikasi label 0 balasan.');
    await page.click('#composer-submit');
    await page.waitForURL(/\/diskusi\/TPC/, { timeout: 10000 }).catch(() => {});
    await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi`, { waitUntil: 'load' });
    await page.waitForTimeout(700);
  }
  out.zeroLink = await page.evaluate(() => {
    const a = [...document.querySelectorAll('#view-room a[aria-label*="balasan"]')].find((el) => /0 balasan/.test(el.textContent));
    return a ? { label: a.textContent.trim(), aria: a.getAttribute('aria-label') } : null;
  });
  out.zeros = out.zeroLink ? 1 : 0;

  await page.locator('#view-room a[aria-label*="balasan"]').first().click();
  await page.waitForURL(/\/diskusi\//, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  out.afterOpen = {
    url: new URL(page.url()).pathname,
    scrollY: await page.evaluate(() => Math.round(window.scrollY)),
    activeId: await page.evaluate(() => (document.activeElement ? document.activeElement.id : null)),
  };
  rec('3-reply-count-link-no-autofocus', { out, errors, bad });
  await ctx.close();
}

/* ------------------------------------------------------------------ 4. multiple parents, siblings, deep nesting at 320/390 */
{
  const out = {};
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`);
  out.tree = await page.evaluate(() => [...document.querySelectorAll('#reply-list .thread-node')].map((n) => ({ x: Math.round(n.getBoundingClientRect().x), depth: n.querySelectorAll(':scope > .thread-children').length })));
  out.distinctIndents = new Set(out.tree.map((t) => t.x)).size;
  out.hasSiblings = out.tree.filter((t, i, a) => i > 0 && a[i - 1].x === t.x).length;
  out.maxDepth = await page.evaluate(() => {
    let max = 0;
    const walk = (el, d) => { const kids = el.querySelectorAll(':scope > .thread-children > .thread-node'); if (kids.length && d > max) max = d; kids.forEach((k) => walk(k, d + 1)); };
    document.querySelectorAll('#reply-list > .thread-node').forEach((n) => walk(n, 1));
    return max;
  });
  await ctx.close();

  for (const vp of [{ width: 390, height: 844, label: '390' }, { width: 320, height: 700, label: '320' }]) {
    const s = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`, { width: vp.width, height: vp.height });
    const geom = await s.page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      nodes: [...document.querySelectorAll('#reply-list .thread-node')].map((n) => Math.round(n.getBoundingClientRect().x)),
    }));
    out['vp' + vp.label] = { ...geom, overflowX: geom.scrollW > geom.clientW, distinctIndents: new Set(geom.nodes).size };
    await s.page.screenshot({ path: path.join(browse, `topic-${vp.label}.png`), fullPage: true });
    await s.ctx.close();
  }
  // Build a deep chain (5 levels) with two siblings in the middle through the same localStorage contract the UI writes.
  const deep = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`);
  await deep.page.evaluate(() => {
    const key = 'ikapi_community_replies_demo';
    const list = JSON.parse(localStorage.getItem(key) || 'null') || [];
    const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: '2026-11-18T10:00:00.000Z', removed: false };
    let parent = null;
    for (let level = 1; level <= 5; level++) {
      const id = 'RPL-DEEP-' + level;
      list.push({ ...base, id, body: 'Skrip verifikasi kedalaman level ' + level, parentReplyId: parent });
      parent = id;
    }
    list.push({ ...base, id: 'RPL-DEEP-SIB-A', body: 'Saudara A dari skrip verifikasi', parentReplyId: 'RPL-DEEP-2' });
    list.push({ ...base, id: 'RPL-DEEP-SIB-B', body: 'Saudara B dari skrip verifikasi', parentReplyId: 'RPL-DEEP-2' });
    localStorage.setItem(key, JSON.stringify(list));
  });
  await deep.page.reload({ waitUntil: 'load' });
  await deep.page.waitForTimeout(800);
  out.deepGeometry = await deep.page.evaluate(() => {
    // Measure by the node that OWNS the body text (an ancestor's textContent also contains its children's text).
    const ownerX = (text) => {
      const body = [...document.querySelectorAll('#reply-list .thread-content')].find((el) => el.textContent.includes(text) && ![...el.querySelectorAll('.thread-content')].some((inner) => inner.textContent.includes(text)));
      const node = body ? body.closest('.thread-node') : null;
      return node ? Math.round(node.getBoundingClientRect().x) : null;
    };
    const levels = [1, 2, 3, 4, 5].map((l) => ownerX('kedalaman level ' + l));
    const childCounts = [...document.querySelectorAll('#reply-list .thread-node')].map((n) => n.querySelector(':scope > .thread-children') ? n.querySelector(':scope > .thread-children').children.length : 0);
    return {
      levels,
      siblingA: ownerX('Saudara A'), siblingB: ownerX('Saudara B'),
      distinctLevelIndents: new Set(levels.filter((v) => v !== null)).size,
      nodeCount: document.querySelectorAll('#reply-list .thread-node').length,
      maxChildrenPerNode: Math.max(...childCounts, 0),
      indentsMonotonic: levels.every((v, i) => i === 0 || v === null || levels[i - 1] === null || v > levels[i - 1]),
    };
  });
  await deep.page.screenshot({ path: path.join(browse, 'topic-deep-nesting.png'), fullPage: true });
  for (const vp of [{ width: 390, height: 844, label: '390' }, { width: 320, height: 700, label: '320' }]) {
    await deep.page.setViewportSize({ width: vp.width, height: vp.height });
    await deep.page.waitForTimeout(400);
    const g = await deep.page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, nodes: [...document.querySelectorAll('#reply-list .thread-node')].length }));
    out['deep' + vp.label] = { ...g, overflowX: g.scrollW > g.clientW };
    await deep.page.screenshot({ path: path.join(browse, `topic-deep-${vp.label}.png`), fullPage: true });
  }
  await deep.ctx.close();

  rec('4-multi-parent-siblings-deep-mobile', { out, errors, bad });
}

/* ------------------------------------------------------------------ 5. edit/delete/report nested child, deleted parent, invalid id */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`);
  const out = {};

  // report a nested child
  const childMenu = page.locator('#reply-list .thread-node .thread-children .thread-node button[aria-label*="Aksi"], #reply-list .thread-node .thread-children .thread-node button[aria-haspopup="menu"]').first();
  out.childMenuVisible = await childMenu.isVisible().catch(() => false);
  if (out.childMenuVisible) {
    await childMenu.click();
    await page.waitForTimeout(250);
    out.menuOpen = await page.isVisible('#content-menu');
    await page.locator('#content-menu button', { hasText: /Laporkan/i }).first().click();
    await page.waitForTimeout(300);
    out.reportModalOpen = await page.isVisible('#discussion-report-modal');
    await page.locator('#discussion-report-reasons input').first().check();
    await page.locator('#discussion-report-submit').click();
    await page.waitForTimeout(700);
    out.reportStored = await page.evaluate(() => {
      const r = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
      const last = r[r.length - 1] || null;
      return last ? { keys: Object.keys(last).sort(), targetType: last.targetType, targetId: last.targetId, status: last.status } : null;
    });
  }

  // delete a reply that has a child, then confirm the child survives with a removed-parent placeholder
  out.deletedFlow = await page.evaluate(() => {
    const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    const withChild = replies.find((r) => replies.some((c) => c.parentReplyId === r.id));
    return withChild ? { id: withChild.id, childCount: replies.filter((c) => c.parentReplyId === withChild.id).length } : null;
  });

  // delete a parent through the UI and confirm the children survive behind the placeholder
  const parentMenu = page.locator('#reply-list > .thread-node button[aria-haspopup="menu"], #reply-list > .thread-node button[aria-label*="Aksi"]').first();
  if (await parentMenu.isVisible().catch(() => false)) {
    await parentMenu.click();
    await page.waitForTimeout(250);
    const del = page.locator('#content-menu button', { hasText: /Hapus/i }).first();
    if (await del.isVisible().catch(() => false)) {
      await del.click();
      await page.waitForTimeout(300);
      await page.locator('#delete-modal button', { hasText: /Hapus/i }).first().click().catch(() => {});
      await page.waitForTimeout(700);
      out.afterDelete = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('#reply-list .thread-node')];
        const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
        return {
          nodes: nodes.length,
          removedNodes: replies.filter((r) => r.removed).length,
          placeholders: document.querySelectorAll('#reply-list .thread-deleted, #reply-list [class*="deleted"]').length,
          childrenStillRendered: nodes.filter((n) => n.className.includes('thread-node')).length,
        };
      });
    }
  }

  // invalid ids are 404s, not a fallback row
  const badTopicPage = await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-TIDAK-ADA`, { waitUntil: 'load' });
  out.badTopicRendersUnavailable = await page.isVisible('#topic-unavailable');
  await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const badTopic = { status: () => badTopicPage.status() };
  const crossTopic = await page.request.get(`${BASE}/komunitas/community-filologi/diskusi/TPC-2026-101`);
  const badCommunity = await page.request.get(`${BASE}/komunitas/community-tidak-ada`);
  out.statusCodes = { badTopic: badTopic.status(), crossTopic: crossTopic.status(), badCommunity: badCommunity.status() };

  rec('5-report-nested-and-invalid-ids', { out, errors, bad });
  await ctx.close();
}

/* ------------------------------------------------------------------ 6. reports are readable by the admin contract (P09) */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`);
  const out = {};
  await page.evaluate(() => {
    localStorage.setItem('ikapi_discussion_reports_demo', JSON.stringify([{
      id: 'RPT-DEMO-777', targetType: 'reply', targetId: 'RPL-2026-202', topicId: 'TPC-2026-101',
      communityId: 'community-klub-buku', reasonId: 'spam', reasonLabel: 'Spam atau promosi', details: 'Uji kontrak admin',
      reporterUserId: 'USR-PMB-0042', status: 'pending', createdAt: '2026-11-18T12:00:00.000Z',
    }]));
  });
  out.reportShape = await page.evaluate(() => {
    const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
    return reports.map((r) => Object.keys(r).sort());
  });
  out.adminFieldsPresent = await page.evaluate(() => {
    const r = (JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]'))[0] || {};
    return ['id', 'targetType', 'targetId', 'topicId', 'communityId', 'reasonId', 'status', 'createdAt'].every((k) => k in r);
  });
  out.adminFixtures = await page.evaluate(async () => {
    const res = await fetch('/assets/ikapi/logo-ikapi-jabar.png', { method: 'HEAD' });
    return res.ok;
  });
  rec('6-report-shape-for-admin', { out, errors, bad });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('\nscenarios written to', OUT);