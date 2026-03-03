export type ContactBody = { name: string; email: string; message: string };

export async function sendContactEmail(
  body: ContactBody
): Promise<{ ok: true } | { error: string }> {
  void body;
  return { error: "SMTP not configured" };
}
