#!/usr/bin/env python
"""P07 build: community SPA views -> 5 Blade pages + one shared JS core.

The prototype keeps the whole community flow in one HTML file with in-page view switching. The migration keeps
one implementation of the data layer and renderers (resources/js/ikapi/p7/community-core.js, ported verbatim) and
turns each view into its own Blade page with its own URL. In-page switching (explore/noresults/empty) stays local;
cross-view switches become real navigations.
"""
import io
import json
import os
import re

ROOT = os.getcwd()
SRC = 'docs/migration/p7-source'
VIEWS = 'resources/views'
JS = 'resources/js/ikapi/p7'
PROTO = 'docs/design/prototype-copy/user/komunitas_literasi_desktop.html'

PRELUDE = """@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \\Illuminate\\Support\\Facades\\Route::has($name) ? route($name, $params) : '#';
    $ikapiP7 = [
        'page' => '{cfg['page']}',
        'directoryUrl' => route('community'),
        'communityId' => $communityId ?? null,
        'topicId' => $topicId ?? null,
        'replyId' => $replyId ?? null,
    ];
@endphp
"""


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)


def frag(name):
    return read(os.path.join(SRC, name))


def indent(html, spaces=2):
    lines = html.split('\n')
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    widths = [len(ln) - len(ln.lstrip(' ')) for ln in lines if ln.strip()]
    cut = min(widths) if widths else 0
    pad = ' ' * spaces
    return '\n'.join((pad + ln[cut:]) if ln.strip() else '' for ln in lines)


def rewrite(html):
    """Assets only: the community views have no static hrefs (all navigation runs through the core router)."""
    return re.sub(
        r'(src|href)="(?:\.\./)+assets/([^"]+)"',
        lambda m: '%s="{{ asset(\'assets/ikapi/%s\') }}"' % (m.group(1), m.group(2)),
        html,
    )



def inject_payload(text, page):
    """Declare the page payload ($ikapiP7) next to the $links helper: Blade needs a real array for @json."""
    if "'page' =>" in text:
        return text
    out = []
    for line in text.split(chr(10)):
        out.append(line)
        if line.strip().startswith('$links = fn'):
            out += [
                '    $ikapiP7 = [',
                "        'page' => '%s'," % page,
                "        'directoryUrl' => route('community'),",
                "        'communityId' => $communityId ?? null,",
                "        'topicId' => $topicId ?? null,",
                "        'replyId' => $replyId ?? null,",
                '    ];',
            ]
    return chr(10).join(out)

def page_style():
    """The prototype's own <style> block: thread rail/connector geometry, scrollbar helper, reduced motion."""
    html = read(PROTO)
    blocks = re.findall(r"<style>(.*?)</style>", html, re.S)
    if not blocks:
        return ""
    css = (chr(10) + chr(10)).join(b.strip(chr(10)) for b in blocks)
    # Wrapped in @layer utilities for the same measured reason as P06: the source CSS was unlayered next to
    # unlayered v3 utilities, so specificity decided; keeping it in the utilities layer reproduces that.
    body = "@push('head')" + chr(10) + '<style>' + chr(10) + '@layer utilities {' + chr(10) + '%s' + chr(10) + '}' + chr(10) + '</style>' + chr(10) + '@endpush' + chr(10)
    return body % css.strip()

PAGES = {
    'directory': {
        'view': 'buyer/community/index',
        'note': 'Community directory: hero, search, focus filter and the community grid (states: results, no results, empty).',
        'title': 'Komunitas Literasi — IKAPI Store Jawa Barat',
        'parts': ['section-hero.html', 'section-chrome.html', 'view-view-explore.html', 'view-view-noresults.html', 'view-view-empty.html'],
        'page': 'directory',
    },
    'profile': {
        'view': 'buyer/community/show',
        'note': 'Community profile: identity, focus, location, join/leave, member list and the latest-discussion preview.',
        'title': 'Profil Komunitas — IKAPI Store Jawa Barat',
        'parts': ['section-chrome.html', 'view-view-profile.html'],
        'page': 'profile',
    },
    'discussion': {
        'view': 'buyer/community/discussion',
        'note': 'Discussion room: heading, sort tabs, disabled create-topic UI for non-members and the topic list.',
        'title': 'Ruang Diskusi — IKAPI Store Jawa Barat',
        'parts': ['section-chrome.html', 'view-view-room.html'],
        'page': 'room',
    },
    'topic': {
        'view': 'buyer/community/topic',
        'note': 'Topic detail: root post, reply tree with connectors, per-reply edit/delete/report, root composer.',
        'title': 'Detail Topik — IKAPI Store Jawa Barat',
        'parts': ['section-chrome.html', 'view-view-topic.html'],
        'page': 'topic',
    },
    'reply': {
        'view': 'buyer/community/reply',
        'note': 'Reply-to-comment page: the target comment, the unavailable state and a dedicated child-reply composer.',
        'title': 'Balas Komentar — IKAPI Store Jawa Barat',
        # The reply page carries the hidden topic view too: openTopic()/renderReplies() are the prototype's own
        # functions and they paint that view before the reply composer opens. It stays hidden here (paintView
        # switches to `reply`), so nothing of it is visible, and no markup is duplicated by hand.
        'parts': ['section-chrome.html', 'view-view-topic.html', 'view-view-reply.html'],
        'page': 'reply',
    },
}

