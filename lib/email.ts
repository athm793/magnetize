import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    // Dev fallback — print to server console
    console.log(`\n[DEV] OTP for ${email}: ${code}\n`);
    return;
  }

  await resend.emails.send({
    from: "Magnetize <onboarding@resend.dev>",
    to: email,
    subject: `Your Magnetize login code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
          <div style="width:32px;height:32px;border-radius:8px;background:#7c3aed;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-size:16px">⚡</span>
          </div>
          <span style="font-size:20px;font-weight:700;color:#111">Magnetize</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px">Your login code</h1>
        <p style="color:#6b7280;margin:0 0 32px;font-size:15px">Use this code to sign in. It expires in 10 minutes.</p>
        <div style="background:#f3f0ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px">
          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#7c3aed">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
