import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import commonjs from 'rollup-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  logLevel: 'warn',
  plugins: [
    tsconfigPaths(),
    dts({
      insertTypesEntry: true,
      exclude: ['node_module/**', 'src/constants/**', 'src/utils/**'],
    }),
    react(),
  ],
  resolve: {
    alias: {
      // Ensure only one instance of React is used
      'react': path.resolve('node_modules', 'react'),
      'react-dom': path.resolve('node_modules', 'react-dom'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/DataTable/index.tsx'),
      name: 'ReactDataTable',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'cjs') return 'react-data-table.cjs';
        return `react-data-table.${format}.js`;
      },
    },
    rollupOptions: {
      plugins: [commonjs()],
      external: ['react', 'react-dom', 'styled-components', 'font-awesome'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
        },
      },
    },
  },
  ssr: {
    external: ['react', 'react-dom', 'styled-components', 'font-awesome'],
  },
});
