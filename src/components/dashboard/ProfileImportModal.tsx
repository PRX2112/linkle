"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  X,
  Check,
  AlertCircle,
  Copy,
  Trash2,
  Loader2,
  ExternalLink,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { SuggestedLink, ImportParseResult } from "@/lib/importer/types";

interface ProfileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  youtube: <Youtube className="w-4 h-4 text-red-500" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-500" />,
  github: <Github className="w-4 h-4 text-gray-700 dark:text-gray-300" />,
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
  website: <Globe className="w-4 h-4 text-emerald-500" />,
};

const SAMPLE_TEMPLATES = [
  "https://instagram.com/",
  "https://x.com/",
  "https://github.com/",
  "https://linkedin.com/in/",
  "https://youtube.com/@",
];

export default function ProfileImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ProfileImportModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "review">("input");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedLink[]>([]);
  const [stats, setStats] = useState<{
    totalInput: number;
    validCount: number;
    duplicateCount: number;
    unsupportedCount: number;
  }>({ totalInput: 0, validCount: 0, duplicateCount: 0, unsupportedCount: 0 });

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) {
      setError("Please paste at least one profile URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/links/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parse", rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze URLs");
      }

      const result: ImportParseResult = data.result;
      setSuggestions(result.suggestions);
      setStats({
        totalInput: result.totalInput,
        validCount: result.validCount,
        duplicateCount: result.duplicateCount,
        unsupportedCount: result.unsupportedCount,
      });

      setStep("review");
    } catch (err: any) {
      setError(err.message || "Something went wrong parsing URLs");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const updateLabel = (id: string, newLabel: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, suggestedLabel: newLabel } : s))
    );
  };

  const removeSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const selectedItems = suggestions.filter((s) => s.selected && s.isValid);

  const handleCommit = async () => {
    if (selectedItems.length === 0) {
      setError("No valid links selected for import");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const itemsToCommit = selectedItems.map((s) => ({
        entryType: s.entryType,
        platform: s.platform,
        url: s.normalizedUrl,
        label: s.suggestedLabel,
        title: s.suggestedLabel,
      }));

      const res = await fetch("/api/links/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          items: itemsToCommit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import links");
      }

      if (onSuccess) onSuccess();
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save imported links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Import Existing Profiles
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste your social profiles and Linkle will normalize and suggest links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ================= STEP 1: INPUT ================= */}
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                  Paste Profile or Website URLs (one per line)
                </label>
                <textarea
                  rows={7}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`https://instagram.com/yourhandle\nhttps://github.com/yourhandle\nhttps://x.com/yourhandle\nhttps://linkedin.com/in/yourhandle\nhttps://youtube.com/@yourchannel\nhttps://yourportfolio.dev`}
                  className="w-full p-3.5 font-mono text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all leading-relaxed"
                />
              </div>

              {/* Supported Platforms Info & Quick Starters */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase text-gray-400">
                  Supported Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Instagram", icon: <Instagram className="w-3 h-3 text-pink-500" /> },
                    { name: "YouTube", icon: <Youtube className="w-3 h-3 text-red-500" /> },
                    { name: "LinkedIn", icon: <Linkedin className="w-3 h-3 text-blue-500" /> },
                    { name: "GitHub", icon: <Github className="w-3 h-3" /> },
                    { name: "X / Twitter", icon: <Twitter className="w-3 h-3 text-sky-400" /> },
                    { name: "Personal Website", icon: <Globe className="w-3 h-3 text-emerald-500" /> },
                  ].map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700"
                    >
                      {p.icon}
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Safety guarantee */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <p className="font-semibold">Privacy-Preserving & Safe</p>
                  <p className="text-purple-600/80 dark:text-purple-400/80">
                    We never scrape private data or scrape platforms. Links are extracted purely from the URLs provided. Nothing is saved until you confirm.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: REVIEW & CONFIRM ================= */}
          {step === "review" && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {suggestions.length} Links Processed
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {stats.validCount} Ready
                  </span>
                  {stats.duplicateCount > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {stats.duplicateCount} Duplicates
                      </span>
                    </>
                  )}
                  {stats.unsupportedCount > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-red-500 font-medium">
                        {stats.unsupportedCount} Invalid
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Edit URLs
                </button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.selected
                        ? "border-purple-300 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/10 shadow-sm"
                        : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        disabled={!item.isValid || item.isDuplicate}
                        className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                      />

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        {PLATFORM_ICONS[item.platform] || <Globe className="w-4 h-4" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.suggestedLabel}
                            onChange={(e) => updateLabel(item.id, e.target.value)}
                            disabled={!item.isValid}
                            className="text-xs font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-purple-500 focus:outline-none px-1 py-0.5 w-full"
                          />

                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 shrink-0">
                            {item.entryType}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                          {item.normalizedUrl}
                        </p>

                        {/* Status Message */}
                        {item.isDuplicate && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            {item.duplicateReason || "Duplicate detected"}
                          </p>
                        )}

                        {!item.isValid && (
                          <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            {item.errorMessage || "Invalid or unsupported URL"}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeSuggestion(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                        title="Remove suggestion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {step === "input" ? (
              <button
                type="button"
                onClick={handleParse}
                disabled={loading || !rawText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    Review Suggestions <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCommit}
                disabled={loading || selectedItems.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Links...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Confirm & Import ({selectedItems.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
