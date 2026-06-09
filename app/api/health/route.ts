import { NextResponse } from "next/server";
import sql from "@/lib/db/client";

export async function GET() {
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true, db: "connected", ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: "unreachable", ts: Date.now() }, { status: 503 });
  }
}
