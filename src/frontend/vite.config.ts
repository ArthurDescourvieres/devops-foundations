import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const envDir = (() => {
  const hasRootEnv =
    fs.existsSync(path.join(repoRoot, ".env")) ||
    fs.existsSync(path.join(repoRoot, ".env.example"));
  return hasRootEnv ? repoRoot : __dirname;
})();

export default defineConfig({
  envDir,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});