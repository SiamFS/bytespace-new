import { describe, expect, it } from "vitest";
import type { z } from "zod";
// Shared with the API tests (backend/test/authSchemaParity.test.ts): both sides must agree.
import cases from "../../../../backend/test/fixtures/auth-validation-cases.json";
import { loginSchema, registerSchema } from "./schemas";

type Case = { input: Record<string, unknown>; errors: Record<string, string>; output?: Record<string, unknown> };

function firstErrors(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);
  const errors: Record<string, string> = {};
  if (!result.success) for (const issue of result.error.issues) errors[String(issue.path[0])] ??= issue.message;
  return { errors, data: result.success ? result.data : undefined };
}

describe.each([
  ["register", registerSchema, cases.register as Case[]],
  ["login", loginSchema, cases.login as Case[]],
] as const)("%s form rules match the API (shared cases)", (_name, schema, list) => {
  it.each(list.map((c, i) => [i, c] as const))("case %i", (_i, c) => {
    const { errors, data } = firstErrors(schema, c.input);
    expect(errors).toEqual(c.errors);
    if (c.output) expect(data).toEqual(c.output);
  });
});
