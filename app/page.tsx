import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, FileText, BarChart2, Globe, Users, Sparkles, CheckCircle } from "lucide-react";

const FEATURES = [
  { icon: <FileText className="w-5 h-5" />, title: "Notion-like editor", desc: "Write and structure content with a minimal, distraction-free editor. No design skills needed." },
  { icon: <Users className="w-5 h-5" />, title: "Smart lead gates", desc: "Content gates, popups, and top bars — configure form fields and trigger timing." },
  { icon: <BarChart2 className="w-5 h-5" />, title: "Real-time analytics", desc: "Track views, gate conversions, and leads collected. Export any time to CSV." },
  { icon: <Globe className="w-5 h-5" />, title: "Custom domains", desc: "Host your lead magnets on your own domain. DNS verification built in." },
  { icon: <Sparkles className="w-5 h-5" />, title: "AI generation", desc: "Generate full multi-tab lead magnets from a topic and audience. Powered by OpenRouter." },
  { icon: <Zap className="w-5 h-5" />, title: "Integrations", desc: "Send leads to Zapier, Google Sheets, or RB2B automatically on every capture." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Magnetize</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">GitHub</a>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Get started free</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        <div className="text-center pt-20 pb-16">
          <Badge variant="secondary" className="mb-4 text-xs">Open source &amp; free forever</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Lead magnets that<br />
            <span className="text-violet-600">actually convert</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Replace static PDFs with interactive pages. Collect leads with smart gates, track conversions, and send data anywhere.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 px-8">
                Create your first magnet
              </Button>
            </Link>
            <a href="https://github.com/athm793/magnetize" target="_blank" rel="noopener">
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Free forever. No credit card. Self-hostable.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-20">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8 mb-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-host for free</h2>
          <p className="text-gray-500 mb-6 text-sm">Deploy to Vercel + Neon in 5 minutes. Bring your own AI key or skip it.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["Neon PostgreSQL", "NextAuth", "BlockNote", "OpenRouter (optional)"].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
          <a href="https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize" target="_blank" rel="noopener">
            <Button className="bg-black hover:bg-gray-800 text-white">Deploy to Vercel</Button>
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            Magnetize — Open source, MIT license
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/athm793/magnetize" className="hover:text-gray-700 transition-colors">GitHub</a>
            <Link href="/login" className="hover:text-gray-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
