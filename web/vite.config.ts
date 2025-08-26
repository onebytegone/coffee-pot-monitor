import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
   base: '/coffee-pot-monitor/',
   plugins: [svelte()],
});
