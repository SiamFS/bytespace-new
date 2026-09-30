import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

// Hash compared against when the email doesn't exist, so "unknown email" and "wrong password"
// take the same time and can't be told apart (no user enumeration by timing).
const dummyHash = bcrypt.hashSync("no-such-user-timing-guard", env.BCRYPT_ROUNDS);

/** Checks a password; `hash` is null when the user doesn't exist (still does the full work). */
export async function verifyPassword(password: string, hash: string | null) {
  const matches = await bcrypt.compare(password, hash ?? dummyHash);
  return hash !== null && matches;
}
