"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";

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

function FieldInput({ id, type, value, onChange, placeholder, required, autoFocus }: {
  id: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; autoFocus?: boolean;
}) {
  return (
    <input
      id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required} autoFocus={autoFocus}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all outline-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(0,200,255,0.15)",
        color: "#e8f4ff",
        caretColor: "#00c8ff",
      }}
      onFocus={e => { e.target.style.borderColor = "rgba(0,200,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,200,255,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(0,200,255,0.15)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("callbackUrl") ?? "/dashboard";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";

  const [tab, setTab] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) toast.error("Invalid email or password");
    else router.push(callbackUrl);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) toast.error("Failed to send code. Try again.");
    else router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)", backdropFilter: "blur(16px)" }}>
      <h1 className="text-xl font-bold text-center mb-1" style={{ color: "#e8f4ff" }}>Welcome back</h1>
      <p className="text-sm text-center mb-6" style={{ color: "#475569" }}>Sign in to your account</p>

      {/* Google */}
      <button onClick={handleGoogle} type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all mb-5"
        style={{ border: "1px solid rgba(0,200,255,0.15)", color: "#94a3b8", background: "rgba(255,255,255,0.03)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.35)"; (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.15)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px" style={{ background: "rgba(0,200,255,0.1)" }} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs" style={{ background: "#04111f", color: "#334155" }}>or</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl p-1 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,200,255,0.08)" }}>
        {(["password", "code"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold transition-all"
            style={tab === t
              ? { background: "rgba(0,200,255,0.12)", color: "#00c8ff", boxShadow: "0 0 12px rgba(0,200,255,0.1)" }
              : { color: "#475569" }}>
            {t === "password" ? <Lock className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
            {t === "password" ? "Password" : "Email code"}
          </button>
        ))}
      </div>

      {tab === "password" ? (
        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label htmlFor="email" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email</label>
            <FieldInput id="email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Password</label>
            <FieldInput id="password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="btn-magnetic w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{ color: "#020b18" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="text-center pt-1">
            <button type="button" onClick={() => setTab("code")}
              className="text-xs transition-colors"
              style={{ color: "#334155" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00c8ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
            >
              Forgot password? Use email code instead →
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSendCode} className="space-y-3">
          <div>
            <label htmlFor="email-code" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email</label>
            <FieldInput id="email-code" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required autoFocus />
          </div>
          <button type="submit" disabled={loading}
            className="btn-magnetic w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{ color: "#020b18" }}>
            {loading ? "Sending code…" : "Send login code"}
          </button>
          <p className="text-xs text-center" style={{ color: "#334155" }}>
            A 6-digit code will be emailed to you. No password needed.
          </p>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 field-pattern" style={{ background: "#020b18" }}>
      {/* Background glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(59,130,246,0.06)", filter: "blur(60px)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(239,68,68,0.05)", filter: "blur(60px)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <MagnetLogo />
        </div>
        <Suspense fallback={<div className="rounded-2xl h-64 animate-pulse" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)" }} />}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm mt-5" style={{ color: "#334155" }}>
          No account?{" "}
          <Link href="/signup" className="font-semibold transition-colors" style={{ color: "#0ea5e9" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00c8ff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#0ea5e9")}
          >Create one free</Link>
        </p>
      </div>
    </div>
  );
}
