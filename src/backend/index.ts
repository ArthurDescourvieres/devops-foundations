import { createRequire } from "node:module";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getDbStatus } from "./db";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };
const VERSION = pkg.version;

const app = new Hono();

app.get("/", (c) =>
  c.json({
    message: "DevOps Foundations API – Bienvenue",
    version: VERSION,
  })
);
app.get("/health", (c) =>
  c.json({ status: "ok", service: "backend" })
);
app.get("/db", async (c) => {
  const result = await getDbStatus();
  const statusCode = result.status === "connected" ? 200 : 503;
  return c.json(result, statusCode);
});

const port = Number(process.env.BACKEND_PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
