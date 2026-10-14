import { createServer } from "vite";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const project = createHash("sha256")
  .update(
    root
      .toLowerCase()
      .replaceAll("\\", "/")
      .replace(/[\\/]+$/, ""),
  )
  .digest("hex");
const url = "http://127.0.0.1:5173/";
let existing = false;
try {
  const response = await fetch(`${url}__imperio_health`, {
    signal: AbortSignal.timeout(2000),
  });
  const data = await response.json();
  existing = data.project === project;
} catch {}
if (existing) {
  console.log(`Jogo já está em execução: ${url}`);
  const child = spawn("cmd.exe", ["/d", "/c", "start", '""', url], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.on("error", () => console.error(`Abra ${url} no navegador.`));
  child.unref();
  process.exit(0);
} else {
  try {
    const server = await createServer({
      root,
      server: { host: "127.0.0.1", port: 5173, strictPort: true, open: true },
    });
    await server.listen();
    server.printUrls();
    console.log(
      "Origem fixa para preservar os salvamentos locais. Ctrl+C para encerrar.",
    );
  } catch (error) {
    console.error(`Não foi possível iniciar na porta 5173: ${error.message}`);
    console.error(
      "Se outro aplicativo usa esta porta, encerre-o antes de tentar novamente.",
    );
    process.exitCode = 1;
  }
}
