import sql from "../client";
import crypto from "crypto";

export interface OtpCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export async function countRecentOtps(email: string, windowMinutes = 60): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) AS cnt FROM otp_codes
    WHERE email = ${email}
      AND created_at > NOW() - (${windowMinutes} || ' minutes')::interval
  `;
  return Number((rows[0] as { cnt: string }).cnt);
}

export async function createOtp(email: string): Promise<string> {
  // Invalidate any existing unused codes for this email
  await sql`UPDATE otp_codes SET used = TRUE WHERE email = ${email} AND used = FALSE`;

  const code = String(crypto.randomInt(100000, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  await sql`
    INSERT INTO otp_codes (email, code, expires_at)
    VALUES (${email}, ${code}, ${expiresAt}::timestamptz)
  `;
  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const rows = await sql`
    SELECT * FROM otp_codes
    WHERE email = ${email}
      AND code = ${code}
      AND used = FALSE
      AND expires_at > NOW()
    LIMIT 1
  `;
  if (rows.length === 0) return false;

  await sql`UPDATE otp_codes SET used = TRUE WHERE id = ${(rows[0] as OtpCode).id}`;
  return true;
}
