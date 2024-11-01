import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: "three-dev",
  publicDir: false,
  build: {
    outDir: "../dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "models/*", dest: "assets/models" },
        { src: "textures/*", dest: "assets/textures" },
      ],
    }),
  ],
  assetsInclude: ['**/*.glb', '**/*.png'],
});
