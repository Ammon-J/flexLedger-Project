// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	integrations: [svelte()],
	vite: {
		logLevel: 'info',
		server: {
			proxy: {
				'/api': 'http://localhost:3001',
			},
		},
	},
});
