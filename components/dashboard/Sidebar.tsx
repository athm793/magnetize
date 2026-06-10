"use client";
import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Globe, Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

function Logo() {
  return (
    <div className="flex items-center h-7 rounded-md overflow-hidden" style={{ boxShadow: "0 0 10px rgba(0,200,255,0.25)" }}>
      <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>N</div>
      <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.2)" }} />
      <div className="flex items-center justify-center px-2 h-full text-white text-[10px] font-black tracking-wider" style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)" }}>S</div>
    </div>
  );
}

function NavLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 min-h-[44px] text-sm rounded-lg transition-all"
      style={{ color: "#64748b" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e8f4ff"; (e.currentTarget as HTMLElement).style.background = "rgba(0,200,255,0.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: "inherit" }}>{icon}</span>
      <span className="font-medium" style={{ color: "inherit" }}>{children}</span>
    </Link>
  );
}

export function DashboardSidebar({
  userName,
  userEmail,
  onSignOut,
}: {
  userName: string;
  userEmail: string;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex items-center justify-between p-3" style={{ background: "#010d1a", borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={close}>
          <Logo />
          <span className="font-bold text-sm" style={{ color: "#e8f4ff" }}>Magnetize</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-center rounded-md"
          style={{ width: 44, height: 44, color: "#94a3b8" }}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Backdrop (mobile only, when drawer open) ── */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar / drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 shrink-0 flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#010d1a", borderRight: "1px solid rgba(0,200,255,0.08)" }}
      >
        {/* Logo */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={close}>
            <Logo />
            <span className="font-bold text-sm" style={{ color: "#e8f4ff" }}>Magnetize</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClick={close}>My Magnets</NavLink>
          <NavLink href="/settings" icon={<Globe className="w-4 h-4" />} onClick={close}>Domains</NavLink>
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}>
          <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-lg" style={{ background: "rgba(0,200,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white" }}>
              {userName?.[0]?.toUpperCase() ?? userEmail?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#e8f4ff" }}>{userName}</p>
              <p className="text-xs truncate" style={{ color: "#334155" }}>{userEmail}</p>
            </div>
          </div>
          <form action={onSignOut}>
            <SignOutButton />
          </form>
        </div>
      </aside>
    </>
  );
}
