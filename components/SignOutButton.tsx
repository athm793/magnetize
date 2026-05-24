"use client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="submit"
      className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all"
      style={{ color: "#475569" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = "#e8f4ff";
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = "#475569";
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  );
}
