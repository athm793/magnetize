"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle, Clock, ExternalLink } from "lucide-react";
import type { Domain } from "@/lib/db/queries/domains";
import type { LeadMagnet } from "@/lib/db/queries/magnets";

export default function SettingsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/domains").then(r => r.json()).then(setDomains);
    fetch("/api/magnets").then(r => r.json()).then(setMagnets);
  }, []);

  async function addDomain() {
    if (!newDomain.trim()) return;
    setAdding(true);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
    });
    setAdding(false);
    if (res.ok) {
      const d = await res.json();
      setDomains(prev => [d, ...prev]);
      setNewDomain("");
      toast.success("Domain added — add the TXT record to verify it");
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Failed to add domain");
    }
  }

  async function verifyDomain(id: string) {
    setVerifying(id);
    const res = await fetch("/api/domains", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "verify" }),
    });
    const { verified } = await res.json();
    setVerifying(null);
    if (verified) {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, verified: true } : d));
      toast.success("Domain verified!");
    } else {
      toast.error("TXT record not found yet — DNS can take up to 48 hours to propagate");
    }
  }

  async function removeDomain(id: string) {
    const res = await fetch("/api/domains", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setDomains(prev => prev.filter(d => d.id !== id));
      toast.success("Domain removed");
    } else {
      toast.error("Failed to remove domain");
    }
  }

  async function assignMagnet(id: string, magnetId: string) {
    setAssigning(id);
    const res = await fetch("/api/domains", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "assignMagnet", magnetId: magnetId === "none" ? null : magnetId }),
    });
    setAssigning(null);
    if (res.ok) {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, magnet_id: magnetId === "none" ? null : magnetId } : d));
      toast.success("Domain updated");
    } else {
      toast.error("Failed to update domain");
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your custom domains and account preferences.</p>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Custom Domains</h2>
        <p className="text-xs text-gray-500 mb-4">
          Point your own domain to a lead magnet. Add a TXT record to verify ownership, then point a CNAME to{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">cname.vercel-dns.com</code>.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="yourdomain.com"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addDomain()}
            className="text-sm"
          />
          <Button onClick={addDomain} disabled={adding} className="bg-violet-600 hover:bg-violet-700 shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            {adding ? "Adding…" : "Add domain"}
          </Button>
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No custom domains yet.
          </div>
        ) : (
          <div className="space-y-3">
            {domains.map(domain => (
              <div key={domain.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{domain.domain}</span>
                      {domain.verified ? (
                        <Badge className="text-xs bg-green-100 text-green-700 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    {!domain.verified && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-1">Add this TXT record to your DNS:</p>
                        <code className="text-xs text-amber-900 break-all">{domain.txt_record}</code>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Label className="text-xs text-gray-500 shrink-0">Points to</Label>
                      <Select
                        value={domain.magnet_id ?? "none"}
                        onValueChange={(v) => assignMagnet(domain.id, v ?? "none")}
                        disabled={assigning === domain.id}
                      >
                        <SelectTrigger className="h-7 text-xs w-48">
                          <SelectValue placeholder="No magnet assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No magnet assigned</SelectItem>
                          {magnets.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!domain.verified && domain.magnet_id && (
                      <p className="text-xs text-gray-400 mt-1">Will go live once this domain is verified.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!domain.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => verifyDomain(domain.id)}
                        disabled={verifying === domain.id}
                      >
                        {verifying === domain.id ? "Checking…" : "Verify"}
                      </Button>
                    )}
                    {domain.verified && (
                      <a href={`https://${domain.domain}`} target="_blank" rel="noopener" aria-label={`Open ${domain.domain} in a new tab`}>
                        <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDomain(domain.id)}
                      aria-label={`Remove domain ${domain.domain}`}
                      className="h-11 w-11 p-0 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