OVERLAYS = ['child-composer-modal-02.html', 'child-discussion-report-modal-03.html', 'child-delete-modal-04.html',
            'child-content-menu-05.html', 'child-leave-modal-06.html', 'child-sr-announcer-07.html']

for key, cfg in PAGES.items():
    view_parts = [p for p in cfg['parts'] if p.startswith('view-')]
    other_parts = [p for p in cfg['parts'] if not p.startswith('view-')]
    body_parts = [indent(rewrite(frag(p))) for p in other_parts]
    # The source keeps every view inside one max-w-[1360px] container; that container centres and pads the page,
    # so it travels together with the views instead of being re-invented per Blade page.
    if view_parts:
        inner = (chr(10) + chr(10)).join(indent(rewrite(frag(p)), 4) for p in view_parts)
        body_parts.append('  <div class="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4">' + chr(10) + inner + chr(10) + '  </div>')
    body = (chr(10) + chr(10)).join(body_parts)
    ov = '\n\n'.join(indent(rewrite(frag(o))) for o in OVERLAYS)
    data_attrs = 'data-page="%s" data-community="{{ $communityId ?? \'\' }}" data-topic="{{ $topicId ?? \'\' }}" data-reply="{{ $replyId ?? \'\' }}"' % cfg['page']
    out = f"""{{--
  {cfg['note']}
  Source: {PROTO} (view markup `{', '.join(cfg['parts'])}`, 3084-line SPA split into pages in P07).
  Markup, classes, ids and copy are verbatim; routing/handlers live in resources/js/ikapi/p7/community-core.js.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \\Illuminate\\Support\\Facades\\Route::has($name) ? route($name, $params) : '#';
    $ikapiP7 = [
        'page' => '{cfg['page']}',
        'directoryUrl' => route('community'),
        'communityId' => $communityId ?? null,
        'topicId' => $topicId ?? null,
        'replyId' => $replyId ?? null,
    ];
@endphp


@extends('layouts.public')

@section('title', '{cfg['title']}')

@section('header_z', 'z-40')
@section('account', 'guest')
@section('cart_count', '2')
@section('current_route', 'community')
@section('search_placeholder', 'Cari judul buku, penulis, atau komunitas...')
@section('main_pt', 'pt-32')
@section('chatbot', '1')
@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex w-full flex-col" id="community-root" {data_attrs}>
{body}
  </div>
@endsection

@push('overlays')
{ov}
@endpush

@push('scripts')
<script>
  window.IKAPI_P7 = @json($ikapiP7);
</script>
@endpush
"""
    # the escaped IIFE braces above are for this python f-string only
    out = out.replace("'%s'", "'" + cfg['page'] + "'")
    out = out.replace('{--', '{{--', 1).replace('--}' + chr(10), '--}}' + chr(10), 1)
    out = inject_payload(out, cfg['page'])
    out = out.replace("@extends('layouts.public')", "@extends('layouts.public')" + chr(10) + page_style())
    write(os.path.join(VIEWS, cfg['view'] + '.blade.php'), out)
    print('view  ', cfg['view'] + '.blade.php')

# ---------------------------------------------------------------------------------------------------------------
# JS core: both source <script> blocks, verbatim, plus a router shim and per-page boot.
# ---------------------------------------------------------------------------------------------------------------
html = read(PROTO)
blocks = re.findall(r'<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)</script>', html)
discovery, discussion = blocks[1][1], blocks[2][1]


def detach_boot(src, fn_name):
    """Turn the source's DOMContentLoaded handler into a named function we can call after the stub is installed."""
    marker = "document.addEventListener('DOMContentLoaded', function () {"
    i = src.find(marker)
    if i < 0:
        raise SystemExit('boot marker missing')
    src = src[:i] + 'function %s() {' % fn_name + src[i + len(marker):]
    j = src.rfind('});')
    if j < 0:
        raise SystemExit('boot closing missing')
    return src[:j] + '}' + src[j + 3:]


