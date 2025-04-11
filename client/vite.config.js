// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import rollupNodePolyfills from 'rollup-plugin-node-polyfills';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       // Only include what's needed
//       stream: 'stream-browserify',
//       assert: 'assert',
//       crypto: 'crypto-browserify',
//       url: 'url',
//       buffer: 'buffer',
//     },
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       define: {
//         global: 'globalThis',A
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           process: true,
//           buffer: true,
//         }),
//       ],
//     },
//   },
//   build: {
//     rollupOptions: {
//       plugins: [rollupNodePolyfills()],
//     },
//   },
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      assert: 'assert',
      crypto: 'crypto-browserify',
      url: 'url',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['@solana/spl-token'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyfills()],
    },
  },
});
