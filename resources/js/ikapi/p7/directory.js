// Community directory: hero, search, focus filter and the community grid (states: results, no results, empty).
// Thin page boot: ids come from the Blade root (#community-root data-*), never from a hardcoded sample row.
import { onReady } from '../shared.js';
import { initCommunity } from './community-core.js';

onReady(function () {
    var root = document.getElementById('community-root');
    if (!root) return;
    // All five community page modules ship in one bundle, so each one boots only its own screen.
    if (root.getAttribute('data-page') !== 'directory') return;

    initCommunity({
        page: root.getAttribute('data-page'),
        directoryUrl: (window.IKAPI_P7 && window.IKAPI_P7.directoryUrl) || '/komunitas',
        communityId: root.getAttribute('data-community') || null,
        topicId: root.getAttribute('data-topic') || null,
        replyId: root.getAttribute('data-reply') || null,
    });
});
