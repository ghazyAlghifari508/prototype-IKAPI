import './ikapi/demo/state.js';
import './ikapi/demo/session.js';
import './ikapi/demo/notice.js';
import './ikapi/shell.js';
import './ikapi/modal.js';
import './ikapi/toast.js';
import './ikapi/buyer/toast.js';
import './ikapi/buyer/home.js';
import './ikapi/buyer/catalog.js';
import './ikapi/buyer/detail.js';
import './ikapi/buyer/preview.js';

/*
| Alpine is installed but intentionally not bootstrapped: the prototype uses vanilla JS only
| (0 x-data / @click / x-show attributes across 40 HTML files, measured in P01 section 3.2).
| Page modules added in later phases are imported here, e.g.
|   import './ikapi/buyer/catalog.js';
import './ikapi/buyer/detail.js';
import './ikapi/buyer/preview.js';
*/

/* P06 group A - simulated auth screens (each module only runs on its own page). */
import './ikapi/p6/auth/login.js';
import './ikapi/p6/auth/register.js';
import './ikapi/p6/auth/forgot-password.js';
import './ikapi/p6/auth/verify-email.js';
import './ikapi/p6/auth/onboarding.js';
import './ikapi/p6/auth/publisher-status.js';

/* P06 groups B-E - account, checkout, orders, library, reader, reviews, agenda, help/chatbot. */
import './ikapi/p6/account/profile.js';
import './ikapi/p6/account/settings.js';
import './ikapi/p6/account/help.js';
import './ikapi/p6/checkout/cart.js';
import './ikapi/p6/orders/index.js';
import './ikapi/p6/library/index.js';
import './ikapi/p6/reader/reader.js';
import './ikapi/p6/reviews/index.js';
import './ikapi/p6/agenda/index.js';
import './ikapi/p6/agenda/show.js';
import './ikapi/p6/help/chatbot.js';

/* P07 - Community Literasi (one shared core + one thin boot per page). */
import './ikapi/p7/directory.js';
import './ikapi/p7/profile.js';
import './ikapi/p7/discussion.js';
import './ikapi/p7/topic.js';
import './ikapi/p7/reply.js';

/* P08 - Portal Penerbit (publisher persona, own shell bindings). */
import './ikapi/p8/dashboard.js';
import './ikapi/p8/books.js';
import './ikapi/p8/orders.js';
import './ikapi/p8/finance.js';
import './ikapi/p8/reviews.js';
import './ikapi/p8/settings.js';
import './ikapi/p8/invoice.js';

/* P09 - Portal Administrator (own shell bindings, moderation reads the P07 demo store). */
import './ikapi/p9/dashboard.js';
import './ikapi/p9/users.js';
import './ikapi/p9/catalog.js';
import './ikapi/p9/review-moderation.js';
import './ikapi/p9/monitoring.js';
import './ikapi/p9/payouts.js';
import './ikapi/p9/communities.js';
import './ikapi/p9/discussion-moderation.js';
import './ikapi/p9/login.js';
