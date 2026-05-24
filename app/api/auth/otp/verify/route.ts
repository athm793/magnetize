import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/db/queries/otp";
import { upsertOAuthUser } from "@/lib/db/queries/users";
import { signIn } from "@/auth";

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }

  const valid = await verifyOtp(email.toLowerCase().trim(), code.trim());
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  // Create/upsert user on first OTP login
  await upsertOAuthUser({ email: email.toLowerCase().trim() });

  return NextResponse.json({ ok: true });
}
