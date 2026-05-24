import { NextResponse } from "next/server";
import { createOtp } from "@/lib/db/queries/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const code = await createOtp(email.toLowerCase().trim());
  await sendOtpEmail(email.toLowerCase().trim(), code);

  return NextResponse.json({ ok: true });
}
