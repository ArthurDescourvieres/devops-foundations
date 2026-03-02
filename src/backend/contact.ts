export type ContactBody = { name: string; email: string; message: string };

export async function sendContactEmail(
  body: ContactBody
): Promise<{ ok: true } | { error: string }> {
  return { error: "SMTP not configured" };
}
