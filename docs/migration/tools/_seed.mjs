import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html', { waitUntil: 'load' });
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const out = { hasFn: typeof seedTopics, type: '-', topics: null, replies: null, err: null };
  try {
    out.type = typeof seedTopics === 'function' ? 'function' : typeof seedTopics;
    out.topics = typeof seedTopics === 'function' ? seedTopics() : null;
    out.replies = typeof seedReplies === 'function' ? seedReplies() : null;
  } catch (e) { out.err = String(e); }
  return out;
});
console.log('hasFn', r.type, 'err', r.err, 'topics', Array.isArray(r.topics) ? r.topics.length : null, 'replies', Array.isArray(r.replies) ? r.replies.length : null);
if (r.topics) {
  const seed = JSON.parse(fs.readFileSync('resources/data/ikapi/community-seed.json', 'utf8'));
  seed.topics = r.topics;
  seed.replies = r.replies;
  fs.writeFileSync('resources/data/ikapi/community-seed.json', JSON.stringify(seed, null, 2) + '\n');
  console.log('written topics/replies to community-seed.json');
  console.log('topic[0]:', JSON.stringify(r.topics[0]).slice(0, 300));
  console.log('reply[0]:', JSON.stringify(r.replies[0]).slice(0, 300));
}
await b.close();
