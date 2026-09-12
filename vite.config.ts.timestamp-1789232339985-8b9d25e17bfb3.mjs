// vite.config.ts
import { defineConfig } from "file:///C:/Users/user/Documents/Documents/e-pharmacy-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/user/Documents/Documents/e-pharmacy-frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\user\\Documents\\Documents\\e-pharmacy-frontend";
var vite_config_default = defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Raise the warning threshold slightly — we're splitting anyway
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/chart.js") || id.includes("node_modules/react-chartjs")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("node_modules/axios")) {
            return "vendor-axios";
          }
          if (id.includes("node_modules/zustand") || id.includes("node_modules/@tanstack")) {
            return "vendor-state";
          }
          if (id.includes("node_modules/zod") || id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform")) {
            return "vendor-forms";
          }
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
          if (id.includes("/pages/patient/")) {
            return "portal-patient";
          }
          if (id.includes("/pages/pharmacy/")) {
            return "portal-pharmacy";
          }
          if (id.includes("/pages/government/")) {
            return "portal-government";
          }
          if (id.includes("/pages/insurance/")) {
            return "portal-insurance";
          }
          if (id.includes("/pages/admin/")) {
            return "portal-admin";
          }
          if (id.includes("/pages/public/")) {
            return "portal-public";
          }
          if (id.includes("/pages/common/")) {
            return "shared-pages";
          }
          if (id.includes("/layouts/") || id.includes("/components/")) {
            return "shared-ui";
          }
          if (id.includes("/services/") || id.includes("/store/") || id.includes("/hooks/")) {
            return "shared-core";
          }
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    },
    allowedHosts: true
  },
  preview: {
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERvY3VtZW50c1xcXFxEb2N1bWVudHNcXFxcZS1waGFybWFjeS1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEb2N1bWVudHNcXFxcRG9jdW1lbnRzXFxcXGUtcGhhcm1hY3ktZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRG9jdW1lbnRzL0RvY3VtZW50cy9lLXBoYXJtYWN5LWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3NldHVwVGVzdHMudHMnLFxyXG4gIH0sXHJcblxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBSYWlzZSB0aGUgd2FybmluZyB0aHJlc2hvbGQgc2xpZ2h0bHkgXHUyMDE0IHdlJ3JlIHNwbGl0dGluZyBhbnl3YXlcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxyXG5cclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAvLyBcdTI1MDBcdTI1MDAgVmVuZG9yIGNodW5rcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1kb20nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yZWFjdCdcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LXJvdXRlcicpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJvdXRlcidcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2NoYXJ0LmpzJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1jaGFydGpzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItY2hhcnRzJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItaWNvbnMnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9heGlvcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWF4aW9zJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvenVzdGFuZCcpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHRhbnN0YWNrJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3Itc3RhdGUnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96b2QnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LWhvb2stZm9ybScpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQGhvb2tmb3JtJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZm9ybXMnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy8nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1taXNjJ1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFx1MjUwMFx1MjUwMCBBcHAgcG9ydGFsIGNodW5rcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3BhZ2VzL3BhdGllbnQvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdwb3J0YWwtcGF0aWVudCdcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3BhZ2VzL3BoYXJtYWN5LycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncG9ydGFsLXBoYXJtYWN5J1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcGFnZXMvZ292ZXJubWVudC8nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3BvcnRhbC1nb3Zlcm5tZW50J1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcGFnZXMvaW5zdXJhbmNlLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncG9ydGFsLWluc3VyYW5jZSdcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3BhZ2VzL2FkbWluLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncG9ydGFsLWFkbWluJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcGFnZXMvcHVibGljLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncG9ydGFsLXB1YmxpYydcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3BhZ2VzL2NvbW1vbi8nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3NoYXJlZC1wYWdlcydcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBcdTI1MDBcdTI1MDAgU2hhcmVkIGFwcCBjb2RlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbGF5b3V0cy8nKSB8fCBpZC5pbmNsdWRlcygnL2NvbXBvbmVudHMvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzaGFyZWQtdWknXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9zZXJ2aWNlcy8nKSB8fCBpZC5pbmNsdWRlcygnL3N0b3JlLycpIHx8IGlkLmluY2x1ZGVzKCcvaG9va3MvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzaGFyZWQtY29yZSdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxyXG4gIH0sXHJcblxyXG4gIHByZXZpZXc6IHtcclxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtB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
