"use client";
import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => { if (data?.user) router.replace(callbackUrl); })
      .catch(() => {});
  }, [router, callbackUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) toast.error("Invalid email or password");
    else router.push(callbackUrl);
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)", backdropFilter: "blur(16px)" }}>
      <h1 className="text-xl font-bold text-center mb-1" style={{ color: "#e8f4ff" }}>Welcome back</h1>
      <p className="text-sm text-center mb-6" style={{ color: "#475569" }}>Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email</label>
          <FieldInput id="email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required autoFocus />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Password</label>
          <FieldInput id="password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
        </div>
        <button type="submit" disabled={loading}
          className="btn-magnetic w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{ color: "#020b18" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 field-pattern" style={{ background: "#020b18" }}>
      <div className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(59,130,246,0.06)", filter: "blur(60px)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(239,68,68,0.05)", filter: "blur(60px)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <MagnetLogo />
        </div>
        <Suspense fallback={<div className="rounded-2xl h-48 animate-pulse" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)" }} />}>
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
