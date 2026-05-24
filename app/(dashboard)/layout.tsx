import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";
import { LayoutDashboard, Settings, Globe } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen" style={{ background: "#f0f4f8" }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: "#010d1a", borderRight: "1px solid rgba(0,200,255,0.08)" }}>
        {/* Logo */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center h-7 rounded-md overflow-hidden" style={{ boxShadow: "0 0 10px rgba(0,200,255,0.25)" }}>
              <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
              <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.2)" }} />
              <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
            </div>
            <span className="font-bold text-sm" style={{ color: "#e8f4ff" }}>Magnetize</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>My Magnets</NavLink>
          <NavLink href="/settings" icon={<Globe className="w-4 h-4" />}>Domains</NavLink>
          <NavLink href="/settings?tab=account" icon={<Settings className="w-4 h-4" />}>Settings</NavLink>
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}>
          <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-lg" style={{ background: "rgba(0,200,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white" }}>
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#e8f4ff" }}>{session.user.name ?? "User"}</p>
              <p className="text-xs truncate" style={{ color: "#334155" }}>{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <SignOutButton />
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all group"
      style={{ color: "#64748b" }}
    >
      <span className="transition-colors" style={{ color: "inherit" }}>{icon}</span>
      <span className="font-medium" style={{ color: "inherit" }}>{children}</span>
      <style>{`
        a[href="${href}"]:hover {
          color: #e8f4ff !important;
          background: rgba(0,200,255,0.08) !important;
          border-left: 2px solid rgba(0,200,255,0.6);
          padding-left: 10px;
        }
      `}</style>
    </Link>
  );
}
