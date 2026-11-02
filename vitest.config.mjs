// vitest.config.mjs
// Vitest corre aparte de Create React App: CRA sigue usando webpack para "npm start" y "npm run build",
// y Vitest solo se usa para las pruebas. Por eso necesita su propia configuración.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],            // permite entender JSX en los archivos .jsx
  test: {
    environment: "jsdom",        // simula un navegador (document, window...) dentro de Node
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    css: false,                  // los .css no importan para probar la lógica
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/index.jsx", "src/test/**", "src/**/*.test.{js,jsx}"],
    },
  },
});
