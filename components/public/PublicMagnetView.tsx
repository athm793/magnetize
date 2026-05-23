"use client";
import { useState, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import ContentGate from "@/components/gates/ContentGate";
import PopupGate from "@/components/gates/PopupGate";
import TopBar from "@/components/gates/TopBar";
import { Zap } from "lucide-react";
import type { LeadMagnet } from "@/lib/db/queries/magnets";
import type { Tab } from "@/lib/db/queries/tabs";
import type { Gate } from "@/lib/db/queries/gates";

interface Props {
  magnet: LeadMagnet;
  tabs: Tab[];
  gates: Gate[];
  settings: Record<string, string>;
}

function TabContent({ tab }: { tab: Tab }) {
  const editor = useCreateBlockNote({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: tab.content?.length ? (tab.content as any) : undefined,
  });
  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}

export default function PublicMagnetView({ magnet, tabs, gates, settings }: Props) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const sessionId = sessionStorage.getItem("magnetize_session") ?? crypto.randomUUID();
    sessionStorage.setItem("magnetize_session", sessionId);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetId: magnet.id, event: "view", sessionId }),
    });

    const activeGates = gates.filter(g => g.active);
    if (activeGates.length > 0) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magnetId: magnet.id, event: "gate_shown", sessionId }),
      });
    }
  }, [magnet.id, gates]);

  const primary = settings.primaryColor ?? "#7c3aed";
  const bg = settings.bgColor ?? "#ffffff";
  const activeTab = tabs.find(t => t.id === activeTabId);
  const contentGate = gates.find(g => g.type === "content_gate");
  const popupGate = gates.find(g => g.type === "popup");
  const topbarGate = gates.find(g => g.type === "topbar");

  return (
    <div style={{ backgroundColor: bg }} className="min-h-screen">
      {topbarGate && <TopBar magnetId={magnet.id} gate={topbarGate} settings={magnet.settings} />}

      <div className="max-w-3xl mx-auto px-6 py-10">
        {settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-10 object-contain mb-8" />
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{magnet.title}</h1>

        {/* Tab bar */}
        {tabs.length > 1 && (
          <div className="flex gap-1 mb-8 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTabId === tab.id
                    ? "border-current text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                style={activeTabId === tab.id ? { borderColor: primary, color: primary } : {}}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {contentGate ? (
          <ContentGate magnetId={magnet.id} gate={contentGate} settings={magnet.settings}>
            {activeTab && <TabContent tab={activeTab} />}
          </ContentGate>
        ) : (
          activeTab && <TabContent tab={activeTab} />
        )}

        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-center">
          <a href="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <div className="w-4 h-4 rounded bg-violet-600 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            Made with Magnetize
          </a>
        </div>
      </div>

      {popupGate && <PopupGate magnetId={magnet.id} gate={popupGate} settings={magnet.settings} />}
    </div>
  );
}
