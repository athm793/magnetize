import { getMagnetBySlug } from "@/lib/db/queries/magnets";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicMagnetPage, { getMagnetMetadata } from "@/components/public/PublicMagnetPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const magnet = await getMagnetBySlug(slug);
  if (!magnet) return { title: "Not Found" };
  return getMagnetMetadata(magnet);
}

export default async function PublicMagnetSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magnet = await getMagnetBySlug(slug);
  if (!magnet) notFound();

  return <PublicMagnetPage magnet={magnet} />;
}
