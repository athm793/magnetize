"use client";
import dynamic from "next/dynamic";
import type { Tab } from "@/lib/db/queries/tabs";
import type { LeadMagnet } from "@/lib/db/queries/magnets";

const MagnetEditor = dynamic(() => import("./MagnetEditor"), { ssr: false });

interface Props {
  magnet: LeadMagnet;
  tabs: Tab[];
  hasAI?: boolean;
}

export default function MagnetEditorLoader(props: Props) {
  return <MagnetEditor {...props} />;
}
