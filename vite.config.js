import { defineConfig } from "vite";
import { createHash } from "node:crypto";

export default defineConfig({
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
    target: "es2022",
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
