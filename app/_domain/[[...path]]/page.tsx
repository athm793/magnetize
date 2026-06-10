import { getMagnetByDomain } from "@/lib/db/queries/magnets";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicMagnetPage, { getMagnetMetadata } from "@/components/public/PublicMagnetPage";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ domain?: string }> }): Promise<Metadata> {
  const { domain } = await searchParams;
  const magnet = domain ? await getMagnetByDomain(domain) : null;
  if (!magnet) return { title: "Not Found" };
  return getMagnetMetadata(magnet);
}

export default async function CustomDomainPage({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  const { domain } = await searchParams;
  const magnet = domain ? await getMagnetByDomain(domain) : null;
  if (!magnet) notFound();

  return <PublicMagnetPage magnet={magnet} />;
}
