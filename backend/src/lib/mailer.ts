import type { Logger } from "pino";

export type Email = {
  to: { email: string; name: string };
  subject: string;
  html: string;
};

export type Mailer = {
  /** False when no email service is configured — emails are only logged (local / Docker / tests). */
  readonly delivers: boolean;
  /** Sends the email. Throws if the email service rejects it. */
  send(email: Email): Promise<void>;
};

// Brevo transactional email API ("Send a transactional email" guide).
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export function createBrevoMailer({
  apiKey,
  from,
  fetch: fetchImpl = fetch,
}: {
  apiKey: string;
  from: { email: string; name: string };
  fetch?: typeof fetch;
}): Mailer {
  return {
    delivers: true,
    async send({ to, subject, html }) {
      const response = await fetchImpl(BREVO_ENDPOINT, {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        // Brevo takes one content type per request — HTML.
        body: JSON.stringify({ sender: from, to: [to], subject, htmlContent: html }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Brevo rejected the email (HTTP ${response.status}): ${detail.slice(0, 300)}`);
      }
    },
  };
}

/** No email service: write the email to the log (the API also hands the link to the page). */
export function createLogMailer(logger: Pick<Logger, "info">): Mailer {
  return {
    delivers: false,
    async send({ to, subject, html }) {
      const link = html.match(/href="([^"]+)"/)?.[1];
      logger.info({ to: to.email, subject, link }, "Email not sent (no BREVO_API_KEY) — logged instead");
    },
  };
}
