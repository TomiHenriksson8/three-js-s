import { defineConfig } from 'vite';

export default defineConfig({
  root: "three-dev",
  publicDir: "textures",
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  assetsInclude: ['**/*.gltf', '**/*.bin'],
});
