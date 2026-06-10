"use client";
import dynamic from "next/dynamic";
import type { LeadMagnet } from "@/lib/db/queries/magnets";
import type { Tab } from "@/lib/db/queries/tabs";
import type { Gate } from "@/lib/db/queries/gates";

const PublicMagnetView = dynamic(() => import("./PublicMagnetView"), { ssr: false });

interface Props {
  magnet: LeadMagnet;
  tabs: Tab[];
  gates: Gate[];
  settings: Record<string, string>;
}

export default function PublicMagnetViewLoader(props: Props) {
  return <PublicMagnetView {...props} />;
}
