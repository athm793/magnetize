"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save, Plus, X, GripVertical, ExternalLink, PlayCircle, FileText, Code } from "lucide-react";
import type { Tab, TabType, EmbedData } from "@/lib/db/queries/tabs";
import type { LeadMagnet } from "@/lib/db/queries/magnets";

interface Props {
  magnet: LeadMagnet;
  tabs: Tab[];
  hasAI?: boolean;
}

const TAB_TYPE_ICONS: Record<TabType, React.ReactNode> = {
  blocks:  <FileText className="w-3 h-3" />,
  youtube: <PlayCircle className="w-3 h-3" />,
  file:    <FileText className="w-3 h-3" />,
  embed:   <Code className="w-3 h-3" />,
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function MagnetEditor({ magnet, tabs: initialTabs, hasAI }: Props) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id ?? "");
  const [magnetTitle, setMagnetTitle] = useState(magnet.title);
  const [status, setStatus] = useState<"draft" | "published">(magnet.status);
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Embed editor state (YouTube URL / file URL / HTML code)
  const [embedDraft, setEmbedDraft] = useState<Record<string, string>>({});

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeType = activeTab?.tab_type ?? "blocks";

  const editor = useCreateBlockNote({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: activeTab?.content?.length ? (activeTab.content as any) : undefined,
  });

  useEffect(() => {
    if (!activeTab || activeTab.tab_type !== "blocks") return;
    editor.replaceBlocks(
      editor.document,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activeTab.content?.length ? (activeTab.content as any) : [{ type: "paragraph", content: "" }]
    );
  }, [activeTabId]);

  // Keep embed draft in sync when switching tabs
  useEffect(() => {
    if (!activeTab) return;
    const d = activeTab.embed_data ?? {};
    if (activeTab.tab_type === "youtube") setEmbedDraft(prev => ({ ...prev, [activeTabId]: d.videoId ? `https://youtu.be/${d.videoId}` : "" }));
    if (activeTab.tab_type === "file")    setEmbedDraft(prev => ({ ...prev, [activeTabId]: d.fileUrl ?? "" }));
    if (activeTab.tab_type === "embed")   setEmbedDraft(prev => ({ ...prev, [activeTabId]: d.code ?? "" }));
  }, [activeTabId]);

  const scheduleTabSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const content = editor.document;
      await fetch(`/api/magnets/${magnet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateTab", tabId: activeTabId, content }),
      });
    }, 1500);
  }, [activeTabId, magnet.id, editor]);

  async function changeTabType(tabId: string, tabType: TabType) {
    await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTab", tabId, tabType, embedData: {} }),
    });
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, tab_type: tabType, embed_data: {} } : t));
    setEmbedDraft(prev => ({ ...prev, [tabId]: "" }));
  }

  async function saveEmbedData(tabId: string, tabType: TabType, draft: string) {
    let embedData: EmbedData = {};

    if (tabType === "youtube") {
      const videoId = extractYouTubeId(draft);
      if (!videoId) { toast.error("Paste a valid YouTube URL"); return; }
      embedData = { videoId };
    } else if (tabType === "file") {
      if (!draft.trim()) { toast.error("Paste a file URL"); return; }
      const lower = draft.toLowerCase();
      const fileType = lower.endsWith(".pdf") ? "pdf" : lower.endsWith(".docx") ? "docx" : lower.endsWith(".txt") ? "txt" : "pdf";
      embedData = { fileUrl: draft.trim(), fileType, fileName: draft.split("/").pop() };
    } else if (tabType === "embed") {
      if (!draft.trim()) { toast.error("Paste your embed code"); return; }
      embedData = { code: draft.trim() };
    }

    await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTab", tabId, embedData }),
    });
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, embed_data: embedData } : t));
    toast.success("Saved");
  }

  async function saveMagnet() {
    setSaving(true);
    await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: magnetTitle }),
    });
    setSaving(false);
    toast.success("Saved");
  }

  async function togglePublish() {
    const newStatus = status === "published" ? "draft" : "published";
    const res = await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      toast.success(newStatus === "published" ? "Published!" : "Unpublished");
    }
  }

  async function addTab() {
    const res = await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createTab", title: "New Tab" }),
    });
    if (res.ok) {
      const tab = await res.json();
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tab.id);
    }
  }

  async function deleteTab(tabId: string) {
    if (tabs.length <= 1) { toast.error("Cannot delete the last tab"); return; }
    await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTab", tabId }),
    });
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) setActiveTabId(remaining[0]?.id ?? "");
      return remaining;
    });
  }

  async function renameTab(tabId: string, title: string) {
    await fetch(`/api/magnets/${magnet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTab", tabId, title }),
    });
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, title } : t)));
    setRenamingTabId(null);
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) { toast.error("Enter a topic"); return; }
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, audience: aiAudience }),
      });
      if (!res.ok || !res.body) { toast.error("AI generation failed"); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let payload: { done?: boolean; tabs?: { title: string; content: unknown[] }[]; chunk?: string; error?: string };
          try { payload = JSON.parse(line.slice(6)); } catch { continue; }
          if (payload.done && payload.tabs) {
            const generatedTabs = payload.tabs as { title: string; content: unknown[] }[];
            const updatedTabs: Tab[] = [];
            for (let i = 0; i < generatedTabs.length; i++) {
              const gt = generatedTabs[i];
              if (i < tabs.length) {
                await fetch(`/api/magnets/${magnet.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "updateTab", tabId: tabs[i].id, title: gt.title, content: gt.content }),
                });
                updatedTabs.push({ ...tabs[i], title: gt.title, content: gt.content });
              } else {
                const r = await fetch(`/api/magnets/${magnet.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "createTab", title: gt.title }),
                });
                const newTab = await r.json();
                await fetch(`/api/magnets/${magnet.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "updateTab", tabId: newTab.id, content: gt.content }),
                });
                updatedTabs.push({ ...newTab, content: gt.content });
              }
            }
            setTabs(updatedTabs);
            setActiveTabId(updatedTabs[0]?.id ?? "");
            toast.success("AI content generated!");
            setAiOpen(false);
          }
        }
      }
    } finally {
      setAiGenerating(false);
    }
  }

  const draftValue = embedDraft[activeTabId] ?? "";

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <Input
          value={magnetTitle}
          onChange={e => setMagnetTitle(e.target.value)}
          onBlur={saveMagnet}
          className="text-sm font-semibold border-0 shadow-none focus-visible:ring-0 px-0 max-w-xs h-8"
        />
        <Badge variant={status === "published" ? "default" : "secondary"} className="text-xs">{status}</Badge>
        <div className="flex-1" />
        {hasAI && (
          <Button variant="outline" size="sm" onClick={() => setAiOpen(!aiOpen)} className="text-violet-600 border-violet-200 hover:bg-violet-50">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Generate with AI
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={saveMagnet} disabled={saving}>
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" onClick={togglePublish} className={status === "published" ? "bg-gray-800 hover:bg-gray-700" : "bg-violet-600 hover:bg-violet-700"}>
          {status === "published" ? "Unpublish" : "Publish"}
        </Button>
        {status === "published" && (
          <a href={`/p/${magnet.slug}`} target="_blank" rel="noopener">
            <Button size="sm" variant="outline" className="px-2">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        )}
      </div>

      {/* AI Panel */}
      {aiOpen && (
        <div className="border-b border-gray-200 bg-violet-50 px-6 py-4 shrink-0">
          <p className="text-sm font-semibold text-violet-900 mb-3">Generate with AI</p>
          <div className="flex gap-2">
            <Input placeholder="Topic (e.g. B2B cold email)" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="text-sm" />
            <Input placeholder="Audience (e.g. SDRs at SaaS companies)" value={aiAudience} onChange={e => setAiAudience(e.target.value)} className="text-sm" />
            <Button onClick={generateWithAI} disabled={aiGenerating} className="bg-violet-600 hover:bg-violet-700 shrink-0">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {aiGenerating ? "Generating…" : "Generate"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAiOpen(false)} className="px-2 shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center group">
            {renamingTabId === tab.id ? (
              <input
                className="text-sm px-3 py-1 rounded-md border border-violet-300 bg-white focus:outline-none w-32"
                defaultValue={tab.title}
                autoFocus
                onBlur={e => renameTab(tab.id, e.target.value || tab.title)}
                onKeyDown={e => { if (e.key === "Enter") renameTab(tab.id, e.currentTarget.value || tab.title); if (e.key === "Escape") setRenamingTabId(null); }}
              />
            ) : (
              <button
                onClick={() => setActiveTabId(tab.id)}
                onDoubleClick={() => setRenamingTabId(tab.id)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
                  activeTabId === tab.id
                    ? "bg-white border border-gray-200 text-gray-900 font-medium shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                <span className="text-gray-400">{TAB_TYPE_ICONS[tab.tab_type ?? "blocks"]}</span>
                {tab.title}
                {activeTabId === tab.id && tabs.length > 1 && (
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500 ml-1" onClick={e => { e.stopPropagation(); deleteTab(tab.id); }} />
                )}
              </button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="flex items-center gap-1 text-sm px-2 py-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add tab
        </button>
      </div>

      {/* Tab type selector (shown below tab bar for active tab) */}
      {activeTab && (
        <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-xs text-gray-400">Tab type:</span>
          <Select value={activeType} onValueChange={v => changeTabType(activeTab.id, v as TabType)}>
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blocks">Rich text (BlockNote)</SelectItem>
              <SelectItem value="youtube">YouTube video</SelectItem>
              <SelectItem value="file">File (PDF / DOCX / TXT)</SelectItem>
              <SelectItem value="embed">HTML / iframe / JS embed</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-300">Double-click a tab name to rename it</span>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {activeType === "blocks" && (
          <div className="max-w-3xl mx-auto py-10 px-8">
            <BlockNoteView editor={editor} onChange={scheduleTabSave} theme="light" />
          </div>
        )}

        {activeType === "youtube" && (
          <div className="max-w-3xl mx-auto py-10 px-8">
            <p className="text-sm font-medium text-gray-700 mb-3">YouTube video</p>
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Paste YouTube URL (e.g. https://youtu.be/abc123)"
                value={draftValue}
                onChange={e => setEmbedDraft(prev => ({ ...prev, [activeTabId]: e.target.value }))}
                className="text-sm"
              />
              <Button size="sm" onClick={() => saveEmbedData(activeTabId, "youtube", draftValue)} className="bg-violet-600 hover:bg-violet-700 shrink-0">
                Save
              </Button>
            </div>
            {activeTab?.embed_data?.videoId && (
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src={`https://www.youtube.com/embed/${activeTab.embed_data.videoId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {activeType === "file" && (
          <div className="max-w-3xl mx-auto py-10 px-8">
            <p className="text-sm font-medium text-gray-700 mb-2">File URL</p>
            <p className="text-xs text-gray-400 mb-3">Paste a direct URL to a PDF, DOCX, or TXT file. Upload to Google Drive, Dropbox, or any CDN first.</p>
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="https://example.com/file.pdf"
                value={draftValue}
                onChange={e => setEmbedDraft(prev => ({ ...prev, [activeTabId]: e.target.value }))}
                className="text-sm"
              />
              <Button size="sm" onClick={() => saveEmbedData(activeTabId, "file", draftValue)} className="bg-violet-600 hover:bg-violet-700 shrink-0">
                Save
              </Button>
            </div>
            {activeTab?.embed_data?.fileUrl && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                <span className="font-medium">Linked file:</span>{" "}
                <a href={activeTab.embed_data.fileUrl} target="_blank" rel="noopener" className="text-violet-600 hover:underline">
                  {activeTab.embed_data.fileName ?? activeTab.embed_data.fileUrl}
                </a>
                {" "}
                <span className="text-xs text-gray-400 uppercase">({activeTab.embed_data.fileType})</span>
              </div>
            )}
          </div>
        )}

        {activeType === "embed" && (
          <div className="max-w-3xl mx-auto py-10 px-8">
            <p className="text-sm font-medium text-gray-700 mb-2">HTML / iframe / JS embed</p>
            <p className="text-xs text-gray-400 mb-3">Paste any iframe, script tag, or raw HTML. This renders directly on the public page.</p>
            <Textarea
              placeholder={'<iframe src="https://..." width="100%" height="500"></iframe>'}
              value={draftValue}
              onChange={e => setEmbedDraft(prev => ({ ...prev, [activeTabId]: e.target.value }))}
              className="font-mono text-xs min-h-[160px] mb-3"
            />
            <Button size="sm" onClick={() => saveEmbedData(activeTabId, "embed", draftValue)} className="bg-violet-600 hover:bg-violet-700">
              Save embed
            </Button>
            {activeTab?.embed_data?.code && (
              <div className="mt-6">
                <p className="text-xs text-gray-400 mb-2">Preview</p>
                <div
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: activeTab.embed_data.code }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
