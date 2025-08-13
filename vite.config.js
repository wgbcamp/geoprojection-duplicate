import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
    base: '/d3js-geoprojection',
    build: {
        rollupOptions: {
            // Ensure d3 and other deps are NOT externalized
            external: (id) => {
                // Return false to bundle everything
                return false;
            }
        }
    },
    optimizeDeps: {
        include: ['html-to-image', 'd3']
    }
}));