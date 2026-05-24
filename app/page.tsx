"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, FileText, BarChart2, Globe, Users, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

const Scene3D = dynamic(() => import("@/components/landing/Scene3D"), { ssr: false });

const FEATURES = [
  {
    icon: FileText,
    title: "Notion-like editor",
    desc: "Write and structure content with a minimal, distraction-free editor. Multi-tab support built in.",
    color: "text-violet-400",
  },
  {
    icon: Users,
    title: "Smart lead gates",
    desc: "Content gates, popups, and top bars — configure form fields and trigger timing to your exact spec.",
    color: "text-blue-400",
  },
  {
    icon: BarChart2,
    title: "Real-time analytics",
    desc: "Views, gate conversions, leads collected. Time-series charts and CSV export on every magnet.",
    color: "text-purple-400",
  },
  {
    icon: Globe,
    title: "Custom domains",
    desc: "Host your lead magnets on your own domain. DNS verification built in, no proxy service needed.",
    color: "text-sky-400",
  },
  {
    icon: Sparkles,
    title: "AI generation",
    desc: "Generate full multi-tab lead magnets from a single prompt. Powered by OpenRouter — any model.",
    color: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Integrations",
    desc: "Zapier webhooks, Google Sheets, and RB2B pixel. Leads flow to wherever you need them.",
    color: "text-emerald-400",
  },
];

const STACK = ["Neon PostgreSQL", "NextAuth v5", "BlockNote editor", "OpenRouter AI (optional)"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05050f] text-white">
      {/* ── Floating nav ──────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white">Magnetize</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/athm793/magnetize"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            GitHub
          </a>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25">
              Get started free
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero — full-height 3D canvas + text overlay ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D canvas fills the section */}
        <div className="absolute inset-0">
          <Scene3D />
        </div>

        {/* Dark gradient vignette so text is readable */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(5,5,15,0.35) 60%, rgba(5,5,15,0.7) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#05050f] to-transparent pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-medium mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Open source · Free forever · Self-hostable
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            Lead magnets that
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              actually convert
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Replace static PDFs with interactive pages. Collect leads with smart gates,
            track every conversion, and route data to any tool.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-500 text-white px-8 h-12 text-base shadow-xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-105"
              >
                Create your first magnet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base border-white/20 text-gray-200 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
              >
                <GithubIcon className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-5">No credit card required</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-gray-500" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to capture leads
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Built for marketers, solo founders, and GTM teams. No design skills required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Self-host CTA ─────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-blue-900/60 border border-violet-500/20 p-10 text-center">
          {/* Background glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3">Self-host in 5 minutes</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto text-sm">
              Deploy to Vercel + Neon for free. Bring your own AI key or skip it entirely.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {STACK.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300 bg-white/10 rounded-full px-3 py-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize"
                target="_blank"
                rel="noopener"
              >
                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 shadow-xl">
                  Deploy to Vercel
                </Button>
              </a>
              <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
                <Button variant="outline" className="border-white/20 text-gray-200 hover:bg-white/10">
                  <GithubIcon className="w-4 h-4 mr-2" />
                  View source
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            Magnetize — MIT license
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/athm793/magnetize" className="hover:text-gray-300 transition-colors">GitHub</a>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-300 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
