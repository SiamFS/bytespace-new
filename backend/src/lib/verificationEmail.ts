import type { Email } from "./mailer.js";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** "Verify your email" message, in the site's colours (blue #003be2, lime #d4fb20, ink #242528). */
export function verificationEmail({ name, email, link }: { name: string; email: string; link: string }): Email {
  const firstName = escapeHtml(name.split(/\s+/)[0] ?? name);
  const safeLink = escapeHtml(link);
  return {
    to: { email, name },
    subject: "Verify your ByteSpace account",
    html: `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f5f6;font-family:Arial,Helvetica,sans-serif;color:#242528">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px">
    <tr><td style="padding:32px">
      <p style="margin:0 0 8px;font-size:14px;color:#003be2;font-weight:bold">ByteSpace</p>
      <h1 style="margin:0 0 16px;font-size:24px">Verify your email</h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Hi ${firstName}, confirm this email address to finish creating your account.</p>
      <p style="margin:0 0 24px"><a href="${safeLink}" style="display:inline-block;padding:12px 24px;background:#d4fb20;color:#242528;border-radius:24px;font-size:16px;font-weight:bold;text-decoration:none">Verify email</a></p>
      <p style="margin:0 0 8px;font-size:13px;color:#82868e;line-height:1.6">The link works for 24 hours. If the button doesn't work, open this address:</p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="${safeLink}" style="color:#003be2">${safeLink}</a></p>
      <p style="margin:0;font-size:13px;color:#82868e">Didn't sign up? You can ignore this email.</p>
    </td></tr>
  </table>
</body></html>`,
  };
}
