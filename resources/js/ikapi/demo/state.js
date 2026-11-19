/*
| IKAPI demo state layer (frontend-only).
|
| The prototype keeps its demo data in localStorage with `ikapi_*` keys. This module is the single
| owner of those keys: pages never call localStorage directly, so a key can be migrated or renamed
| without hunting through views. Existing keys are honoured as-is (no destructive migration).
|
| Boundaries: no backend, no auth, no database. Anything written here lives in one browser only.
*/
(function (window) {
    'use strict';

    /* Registry copied from the P01 audit (21 keys). Every key that already exists in the prototype
       keeps its exact string so demo data written by the HTML prototype stays readable. */
    var KEYS = {
        buyerSession: 'ikapi_buyer_session_demo',
        adminSession: 'ikapi_admin_session_demo',
        publisherApplication: 'ikapi_publisher_application_demo',
        publisherStatusPreview: 'ikapi_publisher_status_preview',
        userProfile: 'ikapi_user_profile',
        userPreferences: 'ikapi_user_preferences',
        readingPrefs: 'ikapi_reading_prefs_demo',
        rating: 'ikapi_rating_laskar_aksara',
        reviewHistory: 'ikapi_user_review_history',
        bookReports: 'ikapi_book_reports_demo',
        commentReports: 'ikapi_comment_reports_demo',
        commentReactions: 'ikapi_comment_reactions_demo',
        readerSettings: 'ikapi_reader_settings',
        readerBookmarks: 'ikapi_reader_bookmarks',
        readerPosition: 'ikapi_reader_pos_laskar_aksara',
        communities: 'ikapi_communities_demo',
        communityTopics: 'ikapi_community_topics_demo',
        communityReplies: 'ikapi_community_replies_demo',
        communityMemberships: 'ikapi_community_memberships_demo',
        discussionReports: 'ikapi_discussion_reports_demo',
        communitySeedVersion: 'ikapi_community_seed_version',
    };

    /* Keys written by pages today. Seeded/derived data belongs to fixtures (resources/data/ikapi),
       browser state belongs here; the split is documented in docs/migration/p3-foundation.md. */
    var MUTABLE = [
        KEYS.buyerSession, KEYS.adminSession, KEYS.publisherApplication, KEYS.publisherStatusPreview,
        KEYS.userProfile, KEYS.userPreferences, KEYS.readingPrefs, KEYS.rating, KEYS.reviewHistory,
        KEYS.bookReports, KEYS.commentReports, KEYS.commentReactions, KEYS.readerSettings,
        KEYS.readerBookmarks, KEYS.readerPosition, KEYS.communityMemberships, KEYS.communityTopics,
        KEYS.communityReplies, KEYS.discussionReports,
    ];

    function storage() {
        try {
            var s = window.localStorage;
            s.setItem('ikapi_probe', '1');
            s.removeItem('ikapi_probe');
            return s;
        } catch (e) {
            return null; // private mode / storage disabled: the demo degrades to in-memory only
        }
    }

    var memory = {};

    function read(key, fallback) {
        var s = storage();
        var raw = s ? s.getItem(key) : (key in memory ? memory[key] : null);
        if (raw === null || raw === undefined) return fallback;
        try {
            var parsed = JSON.parse(raw);
            return parsed === null || typeof parsed !== 'object' ? fallback : parsed;
        } catch (e) {
            return fallback;
        }
    }

    function write(key, value) {
        var raw = JSON.stringify(value);
        var s = storage();
        try {
            if (s) s.setItem(key, raw);
            memory[key] = raw;
            return true;
        } catch (e) {
            memory[key] = raw; // quota exceeded: keep the demo usable for this page view
            return false;
        }
    }

    function remove(key) {
        var s = storage();
        try {
            if (s) s.removeItem(key);
            delete memory[key];
            return true;
        } catch (e) {
            return false;
        }
    }

    /* Versioned seed migration, same pattern the community page already uses (ikapi_community_seed_version).
       Bumping the version re-seeds fixture-derived keys but never touches reviewer-created content. */
    function ensureSeed(name, version, factory) {
        var flag = 'ikapi_seed_' + name;
        var current = read(flag, { version: 0 });
        if (current.version === version) return false;
        var seeded = factory();
        Object.keys(seeded).forEach(function (k) { write(KEYS[k] !== undefined ? KEYS[k] : k, seeded[k]); });
        write(flag, { version: version, at: new Date().toISOString() });
        return true;
    }

    function clearAll() {
        MUTABLE.forEach(remove);
    }

    var api = {
        keys: KEYS,
        mutableKeys: MUTABLE.slice(),
        read: read,
        write: write,
        remove: remove,
        ensureSeed: ensureSeed,
        clearAll: clearAll,
        available: function () { return storage() !== null; },
    };

    window.IkapiDemo = api;
})(window);
