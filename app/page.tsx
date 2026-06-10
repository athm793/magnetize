"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Zap, FileText, BarChart2, Globe, Users, Sparkles,
  CheckCircle, ArrowRight, ExternalLink,
} from "lucide-react";

const Scene3D = dynamic(() => import("@/components/landing/Scene3D"), { ssr: false });

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Notion-like editor",
    desc: "Write and structure content with a distraction-free editor. Multi-tab magnets, drag-and-drop blocks, Loom and Calendly embeds.",
    pole: "N",
  },
  {
    icon: Users,
    title: "Smart lead gates",
    desc: "Content gates, popups, and top bars — full control over form fields, trigger timing, and gate conditions.",
    pole: "N",
  },
  {
    icon: BarChart2,
    title: "Real-time analytics",
    desc: "View counts, gate conversions, leads collected. Time-series charts, funnel view, CSV export on demand.",
    pole: "N",
  },
  {
    icon: Sparkles,
    title: "AI generation",
    desc: "Describe your topic and audience. AI generates a full multi-tab lead magnet in seconds via OpenRouter.",
    pole: "S",
  },
  {
    icon: Globe,
    title: "Custom domains",
    desc: "Host on your own domain with DNS verification built in. Every magnet gets a clean, shareable public URL.",
    pole: "S",
  },
  {
    icon: Zap,
    title: "Integrations",
    desc: "Zapier webhooks, native Google Sheets sync, and RB2B pixel. Leads go exactly where your stack expects.",
    pole: "S",
  },
];

const STACK = [
  { label: "Neon PostgreSQL", detail: "Serverless, free tier" },
  { label: "NextAuth v5", detail: "Credentials + Google OAuth" },
  { label: "BlockNote", detail: "Notion-like editor" },
  { label: "OpenRouter AI", detail: "Optional — any model" },
];

