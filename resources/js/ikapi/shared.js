/*
| Cross-phase helpers. Only things that at least two page modules really need live here
| (see docs/migration/p4-components.md section 3.1 for the same rule on Blade components).
*/

/*
| Run a module's init once the DOM is available.
| Vite injects the bundle as a deferred module, but if the document is already interactive by the time the
| module body executes, a plain DOMContentLoaded listener never fires (measured in P05: the catalog pipeline
| never ran on first load while click handlers worked). This helper covers both states.
*/
export function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
}

/* Rupiah formatting exactly as the prototype's formatRupiah helpers do it. */
export function formatRupiah(value) {
    return 'Rp ' + Number(value).toLocaleString('id-ID');
}
