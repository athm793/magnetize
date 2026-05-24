"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Zap, ArrowLeft, RefreshCw } from "lucide-react";

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
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

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
    if (res.ok) {
      toast.success("New code sent!");
      setCountdown(60);
      setCode("");
      inputRef.current?.focus();
    } else {
      toast.error("Failed to resend code");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
          <Zap className="w-6 h-6 text-violet-600" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Check your email</h1>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to<br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          ref={inputRef}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl font-bold tracking-[0.5em] h-14"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying…" : "Verify code"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mx-auto transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </button>
      </div>

      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mt-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Magnetize</span>
          </Link>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl border p-8 h-72 animate-pulse" />}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