# The source builds community photo URLs relative to the HTML file ('../../assets/...'); in the app the same
# files are served from /assets/ikapi, so the prefix is rewritten once here (identical to P05-P06).
ASSET_FIX = [("'../../assets/", "'/assets/ikapi/"), ('\"../../assets/', '\"/assets/ikapi/')]
for a, b in ASSET_FIX:
    discovery = discovery.replace(a, b)
    discussion = discussion.replace(a, b)

discovery = detach_boot(discovery, 'bootDiscovery')
discussion = detach_boot(discussion, 'bootDiscussion')

core = """// Community core: ONE port of the prototype's two community <script> blocks (discovery/membership and
// discussion). The source is a single-page app that switches views in place; here each view is its own Blade page,
// so the only behavioural changes are (a) `showView` navigates for cross-page views and (b) the two boot handlers
// run once with a tolerant `getElementById`, because no page contains every control the SPA had.
//
// Ported from docs/design/prototype-copy/user/komunitas_literasi_desktop.html lines 1-3084. Nothing is retyped:
// the data layer (localStorage keys), the reply graph normaliser, the renderers and the permission paint are the
// prototype's own code, wrapped here.
import { onReady } from '../shared.js';

export function initCommunity(cfg) {
  // Boot once per page. The bundle carries one thin boot per community screen; a duplicated boot would
  // bind the reply/comment handlers twice (measured: five listeners on #reply-view-form -> five replies).
  if (window.__ikapiCommunityBooted) return;
  window.__ikapiCommunityBooted = true;

  var CORE = { page: cfg.page, booting: true, directoryUrl: cfg.directoryUrl };

  /* ---------- source: discovery + membership ---------- */
%s

  /* ---------- source: discussion (topics, replies, reports) ---------- */
%s

  /* ---------- router: cross-page actions become real navigations ---------- */
  /* The source switches views in place. Here each open*() that would leave the current page navigates instead,
     and only paints when the page is booting (its own initial render) or when the target lives on this page. */
  var paintView = showView;

  function communityPath(suffix) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    var community = activeCommunityId || (typeof profileId !== 'undefined' ? profileId : null) || cfg.communityId;
    if (!community) return null;
    return base + '/' + encodeURIComponent(community) + (suffix || '');
  }

  function go(path) {
    if (CORE.booting || !path) return false;
    window.location.href = path;
    return true;
  }

  /* The source wrote `?topik=<id>` into the reply-count link and intercepted the click. With real pages that href
     would point at the room again, so the href is rewritten to the topic path; the click still goes through
     openTopic(), which navigates to the same place. */
  var sourceBuildTopicRow = buildTopicRow;
  buildTopicRow = function (topic) {
    var row = sourceBuildTopicRow(topic);
    var link = row.querySelector("a[aria-label*='balasan']");
    if (link) link.setAttribute('href', communityPathFor(topic.communityId, '/diskusi/' + encodeURIComponent(topic.id)));
    return row;
  };

  var paintOpenProfile = openProfile;
  openProfile = function (communityId, trigger) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    if (go(communityId ? base + '/' + encodeURIComponent(communityId) : null)) return;
    paintOpenProfile(communityId, trigger);
  };

  var paintOpenRoom = openRoom;
  openRoom = function (communityId) {
    if (go(communityId ? communityPathFor(communityId, '/diskusi') : null)) return;
    paintOpenRoom(communityId);
  };

  var paintOpenTopic = openTopic;
  openTopic = function (topicId) {
    var community = activeCommunityId || cfg.communityId;
    if (go(community && topicId ? communityPathFor(community, '/diskusi/' + encodeURIComponent(topicId)) : null)) return;
    paintOpenTopic(topicId);
  };

  var paintOpenReplyView = openReplyView;
  openReplyView = function (replyId) {
    var community = activeCommunityId || cfg.communityId;
    var topic = activeTopicId || cfg.topicId;
    if (go(community && topic && replyId ? communityPathFor(community, '/diskusi/' + encodeURIComponent(topic) + '/balas/' + encodeURIComponent(replyId)) : null)) return;
    paintOpenReplyView(replyId);
  };

  function communityPathFor(communityId, suffix) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    return base + '/' + encodeURIComponent(communityId) + suffix;
  }

  /* The SPA boot wired every control in one file; a single page only owns some of them, so missing ids are
     tolerated while the boot runs and the real lookup is restored immediately afterwards. */
  function tolerateMissing(fn) {
    var real = document.getElementById;
    var stub = document.createElement('div');
    document.getElementById = function (id) { return real.call(document, id) || stub; };
    try { fn(); } finally { document.getElementById = real; }
  }

  tolerateMissing(bootDiscovery);
  tolerateMissing(bootDiscussion);

  /* ---------- page boot ---------- */
  if (CORE.page === 'profile' && cfg.communityId) {
    openProfile(cfg.communityId);
  } else if (CORE.page === 'room' && cfg.communityId) {
    openRoom(cfg.communityId);
  } else if (CORE.page === 'topic' && cfg.topicId) {
    if (cfg.communityId) activeCommunityId = cfg.communityId;
    openTopic(cfg.topicId);
  } else if (CORE.page === 'reply' && cfg.topicId) {
    if (cfg.communityId) activeCommunityId = cfg.communityId;
    openTopic(cfg.topicId);
    if (cfg.replyId) openReplyView(cfg.replyId);
    else {
      activeReplyParentId = null;
      var card = document.getElementById('reply-parent-card');
      var unavailable = document.getElementById('reply-parent-unavailable');
      var form = document.getElementById('reply-view-form');
      var restricted = document.getElementById('reply-view-restricted');
      if (card) card.classList.add('hidden');
      if (unavailable) unavailable.classList.remove('hidden');
      if (form) form.classList.add('hidden');
      if (restricted) restricted.classList.add('hidden');
      showView('reply');
    }
  } else {
    paintView('explore');
  }

  CORE.booting = false;

  /* Re-navigating to the same view (e.g. Back to the topic you are already on) must still repaint, so the
     browse entries that call showView on a hidden target keep working after the boot flag is cleared. */
  /* The prototype markup calls these from inline handlers; ES modules are scoped, so publish them. */
  Object.assign(window, { handleSearchInput: handleSearchInput, resetSearchState: resetSearchState, selectFilter: selectFilter, setSimState: setSimState, toggleDemoSession: toggleDemoSession });

  window.IkapiCommunity = {
    page: CORE.page,
    refresh: function () {
      if (CORE.page === 'topic' && cfg.topicId) openTopic(cfg.topicId);
      else if (CORE.page === 'room' && cfg.communityId) openRoom(cfg.communityId);
      else if (CORE.page === 'profile' && cfg.communityId) openProfile(cfg.communityId);
      else paintView('explore');
    },
  };
}
""" % (discovery, discussion)

