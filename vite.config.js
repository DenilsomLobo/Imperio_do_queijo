import { defineConfig } from "vite";
import { createHash } from "node:crypto";

export default defineConfig({
  base: "./",
  cacheDir: `node_modules/.vite-imperio-${process.pid}`,
  plugins: [
    {
      name: "imperio-local-health",
      configureServer(server) {
        const project = createHash("sha256")
          .update(
            server.config.root
              .toLowerCase()
              .replaceAll("\\", "/")
              .replace(/[\\/]+$/, ""),
          )
          .digest("hex");
        server.middlewares.use("/__imperio_health", (request, response) => {
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ project }));
        });
      },
    },
  ],
  build: {
    outDir: "play",
    target: "es2022",
    // O Phaser é uma biblioteca única de ~1,2 MB; ele fica no próprio arquivo e baixa em paralelo à tela de entrada.
    chunkSizeWarningLimit: 1300,
    rollupOptions: { input: { game: "index.html" } },
  },
  server: {
    watch: {
      ignored: [
        "**/.npm-cache/**",
        "**/.browser-preview*/**",
        "**/.browser-preview*.log",
      ],
    },
  },
});
