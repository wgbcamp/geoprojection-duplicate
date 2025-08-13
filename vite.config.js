import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
    base: '/d3js-geoprojection',
    build: {
        rollupOptions: {
            external: ['html-to-image']
        }
    }
}));