import { NextResponse } from "next/server";
import { createOtp, countRecentOtps } from "@/lib/db/queries/otp";
import { sendOtpEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RATE_LIMIT = 5; // codes per hour per email

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalised = email.toLowerCase().trim();

  // Rate limit: max 5 OTP requests per email per hour
  const recent = await countRecentOtps(normalised);
  if (recent >= OTP_RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many code requests. Please wait before requesting another." },
      { status: 429 }
    );
  }

  const code = await createOtp(normalised);
  await sendOtpEmail(normalised, code);

  return NextResponse.json({ ok: true });
}
