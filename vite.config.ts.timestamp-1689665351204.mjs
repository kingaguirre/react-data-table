// vite.config.ts
import { defineConfig } from "file:///Users/e.kingaguirre/Sites/react-data-table/node_modules/vite/dist/node/index.js";
import react from "file:///Users/e.kingaguirre/Sites/react-data-table/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "node:path";
import tsconfigPaths from "file:///Users/e.kingaguirre/Sites/react-data-table/node_modules/vite-tsconfig-paths/dist/index.mjs";
import dts from "file:///Users/e.kingaguirre/Sites/react-data-table/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/e.kingaguirre/Sites/react-data-table";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    dts({
      insertTypesEntry: true,
      exclude: [
        "node_module/**",
        "src/constants/**",
        "src/utils/**"
      ]
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/DataTable/index.tsx"),
      name: "react-data-table.eaa",
      formats: ["es", "umd"],
      fileName: (format) => `react-data-table.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom", "styled-components", "lodash", "font-awesome"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "styled-components": "styled"
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "ag-grid-community/dist/styles/ag-grid.css";`
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZS5raW5nYWd1aXJyZS9TaXRlcy9yZWFjdC1kYXRhLXRhYmxlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZS5raW5nYWd1aXJyZS9TaXRlcy9yZWFjdC1kYXRhLXRhYmxlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9lLmtpbmdhZ3VpcnJlL1NpdGVzL3JlYWN0LWRhdGEtdGFibGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgICBleGNsdWRlOiBbXG4gICAgICAgICdub2RlX21vZHVsZS8qKicsXG4gICAgICAgICdzcmMvY29uc3RhbnRzLyoqJyxcbiAgICAgICAgJ3NyYy91dGlscy8qKidcbiAgICAgIF1cbiAgICB9KVxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvRGF0YVRhYmxlL2luZGV4LnRzeCcpLFxuICAgICAgbmFtZTogJ3JlYWN0LWRhdGEtdGFibGUuZWFhJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYHJlYWN0LWRhdGEtdGFibGUuJHtmb3JtYXR9LmpzYCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdzdHlsZWQtY29tcG9uZW50cycsICdsb2Rhc2gnLCAnZm9udC1hd2Vzb21lJ10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHJlYWN0OiAnUmVhY3QnLFxuICAgICAgICAgICdyZWFjdC1kb20nOiAnUmVhY3RET00nLFxuICAgICAgICAgICdzdHlsZWQtY29tcG9uZW50cyc6ICdzdHlsZWQnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQGltcG9ydCBcImFnLWdyaWQtY29tbXVuaXR5L2Rpc3Qvc3R5bGVzL2FnLWdyaWQuY3NzXCI7YFxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVQsU0FBUyxvQkFBb0I7QUFDaFYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFNBQVM7QUFKaEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsTUFDbEIsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLEtBQUssUUFBUSxrQ0FBVyx5QkFBeUI7QUFBQSxNQUN4RCxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVcsb0JBQW9CO0FBQUEsSUFDNUM7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLGFBQWEscUJBQXFCLFVBQVUsY0FBYztBQUFBLE1BQzlFLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxVQUNiLHFCQUFxQjtBQUFBLFFBQ3ZCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