write(os.path.join(JS, 'community-core.js'), core)
print('js    ', 'resources/js/ikapi/p7/community-core.js', core.count('\n') + 1, 'lines')

# ---------------------------------------------------------------------------------------------------------------
# Page modules: read the root's data attributes and hand them to the core.
# ---------------------------------------------------------------------------------------------------------------
for key, cfg in PAGES.items():
    mod = """// %s
// Thin page boot: ids come from the Blade root (#community-root data-*), never from a hardcoded sample row.
import { onReady } from '../shared.js';
import { initCommunity } from './community-core.js';

onReady(function () {
    var root = document.getElementById('community-root');
    if (!root) return;
    // All five community page modules ship in one bundle, so each one boots only its own screen.
    if (root.getAttribute('data-page') !== '%s') return;

    initCommunity({
        page: root.getAttribute('data-page'),
        directoryUrl: (window.IKAPI_P7 && window.IKAPI_P7.directoryUrl) || '/komunitas',
        communityId: root.getAttribute('data-community') || null,
        topicId: root.getAttribute('data-topic') || null,
        replyId: root.getAttribute('data-reply') || null,
    });
});
""" % (cfg['note'], cfg['page'])
    if key == 'directory':
        mod = mod.replace("root.getAttribute('data-page') !== 'directory'", "root.getAttribute('data-page') !== 'directory'")
    if key == 'profile':
        mod = mod.replace("root.getAttribute('data-page') !== 'profile'", "root.getAttribute('data-page') !== 'profile'")
    if key == 'discussion':
        mod = mod.replace("root.getAttribute('data-page') !== 'discussion'", "root.getAttribute('data-page') !== 'discussion'")
    if key == 'topic':
        mod = mod.replace("root.getAttribute('data-page') !== 'topic'", "root.getAttribute('data-page') !== 'topic'")
    if key == 'reply':
        mod = mod.replace("root.getAttribute('data-page') !== 'reply'", "root.getAttribute('data-page') !== 'reply'")
    mod = mod.replace("root.getAttribute('data-page') !== 'profile'", "root.getAttribute('data-page') !== 'profile'")
    write(os.path.join(JS, key + '.js'), mod)
    print('js    ', 'resources/js/ikapi/p7/%s.js' % key)