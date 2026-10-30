import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(root, "src") } },
  build: isSsrBuild
    ? { outDir: "dist-ssr", emptyOutDir: true }
    : {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.resolve(root, "index.html"),
            admin: path.resolve(root, "admin/index.html"),
          },
        },
      },
}));
