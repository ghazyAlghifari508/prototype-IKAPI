import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const directory = fileURLToPath(new URL('.', import.meta.url));
const prototypePaths = new Set([
    '/prototype',
    '/prototype/auth/login-buyer',
    '/prototype/auth/login-publisher',
    '/prototype/auth/register-buyer',
    '/prototype/auth/register-publisher',
    '/prototype/auth/forgot-password',
    '/prototype/auth/reset-password',
    '/prototype/profile/buyer',
    '/prototype/ikapi-internal/login',
    '/prototype/ikapi-internal/dashboard',
]);

export default defineConfig({
    root: directory,
    plugins: [
        react(),
        {
            name: 'prototype-url-fallback',
            configureServer(server) {
                server.middlewares.use((request, response, next) => {
                    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
                    if (prototypePaths.has(pathname)) {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'text/html; charset=utf-8');
                        response.end(`<!doctype html>
<html lang="id"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>IKAPI Jabar · Prototype F01</title></head>
<body><div id="app"></div>
<script type="module">
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
</script>
<script type="module" src="/@vite/client"></script>
<script type="module" src="/preview.tsx"></script></body></html>`);
                        return;
                    }
                    next();
                });
            },
        },
    ],
    resolve: {
        alias: { '@': resolve(directory, '..') },
    },
    server: { host: '0.0.0.0', port: 4173, strictPort: true },
});
