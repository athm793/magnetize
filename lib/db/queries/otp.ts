import sql from "../client";

export interface OtpCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export async function createOtp(email: string): Promise<string> {
  // Invalidate any existing unused codes for this email
  await sql`UPDATE otp_codes SET used = TRUE WHERE email = ${email} AND used = FALSE`;

  const code = String(Math.floor(100000 + Math.random() * 900000));
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
