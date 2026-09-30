import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

const firstError = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, field: string) =>
  result.error?.issues.find((issue) => issue.path[0] === field)?.message;

const valid = { name: "Jamie Davis", email: "jamie@example.com", password: "secret123" };

describe("registerSchema", () => {
  it("accepts valid input and normalises name and email", () => {
    const result = registerSchema.parse({ ...valid, name: "  Jamie Davis ", email: "  Jamie@Example.COM " });
    expect(result).toEqual({ name: "Jamie Davis", email: "jamie@example.com", password: "secret123" });
  });

  it.each([
    ["", "Enter your full name"],
    ["   ", "Enter your full name"],
    ["J", "Enter your full name"],
    ["x".repeat(61), "Name is too long (60 characters max)"],
    ["Jamie 😀", "Use letters, spaces, apostrophes or hyphens only"],
    ["R2-D2", "Use letters, spaces, apostrophes or hyphens only"],
  ])("rejects name %j", (name, message) => {
    expect(firstError(registerSchema.safeParse({ ...valid, name }), "name")).toBe(message);
  });

  it.each(["Anne-Marie O'Neil", "José Álvarez", "Siam Ferdous", "Björk Guðmundsdóttir", "Dr. Jane Doe"])(
    "accepts name %j",
    (name) => {
      expect(registerSchema.safeParse({ ...valid, name }).success).toBe(true);
    },
  );

  it.each([
    ["", "Enter your email"],
    ["   ", "Enter your email"],
    ["jamie", "Enter a valid email address"],
    ["jamie@", "Enter a valid email address"],
    [`${"a".repeat(250)}@x.io`, "Email is too long"],
  ])("rejects email %j", (email, message) => {
    expect(firstError(registerSchema.safeParse({ ...valid, email }), "email")).toBe(message);
  });

  it("accepts plus-addressed emails", () => {
    expect(registerSchema.safeParse({ ...valid, email: "jamie+courses@example.com" }).success).toBe(true);
  });

  it.each([
    ["short1", "Use at least 8 characters"],
    ["onlyletters", "Include at least one letter and one number"],
    ["12345678", "Include at least one letter and one number"],
    // 18 emoji × 4 bytes = 72 bytes is fine; 19 × 4 = 76 bytes is over bcrypt's limit.
    [`${"😀".repeat(19)}a1`, "Password is too long"],
  ])("rejects password %j", (password, message) => {
    expect(firstError(registerSchema.safeParse({ ...valid, password }), "password")).toBe(message);
  });

  it("keeps spaces in passwords (never trimmed)", () => {
    expect(registerSchema.parse({ ...valid, password: " pass word 1 " }).password).toBe(" pass word 1 ");
  });

  it("accepts a password of exactly 72 bytes", () => {
    expect(registerSchema.safeParse({ ...valid, password: `${"a".repeat(71)}1` }).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("only requires a password (no policy hints on login)", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
    expect(firstError(loginSchema.safeParse({ email: "a@b.co", password: "" }), "password")).toBe(
      "Enter your password",
    );
  });

  it("normalises the email", () => {
    expect(loginSchema.parse({ email: " A@B.CO ", password: "x" }).email).toBe("a@b.co");
  });
});