export default function LandingPage() {
  const [isAuthed, setIsAuthed] = useState(false);

  // Check auth state for nav/footer CTAs
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => setIsAuthed(!!data?.user))
      .catch(() => setIsAuthed(false));
  }, []);

  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: "#020b18", color: "#e8f4ff" }}>

      {/* ── Fixed 3D scene — always in background ──────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Scene3D />
      </div>

      {/* ── Scrollable content layer ──────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Nav ──────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(2,11,24,0.88)", backdropFilter: "blur(16px)" }}>
          {/* Blue-to-red gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, #1d4ed8 0%, transparent 40%, transparent 60%, #b91c1c 100%)" }} />

          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center h-7 rounded-md overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.5)]"
                style={{ boxShadow: "0 0 10px rgba(59,130,246,0.25)" }}>
                <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
                <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.25)" }} />
                <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider"
                  style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: "#e8f4ff" }}>Magnetize</span>
            </Link>

            <div className="flex items-center gap-2">
              <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all"
                style={{ color: "#64748b" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <GithubIcon className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              {isAuthed ? (
                <Link href="/dashboard">
                  <button className="btn-north text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg font-semibold whitespace-nowrap">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >Sign in</button>
                  </Link>
                  <Link href="/signup">
                    <button className="btn-north text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg font-semibold whitespace-nowrap">
                      <span className="sm:hidden">Get started</span>
                      <span className="hidden sm:inline">Get started free</span>
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero — 100vh, fully transparent, 3D shows through ── */}
        <section className="relative flex items-center justify-center overflow-hidden"
          style={{ height: "100vh" }}>

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-14">
            {/* Animated status badge */}
            <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full text-xs font-semibold reveal visible"
              style={{ background: "rgba(29,78,216,0.12)", border: "1px solid rgba(59,130,246,0.28)", color: "#93c5fd" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#3b82f6" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#60a5fa" }} />
              </span>
              Open source · Free forever · Self-hostable
            </div>

            <h1 className="font-black leading-[1.04] mb-6 reveal visible"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 4.8rem)", letterSpacing: "-0.025em" }}>
              Turn your content into<br />
              <span className="text-poles">a lead magnet</span>
            </h1>

            <p className="text-base mb-10 max-w-lg mx-auto leading-relaxed reveal visible"
              style={{ color: "#94a3b8" }}>
              Replace static PDFs with interactive pages. Smart gates capture leads,
              analytics track every conversion, integrations push data to your stack.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap reveal visible">
              <Link href="/signup">
                <button className="btn-north flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold">
                  Create your first magnet
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", background: "rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <GithubIcon className="w-4 h-4" />
                  View source
                </button>
              </a>
            </div>

            <p className="text-xs mt-5 reveal visible" style={{ color: "#334155" }}>No credit card required</p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase" style={{ color: "#1e3a5f", letterSpacing: "0.2em", fontSize: "0.6rem" }}>scroll</span>
            <div className="scroll-line" style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #1d4ed8, transparent)" }} />
          </div>
        </section>

        {/* ── Transparent gap — 3D fully visible ───────────── */}
        <div style={{ height: "3rem" }} />

        {/* ── Features section ──────────────────────────────── */}
        <section style={{ background: "rgba(2,11,24,0.55)" }}>
          <div className="max-w-6xl mx-auto px-6 py-24">

            {/* Section header */}
            <div className="text-center mb-16 reveal">
              {/* N | S divider */}
              <div className="inline-flex items-center gap-0 mb-5 rounded-lg overflow-hidden"
                style={{ boxShadow: "0 0 20px rgba(59,130,246,0.2)" }}>
                <span className="px-4 py-1.5 text-xs font-black tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</span>
                <span className="px-4 py-1.5 text-xs font-black tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</span>
              </div>

              <h2 className="font-black mb-4"
                style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", letterSpacing: "-0.022em" }}>
                Everything that{" "}
                <span className="text-north">attracts</span>{" "}
                <span className="text-south">leads</span>
              </h2>
              <p className="text-sm max-w-sm mx-auto" style={{ color: "#64748b" }}>
                No design skills needed. Built for marketers, GTM teams, and founders.
              </p>
            </div>

            {/* Feature cards — 3 blue (N) then 3 red (S) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, idx) => {
                const Icon = f.icon;
                const isNorth = f.pole === "N";
                return (
                  <div key={f.title}
                    className={`reveal reveal-d${(idx % 3) + 1} ${isNorth ? "mag-card-n" : "mag-card-s"} rounded-2xl p-6`}>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: isNorth ? "rgba(29,78,216,0.15)" : "rgba(185,28,28,0.15)",
                          border: `1px solid ${isNorth ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)"}`,
                        }}>
                        <Icon className="w-5 h-5" style={{ color: isNorth ? "#60a5fa" : "#f87171" }} />
                      </div>
                      <span className={isNorth ? "pole-n" : "pole-s"}>{f.pole}</span>
                    </div>
                    <h3 className="font-bold mb-2 text-[15px]" style={{ color: "#e8f4ff" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>

                    {/* Bottom accent line */}
                    <div className="mt-5 h-px rounded-full"
                      style={{ background: isNorth ? "linear-gradient(90deg, #1d4ed8, transparent)" : "linear-gradient(90deg, #b91c1c, transparent)", opacity: 0.5 }} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Transparent gap — magnet visible again ────────── */}
        <div style={{ height: "2rem" }} />

        {/* ── Self-host CTA ─────────────────────────────────── */}
        <section style={{ background: "rgba(2,11,24,0.5)" }}>
          <div className="max-w-5xl mx-auto px-6 pb-24 pt-4">

            {/* SVG field line divider */}
            <div className="max-w-2xl mx-auto mb-16 reveal">
              <svg viewBox="0 0 500 60" fill="none" className="w-full">
                {[0, 1, 2, 3, 4].map((i) => (
                  <path key={i}
                    d={`M 0 ${38 + i * 5} Q 125 ${20 - i * 4} 250 30 Q 375 ${40 + i * 4} 500 ${38 + i * 5}`}
                    stroke={i % 2 === 0 ? "#1d4ed8" : "#b91c1c"}
                    strokeWidth="0.7"
                    opacity={0.25 - i * 0.03}
                  />
                ))}
                {/* Center magnet pip */}
                <circle cx="250" cy="30" r="3.5" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
                <circle cx="250" cy="30" r="7" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>

            <div className="rounded-3xl p-10 text-center relative overflow-hidden reveal"
              style={{
                background: "linear-gradient(135deg, rgba(29,78,216,0.18) 0%, rgba(4,17,31,0.94) 45%, rgba(185,28,28,0.14) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
              {/* Blue left bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                style={{ background: "linear-gradient(to bottom, #1d4ed8, #3b82f6)" }} />
              {/* Red right bar */}
              <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-3xl"
                style={{ background: "linear-gradient(to bottom, #b91c1c, #ef4444)" }} />

              {/* Atmospheric glows */}
              <div className="absolute -top-12 left-1/4 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "rgba(29,78,216,0.1)", filter: "blur(40px)" }} />
              <div className="absolute -bottom-12 right-1/4 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "rgba(185,28,28,0.1)", filter: "blur(40px)" }} />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-0 mb-5 rounded-lg overflow-hidden"
                  style={{ boxShadow: "0 0 16px rgba(59,130,246,0.15)" }}>
                  <span className="px-3 py-1 text-[10px] font-black tracking-widest text-white"
                    style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</span>
                  <span className="px-3 py-1 text-[10px] font-black tracking-widest text-white"
                    style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</span>
                </div>

                <h2 className="font-black mb-3"
                  style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}>
                  Self-host in{" "}
                  <span className="text-north">5 minutes</span>
                </h2>
                <p className="mb-8 text-sm max-w-sm mx-auto" style={{ color: "#64748b" }}>
                  Deploy to Vercel + Neon. Zero cost. MIT license. No black box.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {STACK.map((s) => (
                    <div key={s.label}
                      className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl text-sm transition-all"
                      style={{ background: "rgba(29,78,216,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.35)"; (e.currentTarget as HTMLElement).style.background = "rgba(29,78,216,0.16)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.15)"; (e.currentTarget as HTMLElement).style.background = "rgba(29,78,216,0.08)"; }}
                    >
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: "#e8f4ff" }}>
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
                        {s.label}
                      </span>
                      <span className="text-xs" style={{ color: "#475569" }}>{s.detail}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <a href="https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                    <button className="btn-north flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold">
                      Deploy to Vercel
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </a>
                  <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ border: "1px solid rgba(239,68,68,0.25)", color: "#94a3b8", background: "rgba(185,28,28,0.06)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.5)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; (e.currentTarget as HTMLElement).style.background = "rgba(185,28,28,0.14)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.25)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "rgba(185,28,28,0.06)"; }}
                    >
                      <GithubIcon className="w-4 h-4" />
                      View on GitHub
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer style={{ background: "rgba(2,11,24,0.95)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {/* Blue-to-red top accent */}
          <div className="h-px" style={{ background: "linear-gradient(90deg, #1d4ed8 0%, transparent 35%, transparent 65%, #b91c1c 100%)" }} />
          <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs"
            style={{ color: "#334155" }}>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center h-5 rounded overflow-hidden" style={{ boxShadow: "0 0 6px rgba(59,130,246,0.2)" }}>
                <div className="px-1.5 h-full flex items-center text-white font-black text-[9px]"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
                <div className="px-1.5 h-full flex items-center text-white font-black text-[9px]"
                  style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
              </div>
              <span>Magnetize — MIT license</span>
            </div>
            <div className="flex gap-5">
              <a href="https://github.com/athm793/magnetize"
                className="transition-colors"
                style={{ color: "#334155" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
              >GitHub</a>
              {isAuthed ? (
                <Link href="/dashboard"
                  className="transition-colors"
                  style={{ color: "#334155" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
                >Dashboard</Link>
              ) : (
                <>
                  <Link href="/login"
                    className="transition-colors"
                    style={{ color: "#334155" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
                  >Sign in</Link>
                  <Link href="/signup"
                    className="transition-colors"
                    style={{ color: "#334155" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
                  >Sign up</Link>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
