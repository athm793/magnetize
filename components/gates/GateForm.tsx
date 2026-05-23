"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/lib/db/queries/gates";

interface Props {
  magnetId: string;
  gateId: string;
  formFields: FormField[];
  buttonText?: string;
  primaryColor?: string;
  onSuccess: (lead: { email: string; name?: string }) => void;
}

export default function GateForm({ magnetId, gateId, formFields, buttonText = "Get access", primaryColor = "#7c3aed", onSuccess }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const required = formFields.filter((f) => f.required);
    for (const f of required) {
      if (!values[f.name]?.trim()) { setError(`${f.label} is required`); return; }
    }

    const sessionId = sessionStorage.getItem("magnetize_session") ?? crypto.randomUUID();
    sessionStorage.setItem("magnetize_session", sessionId);

    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        magnetId,
        gateId,
        email: values.email ?? "",
        name: values.name,
        data: Object.fromEntries(Object.entries(values).filter(([k]) => k !== "email" && k !== "name")),
        sessionId,
      }),
    });
    setLoading(false);

    if (res.ok) {
      sessionStorage.setItem(`magnetize_unlocked_${magnetId}`, "1");
      onSuccess({ email: values.email ?? "", name: values.name });
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {formFields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            onChange={e => set(field.name, e.target.value)}
            className="mt-1"
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full text-white font-semibold"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? "Submitting…" : buttonText}
      </Button>
    </form>
  );
}
