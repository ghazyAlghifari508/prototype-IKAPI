import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                // Shared floating chatbot; the prototype loads it on 5 buyer pages only, so pages opt in.
                'resources/js/ikapi/buyer/chatbot-widget.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});