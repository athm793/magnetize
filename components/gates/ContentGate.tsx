"use client";
import { useState, useEffect } from "react";
import GateForm from "./GateForm";
import type { Gate } from "@/lib/db/queries/gates";
import type { MagnetSettings } from "@/lib/db/queries/magnets";

interface Props {
  magnetId: string;
  gate: Gate;
  settings: MagnetSettings;
  children: React.ReactNode;
}

export default function ContentGate({ magnetId, gate, settings, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`magnetize_unlocked_${magnetId}`);
    if (stored) setUnlocked(true);
  }, [magnetId]);

  if (unlocked) return <>{children}</>;

  const primary = settings.primaryColor ?? "#7c3aed";

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none max-h-64 overflow-hidden">
        {children}
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-sm mx-4">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-8 object-contain mb-4" />
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-1">Get free access</h2>
          <p className="text-sm text-gray-500 mb-5">Enter your details to unlock the full content.</p>
          <GateForm
            magnetId={magnetId}
            gateId={gate.id}
            formFields={gate.form_fields}
            primaryColor={primary}
            onSuccess={() => setUnlocked(true)}
          />
        </div>
      </div>
    </div>
  );
}
