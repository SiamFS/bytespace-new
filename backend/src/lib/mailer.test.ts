import { describe, expect, it, vi } from "vitest";
import { createBrevoMailer, createLogMailer } from "./mailer.js";
import { verificationEmail } from "./verificationEmail.js";

const email = verificationEmail({ name: "Jamie Davis", email: "jamie@example.com", link: "https://site.test/verify-email?token=abc" });

describe("createBrevoMailer", () => {
  it("posts to Brevo's transactional API with the API key and a verified sender", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ messageId: "<1@brevo>" }, { status: 201 }));
    const mailer = createBrevoMailer({ apiKey: "xkeysib-test", from: { email: "team@site.test", name: "ByteSpace" }, fetch: fetchMock });
    await mailer.send(email);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init!.headers).toMatchObject({ "api-key": "xkeysib-test", "content-type": "application/json" });
    expect(JSON.parse(init!.body as string)).toEqual({
      sender: { email: "team@site.test", name: "ByteSpace" },
      to: [{ email: "jamie@example.com", name: "Jamie Davis" }],
      subject: "Verify your ByteSpace account",
      htmlContent: email.html,
    });
    expect(mailer.delivers).toBe(true);
  });

  it("throws when Brevo rejects the email", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"code":"unauthorized"}', { status: 401 }));
    const mailer = createBrevoMailer({ apiKey: "bad", from: { email: "a@b.co", name: "x" }, fetch: fetchMock });
    await expect(mailer.send(email)).rejects.toThrow(/HTTP 401.*unauthorized/);
  });
});

describe("createLogMailer", () => {
  it("logs the link instead of sending", async () => {
    const info = vi.fn();
    const mailer = createLogMailer({ info } as never);
    await mailer.send(email);
    expect(mailer.delivers).toBe(false);
    expect(info).toHaveBeenCalledWith(expect.objectContaining({ to: "jamie@example.com", link: "https://site.test/verify-email?token=abc" }), expect.any(String));
  });
});

describe("verificationEmail", () => {
  it("greets by first name and links the verify button", () => {
    expect(email.html).toContain("Hi Jamie,");
    expect(email.html).toContain('href="https://site.test/verify-email?token=abc"');
  });

  it("escapes the name (no HTML injection through sign-up)", () => {
    const evil = verificationEmail({ name: "<script>alert(1)</script>", email: "x@y.co", link: "https://s.test/v?token=a" });
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).toContain("&lt;script&gt;");
  });
});
