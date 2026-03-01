import { createRequire } from "node:module";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getDbStatus } from "./db";
import { getCacheStatus } from "./cache";
import { sendContactEmail } from "./contact";

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
app.get("/cache", async (c) => {
  const result = await getCacheStatus();
  const statusCode = result.status === "ok" ? 200 : 503;
  return c.json(result, statusCode);
});
app.post("/contact", async (c) => {
  const body = await c.req.json().catch(() => null);
  const name = body?.name;
  const email = body?.email;
  const message = body?.message;
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof message !== "string" || !message.trim()) {
    return c.json({ success: false, error: "name, email and message are required" }, 400);
  }
  const result = await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });
  if ("ok" in result && result.ok) {
    return c.json({ success: true }, 200);
  }
  return c.json({ success: false, error: result.error }, 503);
});

const port = Number(process.env.BACKEND_PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
