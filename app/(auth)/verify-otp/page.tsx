"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";

function MagnetLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex items-center h-8 rounded-lg overflow-hidden" style={{ boxShadow: "0 0 14px rgba(0,200,255,0.3)" }}>
        <div className="flex items-center justify-center px-2.5 h-full text-white text-xs font-black tracking-wider" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
        <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.25)" }} />
        <div className="flex items-center justify-center px-2.5 h-full text-white text-xs font-black tracking-wider" style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
      </div>
      <span className="font-bold text-lg" style={{ color: "#e8f4ff" }}>Magnetize</span>
    </Link>
  );
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  if (!email) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)", backdropFilter: "blur(16px)" }}>
        <h1 className="text-xl font-bold mb-2" style={{ color: "#e8f4ff" }}>Missing email</h1>
        <p className="text-sm mb-6" style={{ color: "#475569" }}>
          We couldn&apos;t find an email to verify. Please sign up or log in again to receive a new code.
        </p>
        <Link href="/login" className="btn-magnetic inline-block w-full py-2.5 rounded-xl text-sm font-bold" style={{ color: "#020b18" }}>
          Back to login
        </Link>
      </div>
    );
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Enter the 6-digit code"); return; }
    setLoading(true);
    const res = await signIn("otp", { email, code, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid or expired code. Try again.");
      setCode("");
      inputRef.current?.focus();
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResending(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    if (res.ok) { toast.success("New code sent!"); setCountdown(60); setCode(""); inputRef.current?.focus(); }
    else toast.error("Failed to resend");
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)", backdropFilter: "blur(16px)" }}>
      <div className="text-center mb-6">
        {/* Magnetic icon for OTP */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="#00c8ff" strokeWidth="1.5">
            <path d="M12 2a7 7 0 0 1 7 7c0 3.866-3.134 7-7 7a7 7 0 0 1-7-7 7 7 0 0 1 7-7z" strokeDasharray="4 2" />
            <path d="M12 6v2M12 10v2" strokeLinecap="round" />
            <path d="M8 20h8M10 17v3M14 17v3" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#e8f4ff" }}>Check your email</h1>
        <p className="text-sm" style={{ color: "#475569" }}>
          We sent a 6-digit code to<br />
          <span className="font-semibold" style={{ color: "#94a3b8" }}>{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          ref={inputRef}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="w-full text-center text-3xl font-black tracking-[0.6em] py-4 rounded-xl outline-none transition-all"
          style={{
            background: "rgba(0,200,255,0.04)",
            border: "1px solid rgba(0,200,255,0.2)",
            color: "#00c8ff",
            caretColor: "#00c8ff",
            letterSpacing: "0.6em",
            paddingLeft: "0.6em",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(0,200,255,0.55)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,200,255,0.08), 0 0 20px rgba(0,200,255,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,200,255,0.2)"; e.target.style.boxShadow = "none"; }}
        />
        <button type="submit" disabled={loading || code.length !== 6}
          className="btn-magnetic w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: "#020b18" }}>
          {loading ? "Verifying…" : "Verify code"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={handleResend} disabled={countdown > 0 || resending}
          className="flex items-center gap-1.5 text-sm mx-auto transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: "#475569" }}
          onMouseEnter={e => { if (countdown === 0) (e.currentTarget as HTMLElement).style.color = "#00c8ff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
        </button>
      </div>

      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm mt-4 transition-colors"
        style={{ color: "#334155" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
        onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 field-pattern" style={{ background: "#020b18" }}>
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(0,200,255,0.04)", filter: "blur(80px)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <MagnetLogo />
        </div>
        <Suspense fallback={<div className="rounded-2xl h-80 animate-pulse" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)" }} />}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
