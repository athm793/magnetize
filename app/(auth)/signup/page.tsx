"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

function FieldInput({ id, type, value, onChange, placeholder, required, minLength }: {
  id: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number;
}) {
  return (
    <input
      id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required} minLength={minLength}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all outline-none"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,200,255,0.15)", color: "#e8f4ff", caretColor: "#00c8ff" }}
      onFocus={e => { e.target.style.borderColor = "rgba(0,200,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,200,255,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(0,200,255,0.15)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => { if (data?.user) router.replace("/dashboard"); })
      .catch(() => {});
  }, [router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      toast.error(error ?? "Signup failed");
      setLoading(false);
      return;
    }

    // Account created — sign in immediately, no email verification step
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      toast.error("Account created. Please sign in.");
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 field-pattern" style={{ background: "#020b18" }}>
      <div className="fixed top-1/3 left-1/3 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(59,130,246,0.05)", filter: "blur(70px)" }} />
      <div className="fixed bottom-1/3 right-1/3 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(239,68,68,0.04)", filter: "blur(70px)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <MagnetLogo />
        </div>

        <div className="rounded-2xl p-8" style={{ background: "rgba(4,17,31,0.85)", border: "1px solid rgba(0,200,255,0.12)", backdropFilter: "blur(16px)" }}>
          <h1 className="text-xl font-bold text-center mb-1" style={{ color: "#e8f4ff" }}>Create your account</h1>
          <p className="text-sm text-center mb-6" style={{ color: "#475569" }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label htmlFor="name" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Full name</label>
              <FieldInput id="name" type="text" value={name} onChange={setName} placeholder="Alex Smith" />
            </div>
            <div>
              <label htmlFor="email" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email</label>
              <FieldInput id="email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Password</label>
              <FieldInput id="password" type="password" value={password} onChange={setPassword} placeholder="8+ characters" required minLength={8} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-magnetic w-full py-2.5 rounded-xl text-sm font-bold mt-1" style={{ color: "#020b18" }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "#334155" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold transition-colors" style={{ color: "#0ea5e9" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00c8ff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#0ea5e9")}
          >Sign in</Link>
        </p>
      </div>
    </div>
  );
}
