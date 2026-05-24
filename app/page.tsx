"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    icon: FileText, title: "Notion-like editor",
    desc: "Write and structure content with a distraction-free editor. Multi-tab lead magnets, drag-and-drop blocks, embeds.",
    pole: "N",
  },
  {
    icon: Users, title: "Smart lead gates",
    desc: "Content gates, popups, and top bars — full control over form fields, timing, and trigger conditions.",
    pole: "N",
  },
  {
    icon: BarChart2, title: "Real-time analytics",
    desc: "View counts, gate conversions, leads collected. Time-series charts, funnel view, CSV export on demand.",
    pole: "N",
  },
  {
    icon: Sparkles, title: "AI generation",
    desc: "Describe your topic and audience. AI generates a full multi-tab lead magnet in seconds — any model via OpenRouter.",
    pole: "S",
  },
  {
    icon: Globe, title: "Custom domains",
    desc: "Host on your own domain with DNS verification built in. Every magnet gets a clean public URL.",
    pole: "S",
  },
  {
    icon: Zap, title: "Integrations",
    desc: "Zapier webhooks, native Google Sheets sync, and RB2B pixel. Leads go exactly where you need them.",
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
  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e8f4ff" }}>

      {/* ── Fixed nav ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ borderColor: "rgba(0,200,255,0.08)", background: "rgba(2,11,24,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* Magnet icon — N/S bar */}
            <div className="flex items-center h-7 rounded-md overflow-hidden" style={{ boxShadow: "0 0 12px rgba(0,200,255,0.3)" }}>
              <div className="flex items-center justify-center px-1.5 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
              <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.3)" }} />
              <div className="flex items-center justify-center px-1.5 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: "#e8f4ff" }}>Magnetize</span>
          </Link>

          <div className="flex items-center gap-2">
            <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#64748b" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e8f4ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
            >
              <GithubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link href="/login">
              <button className="text-sm px-3 py-1.5 rounded-lg transition-all" style={{ color: "#94a3b8" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >Sign in</button>
            </Link>
            <Link href="/signup">
              <button className="btn-magnetic text-sm px-4 py-1.5 rounded-lg font-semibold" style={{ color: "#020b18" }}>
                Get started free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── 3D scene + text ──────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D fills the section */}
        <div className="absolute inset-0">
          <Scene3D />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(2,11,24,0.55) 70%, rgba(2,11,24,0.85) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(to top, #020b18, transparent)" }} />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-14">
          {/* Pole badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.2)", color: "#00c8ff" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00c8ff" }} />
            Open source · Free forever · Self-hostable
          </div>

          <h1 className="font-black leading-[1.03] mb-5" style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}>
            Turn your content into<br />
            <span className="text-electric">a lead magnet</span>
          </h1>

          <p className="text-base mb-9 max-w-lg mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
            Replace static PDFs with interactive pages. Smart gates capture leads,
            analytics track every conversion, and integrations push data to your stack.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup">
              <button className="btn-magnetic flex items-center gap-2 px-7 py-3 rounded-xl text-base font-bold" style={{ color: "#020b18" }}>
                Create your first magnet
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ border: "1px solid rgba(0,200,255,0.2)", color: "#94a3b8" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.45)"; (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.2)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
              >
                <GithubIcon className="w-4 h-4" />
                View source
              </button>
            </a>
          </div>

          <p className="text-xs mt-4" style={{ color: "#475569" }}>No credit card required</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" style={{ color: "#334155" }}>
          <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, #334155)" }} />
        </div>
      </section>

      {/* ── Field divider ──────────────────────────────────── */}
      <div className="relative h-px mx-auto max-w-5xl" style={{ background: "linear-gradient(to right, transparent, rgba(0,200,255,0.3) 20%, rgba(0,200,255,0.3) 80%, transparent)" }}>
        <div className="absolute inset-0" style={{ boxShadow: "0 0 20px rgba(0,200,255,0.15)" }} />
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="pole-n">N</span>
            <span className="text-sm font-semibold" style={{ color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Features</span>
            <span className="pole-s">S</span>
          </div>
          <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}>
            Everything that <span className="text-electric">attracts leads</span>
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#64748b" }}>
            No design skills needed. Built for marketers, GTM teams, and solo founders.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            const isNorth = f.pole === "N";
            return (
              <div key={f.title} className="mag-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: isNorth ? "rgba(59,130,246,0.12)" : "rgba(239,68,68,0.10)" }}>
                    <Icon className="w-5 h-5" style={{ color: isNorth ? "#60a5fa" : "#f87171" }} />
                  </div>
                  <span className={isNorth ? "pole-n" : "pole-s"}>{f.pole}</span>
                </div>
                <h3 className="font-bold mb-2 text-base" style={{ color: "#e8f4ff" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Field line visual divider ──────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 mb-20">
        <svg viewBox="0 0 600 80" fill="none" className="w-full opacity-20">
          {[40, 50, 60, 70, 80].map((y, i) => (
            <path key={i}
              d={`M 0 ${y} Q 150 ${y - 30} 300 40 Q 450 ${y + 30 - 60} 600 ${y}`}
              stroke={i % 2 === 0 ? "#00e5ff" : "#3b82f6"} strokeWidth="0.8" />
          ))}
          <circle cx="300" cy="40" r="4" fill="#00c8ff" />
          <circle cx="300" cy="40" r="8" fill="none" stroke="#00c8ff" strokeWidth="0.5" />
        </svg>
      </div>

      {/* ── Self-host CTA ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.2) 0%, rgba(4,17,31,0.9) 50%, rgba(185,28,28,0.15) 100%)", border: "1px solid rgba(0,200,255,0.15)" }}>
          {/* Decorative pole ends */}
          <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-3xl" style={{ background: "linear-gradient(to bottom, #1d4ed8, #3b82f6)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-2 rounded-r-3xl" style={{ background: "linear-gradient(to bottom, #b91c1c, #ef4444)" }} />
          <div className="absolute -top-16 left-1/4 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(59,130,246,0.06)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-16 right-1/4 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(239,68,68,0.06)", filter: "blur(40px)" }} />

          <div className="relative z-10">
            <h2 className="font-black mb-3" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}>
              Self-host in 5 minutes
            </h2>
            <p className="mb-8 text-sm max-w-sm mx-auto" style={{ color: "#64748b" }}>
              Deploy to Vercel + Neon. Zero cost. MIT license. No black box.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {STACK.map(s => (
                <div key={s.label} className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.12)" }}>
                  <span className="flex items-center gap-1.5 font-medium" style={{ color: "#e8f4ff" }}>
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: "#00c8ff" }} />
                    {s.label}
                  </span>
                  <span className="text-xs" style={{ color: "#475569" }}>{s.detail}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                <button className="btn-magnetic flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold" style={{ color: "#020b18" }}>
                  Deploy to Vercel
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </a>
              <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: "1px solid rgba(0,200,255,0.18)", color: "#94a3b8" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.18)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
                >
                  <GithubIcon className="w-4 h-4" />
                  View on GitHub
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "rgba(0,200,255,0.07)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs" style={{ color: "#334155" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center h-5 rounded overflow-hidden">
              <div className="px-1 h-full flex items-center text-white font-black text-[9px]" style={{ background: "#1d4ed8" }}>N</div>
              <div className="px-1 h-full flex items-center text-white font-black text-[9px]" style={{ background: "#ef4444" }}>S</div>
            </div>
            <span>Magnetize — MIT license</span>
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/athm793/magnetize" className="transition-colors hover:text-[#94a3b8]">GitHub</a>
            <Link href="/login" className="transition-colors hover:text-[#94a3b8]">Sign in</Link>
            <Link href="/signup" className="transition-colors hover:text-[#94a3b8]">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
