import nodemailer from "nodemailer";
import { getEnv, getNumberEnv } from "./env.js";

export type ContactBody = { name: string; email: string; message: string };

type SendResult = { ok: true } | { error: string };

function createTransport() {
  const host = getEnv("SMTP_HOST") ?? "mailpit";
  const port = getNumberEnv("SMTP_PORT") ?? 1025;

  if (!host || !Number.isFinite(port)) {
    return { error: "SMTP configuration is invalid" } as const;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
  });

  return { transporter };
}

export async function sendContactEmail(body: ContactBody): Promise<SendResult> {
  const setup = createTransport();

  if ("error" in setup) {
    return { error: setup.error };
  }

  const from =
    getEnv("SMTP_FROM") ??
    'DevOps Foundations <no-reply@example.test>';

  try {
    await setup.transporter.sendMail({
      from,
      to: body.email,
      subject: `Nouveau message de ${body.name}`,
      text: body.message,
    });

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SMTP error";
    return { error: message };
  }
}
