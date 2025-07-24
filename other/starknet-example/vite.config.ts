import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // alias are only to be added when absolutely necessary, these modules are already present in the browser environment
  // resolve: {
  // alias: {
  // crypto: "crypto-browserify",
  // assert: "assert",
  // http: "stream-http",
  // https: "https-browserify",
  // url: "url",
  // zlib: "browserify-zlib",
  // stream: "stream-browserify",
  // },
  // },
  define: {
    global: "globalThis",
  },
});
