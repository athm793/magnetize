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

export default function TopBar({ magnetId, gate, settings }: Props) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`magnetize_unlocked_${magnetId}`);
    if (stored) setVisible(false);
  }, [magnetId]);

  if (!visible || submitted) return null;

  const primary = settings.primaryColor ?? "#7c3aed";

  return (
    <div style={{ backgroundColor: primary }} className="text-white">
      {!expanded ? (
        <div className="flex items-center justify-between px-6 py-3 max-w-5xl mx-auto">
          <p className="text-sm font-medium">Get free access to this resource</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(true)}
              className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full font-medium transition-colors"
            >
              Get access
            </button>
            <button onClick={() => setVisible(false)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 max-w-xl mx-auto">
          <div className="flex justify-between items-start mb-3">
            <p className="text-sm font-semibold">Enter your details to get access</p>
            <button onClick={() => setExpanded(false)} className="text-white/70 hover:text-white ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-xl p-4">
            <GateForm
              magnetId={magnetId}
              gateId={gate.id}
              formFields={gate.form_fields}
              primaryColor={primary}
              buttonText="Get access"
              onSuccess={() => { setSubmitted(true); setVisible(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
