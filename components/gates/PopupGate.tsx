"use client";
import { useState, useEffect } from "react";
import GateForm from "./GateForm";
import { X } from "lucide-react";
import type { Gate } from "@/lib/db/queries/gates";
import type { MagnetSettings } from "@/lib/db/queries/magnets";

interface Props {
  magnetId: string;
  gate: Gate;
  settings: MagnetSettings;
}

export default function PopupGate({ magnetId, gate, settings }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`magnetize_unlocked_${magnetId}`);
    if (stored) return;

    const trigger = gate.trigger_config;
    if (trigger.type === "immediate") {
      setTimeout(() => setOpen(true), 500);
    } else if (trigger.type === "time") {
      setTimeout(() => setOpen(true), (trigger.value ?? 5) * 1000);
    } else if (trigger.type === "scroll") {
      const threshold = trigger.value ?? 50;
      const handler = () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (pct >= threshold) { setOpen(true); window.removeEventListener("scroll", handler); }
      };
      window.addEventListener("scroll", handler);
      return () => window.removeEventListener("scroll", handler);
    }
  }, [magnetId, gate]);

  if (submitted || !open) return null;

  const primary = settings.primaryColor ?? "#7c3aed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
        {settings.logo && <img src={settings.logo} alt="Logo" className="h-8 object-contain mb-4" />}
        <h2 className="text-xl font-bold text-gray-900 mb-1">Before you go</h2>
        <p className="text-sm text-gray-500 mb-5">Get this resource delivered to your inbox.</p>
        <GateForm
          magnetId={magnetId}
          gateId={gate.id}
          formFields={gate.form_fields}
          primaryColor={primary}
          onSuccess={() => { setSubmitted(true); setOpen(false); }}
        />
      </div>
    </div>
  );
}
