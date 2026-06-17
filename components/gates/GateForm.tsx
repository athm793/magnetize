"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormField } from "@/lib/db/queries/gates";

// Common B2B country codes
const COUNTRY_CODES = [
  { code: "+1",   flag: "🇺🇸", label: "US / CA" },
  { code: "+44",  flag: "🇬🇧", label: "UK" },
  { code: "+49",  flag: "🇩🇪", label: "DE" },
  { code: "+33",  flag: "🇫🇷", label: "FR" },
  { code: "+31",  flag: "🇳🇱", label: "NL" },
  { code: "+32",  flag: "🇧🇪", label: "BE" },
  { code: "+41",  flag: "🇨🇭", label: "CH" },
  { code: "+46",  flag: "🇸🇪", label: "SE" },
  { code: "+47",  flag: "🇳🇴", label: "NO" },
  { code: "+45",  flag: "🇩🇰", label: "DK" },
  { code: "+358", flag: "🇫🇮", label: "FI" },
  { code: "+353", flag: "🇮🇪", label: "IE" },
  { code: "+34",  flag: "🇪🇸", label: "ES" },
  { code: "+39",  flag: "🇮🇹", label: "IT" },
  { code: "+48",  flag: "🇵🇱", label: "PL" },
  { code: "+61",  flag: "🇦🇺", label: "AU" },
  { code: "+64",  flag: "🇳🇿", label: "NZ" },
  { code: "+65",  flag: "🇸🇬", label: "SG" },
  { code: "+91",  flag: "🇮🇳", label: "IN" },
  { code: "+81",  flag: "🇯🇵", label: "JP" },
  { code: "+82",  flag: "🇰🇷", label: "KR" },
  { code: "+55",  flag: "🇧🇷", label: "BR" },
  { code: "+52",  flag: "🇲🇽", label: "MX" },
  { code: "+27",  flag: "🇿🇦", label: "ZA" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+972", flag: "🇮🇱", label: "IL" },
];

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "aol.com","mail.com","protonmail.com","zoho.com","yandex.com",
  "live.com","msn.com","me.com","mac.com","yahoo.co.uk",
  "yahoo.fr","yahoo.de","yahoo.es","yahoo.it","yahoo.co.jp",
  "googlemail.com","hotmail.co.uk","hotmail.fr","hotmail.de",
  "live.co.uk","live.fr","live.de","live.ca","live.com.au",
  "rocketmail.com","sbcglobal.net","verizon.net","att.net",
  "bellsouth.net","comcast.net","cox.net","earthlink.net",
  "inbox.com","mail.ru","fastmail.com","tutanota.com",
]);

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && PERSONAL_EMAIL_DOMAINS.has(domain);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, hyphens, parentheses — at least 6 digits
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

function isValidLinkedIn(value: string): boolean {
  return /linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+/i.test(value);
}

interface Props {
  magnetId: string;
  gateId: string;
  formFields: FormField[];
  buttonText?: string;
  primaryColor?: string;
  onSuccess: (lead: { email: string; name?: string }) => void;
}

export default function GateForm({
  magnetId,
  gateId,
  formFields,
  buttonText = "Get access",
  primaryColor = "#7c3aed",
  onSuccess,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [phoneCodes, setPhoneCodes] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const f of formFields) {
      if (f.type === "tel") {
        defaults[f.name] = f.validation?.defaultCountryCode ?? "+1";
      }
    }
    return defaults;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate(): string | null {
    for (const f of formFields) {
      const raw = values[f.name]?.trim() ?? "";

      if (f.required && !raw) return `${f.label} is required`;

      if (!raw) continue; // optional + empty → skip

      if (f.type === "email") {
        if (!isValidEmail(raw)) return "Enter a valid email address";
        if (f.validation?.noPersonalEmail && isPersonalEmail(raw))
          return "Please use your work email address";
      }

      if (f.type === "tel") {
        if (!isValidPhone(raw)) return "Enter a valid phone number";
      }

      if (f.type === "url") {
        if (!isValidUrl(raw)) return "Enter a valid URL (e.g. company.com)";
      }

      if (f.type === "linkedin") {
        if (!isValidLinkedIn(raw))
          return "Enter a valid LinkedIn URL (linkedin.com/in/… or linkedin.com/company/…)";
      }
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    // Build final values — prepend country code to phone fields
    const finalValues: Record<string, string> = {};
    for (const f of formFields) {
      const raw = values[f.name]?.trim() ?? "";
      if (f.type === "tel" && raw) {
        finalValues[f.name] = `${phoneCodes[f.name] ?? "+1"} ${raw}`;
      } else {
        finalValues[f.name] = raw;
      }
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
        email: finalValues.email ?? "",
        name: finalValues.name,
        data: Object.fromEntries(
          Object.entries(finalValues).filter(([k]) => k !== "email" && k !== "name")
        ),
        sessionId,
      }),
    });
    setLoading(false);

    if (res.ok) {
      sessionStorage.setItem(`magnetize_unlocked_${magnetId}`, "1");
      onSuccess({ email: finalValues.email ?? "", name: finalValues.name });
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {formFields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>

          {field.type === "tel" ? (
            <div className="flex gap-1.5 mt-1">
              <Select
                value={phoneCodes[field.name] ?? "+1"}
                onValueChange={(v) => setPhoneCodes((prev) => ({ ...prev, [field.name]: v ?? "+1" }))}
              >
                <SelectTrigger className="w-28 shrink-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs">
                      {c.flag} {c.code} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id={field.name}
                type="tel"
                placeholder={field.placeholder ?? "555 000 0000"}
                value={values[field.name] ?? ""}
                onChange={(e) => set(field.name, e.target.value)}
                className="flex-1"
              />
            </div>
          ) : (
            <Input
              id={field.name}
              type={field.type === "linkedin" || field.type === "url" ? "url" : field.type}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => set(field.name, e.target.value)}
              className="mt-1"
            />
          )}

          {field.type === "email" && field.validation?.noPersonalEmail && (
            <p className="text-xs text-gray-400 mt-0.5">Work email only</p>
          )}
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
