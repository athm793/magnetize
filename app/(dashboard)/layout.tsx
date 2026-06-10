import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ background: "#f0f4f8" }}>
      <DashboardSidebar
        userName={session.user.name ?? "User"}
        userEmail={session.user.email ?? ""}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
