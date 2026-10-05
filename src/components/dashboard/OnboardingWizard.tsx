"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILE_TEMPLATES, TEMPLATE_LIST } from "@/lib/templates/definitions";
import { ProfileTemplate, TemplateId } from "@/lib/templates/types";
import { usePreview } from "./PreviewContext";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Trash2,
  Plus,
  Loader2,
  Mail,
  Palette,
  ExternalLink,
  Zap,
  Download,
} from "lucide-react";
import ProfileImportModal from "./ProfileImportModal";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: (updatedUser: any) => void;
}

export default function OnboardingWizard({
  isOpen,
  onClose,
  user,
  onSuccess,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { updatePreviewUser } = usePreview();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>("creator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2 Customization State
  const [customBio, setCustomBio] = useState("");
  const [customThemeColor, setCustomThemeColor] = useState("");
  const [customButtonStyle, setCustomButtonStyle] = useState<"pill" | "rounded" | "square">("pill");
  const [customEmailCapture, setCustomEmailCapture] = useState({
    enabled: true,
    title: "",
    placeholder: "",
  });

  const [customSocialLinks, setCustomSocialLinks] = useState<
    Array<{ platform: string; url: string; label: string }>
  >([]);

  const [customBusinessLinks, setCustomBusinessLinks] = useState<
    Array<{ title: string; url: string; description: string }>
  >([]);

  const [showImportModal, setShowImportModal] = useState(false);

  if (!isOpen) return null;

  // Initialize customization state when template is selected
  const handleSelectTemplate = (template: ProfileTemplate) => {
    setSelectedTemplateId(template.id);

    if (template.id === "scratch") {
      setCustomBio("");
      setCustomThemeColor("#6366f1");
      setCustomButtonStyle("pill");
      setCustomSocialLinks([]);
      setCustomBusinessLinks([]);
      setCustomEmailCapture({
        enabled: false,
        title: "Subscribe to my newsletter",
        placeholder: "Enter your email",
      });
      return;
    }

    setCustomBio(template.bioScaffolding);
    setCustomThemeColor(template.theme.primaryColor);
    setCustomButtonStyle(template.theme.buttonStyle);
    setCustomEmailCapture({
      enabled: template.emailCapture.enabled,
      title: template.emailCapture.title,
      placeholder: template.emailCapture.placeholder,
    });

    setCustomSocialLinks(
      template.suggestedSocial.map((s) => ({
        platform: s.platform,
        url: s.urlPrefix,
        label: s.label,
      }))
    );

    setCustomBusinessLinks(
      template.suggestedBusinessLinks.map((b) => ({
        title: b.title,
        url: b.defaultUrl,
        description: b.description,
      }))
    );

    // Live update preview
    updatePreviewUser({
      bio: template.bioScaffolding,
      theme: {
        primaryColor: template.theme.primaryColor,
        buttonStyle: template.theme.buttonStyle,
        backgroundColor: "var(--background)",
        fontFamily: template.theme.fontFamily,
      },
    });
  };

  const handleNextToCustomize = () => {
    if (selectedTemplateId === "scratch") {
      handleCompleteScratch();
      return;
    }

    const t = PROFILE_TEMPLATES[selectedTemplateId];
    if (t && customBio === "") {
      handleSelectTemplate(t);
    }
    setCurrentStep(2);
  };

  const handleCompleteScratch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip", templateId: "scratch" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start from scratch");
      }
      if (onSuccess) onSuccess(data.user);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        action: "apply",
        templateId: selectedTemplateId,
        bio: customBio,
        themePrimaryColor: customThemeColor,
        themeButtonStyle: customButtonStyle,
        emailCaptureEnabled: customEmailCapture.enabled,
        emailCaptureTitle: customEmailCapture.title,
        emailCapturePlaceholder: customEmailCapture.placeholder,
        socialLinks: customSocialLinks.filter((s) => s.url && s.url.trim().length > 0),
        businessLinks: customBusinessLinks.filter((b) => b.title && b.title.trim().length > 0),
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to configure template");
      }

      setCurrentStep(3);
      if (onSuccess) onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong applying the template");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip", templateId: "scratch" }),
      });
      onClose();
      router.refresh();
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = PROFILE_TEMPLATES[selectedTemplateId] || PROFILE_TEMPLATES.creator;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Top Header & Progress */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Setup Your Linkle Profile
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose a pre-configured template or customize sensible defaults
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-400 mr-2">
              <span
                className={`px-2.5 py-1 rounded-full ${
                  currentStep === 1
                    ? "bg-purple-600 text-white font-semibold"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                1. Role
              </span>
              <span className="text-gray-300 dark:text-zinc-700">→</span>
              <span
                className={`px-2.5 py-1 rounded-full ${
                  currentStep === 2
                    ? "bg-purple-600 text-white font-semibold"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                2. Personalize
              </span>
              <span className="text-gray-300 dark:text-zinc-700">→</span>
              <span
                className={`px-2.5 py-1 rounded-full ${
                  currentStep === 3
                    ? "bg-green-600 text-white font-semibold"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                3. Ready
              </span>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Skip for now
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= STEP 1: CHOOSE TEMPLATE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  What best describes you?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  We will configure suggested links, colors, and layout sections tailored to your craft. You can customize or remove every single item.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {TEMPLATE_LIST.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  const isScratch = template.id === "scratch";

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between group ${
                        isSelected
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-500/20"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                            {template.icon}
                          </span>
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div
                              className="w-3 h-3 rounded-full opacity-60"
                              style={{ backgroundColor: template.badgeColor }}
                            />
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
                            {template.name}
                          </h4>
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 line-clamp-1">
                            {template.tagline}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          {isScratch
                            ? "Empty canvas"
                            : `${template.suggestedBusinessLinks.length} CTAs + ${template.suggestedSocial.length} socials`}
                        </span>
                        <span className="font-semibold text-purple-500 group-hover:translate-x-0.5 transition-transform">
                          {isSelected ? "Selected" : "Choose"} →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 2: PERSONALIZE TEMPLATE ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Customize Your {selectedTemplate.name} Template
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Personalize these sensible defaults before applying. You can modify them anytime in the dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: customThemeColor }}
                  />
                  <span className="text-xs font-mono text-gray-400 uppercase">
                    {customThemeColor}
                  </span>
                </div>
              </div>

              {/* Bio Scaffolding */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Profile Bio Scaffolding
                </label>
                <textarea
                  rows={2}
                  value={customBio}
                  onChange={(e) => {
                    setCustomBio(e.target.value);
                    updatePreviewUser({ bio: e.target.value });
                  }}
                  placeholder="Enter a short bio..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <p className="text-[11px] text-gray-400">
                  A starter headline explaining your craft to profile visitors.
                </p>
              </div>

              {/* Suggested Social Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Suggested Social Channels ({customSocialLinks.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> Quick Import URLs
                  </button>
                </div>

                <div className="space-y-2">
                  {customSocialLinks.map((social, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <span className="w-20 text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                        {social.platform}
                      </span>
                      <input
                        type="text"
                        value={social.url}
                        onChange={(e) => {
                          const updated = [...customSocialLinks];
                          updated[idx].url = e.target.value;
                          setCustomSocialLinks(updated);
                        }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSocialLinks(customSocialLinks.filter((_, i) => i !== idx));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                        title="Remove channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {customSocialLinks.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No social links configured.</p>
                  )}
                </div>
              </div>

              {/* Suggested CTAs / Business Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Suggested Action Links & CTAs ({customBusinessLinks.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBusinessLinks([
                        ...customBusinessLinks,
                        { title: "New Link", url: "https://", description: "" },
                      ]);
                    }}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {customBusinessLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const updated = [...customBusinessLinks];
                            updated[idx].title = e.target.value;
                            setCustomBusinessLinks(updated);
                          }}
                          placeholder="Link Title (e.g. Portfolio)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-medium text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomBusinessLinks(
                              customBusinessLinks.filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                          title="Remove CTA"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...customBusinessLinks];
                            updated[idx].url = e.target.value;
                            setCustomBusinessLinks(updated);
                          }}
                          placeholder="Destination URL (https://...)"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-600 dark:text-gray-300"
                        />
                        <input
                          type="text"
                          value={link.description}
                          onChange={(e) => {
                            const updated = [...customBusinessLinks];
                            updated[idx].description = e.target.value;
                            setCustomBusinessLinks(updated);
                          }}
                          placeholder="Subtitle / Description (optional)"
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-400"
                        />
                      </div>
                    </div>
                  ))}
                  {customBusinessLinks.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No business links configured.</p>
                  )}
                </div>
              </div>

              {/* Email Capture & Theme Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-500" /> Email Capture
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customEmailCapture.enabled}
                        onChange={(e) =>
                          setCustomEmailCapture({
                            ...customEmailCapture,
                            enabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  {customEmailCapture.enabled && (
                    <input
                      type="text"
                      value={customEmailCapture.title}
                      onChange={(e) =>
                        setCustomEmailCapture({
                          ...customEmailCapture,
                          title: e.target.value,
                        })
                      }
                      placeholder="Newsletter Heading"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  )}
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-500" /> Theme Styling
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customThemeColor}
                      onChange={(e) => {
                        setCustomThemeColor(e.target.value);
                        updatePreviewUser({
                          theme: {
                            primaryColor: e.target.value,
                            buttonStyle: customButtonStyle,
                            backgroundColor: "var(--background)",
                            fontFamily: "Inter",
                          },
                        });
                      }}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <select
                      value={customButtonStyle}
                      onChange={(e) => {
                        const style = e.target.value as any;
                        setCustomButtonStyle(style);
                        updatePreviewUser({
                          theme: {
                            primaryColor: customThemeColor,
                            buttonStyle: style,
                            backgroundColor: "var(--background)",
                            fontFamily: "Inter",
                          },
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs flex-1"
                    >
                      <option value="pill">Pill Buttons</option>
                      <option value="rounded">Rounded Buttons</option>
                      <option value="square">Square Buttons</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: ALL READY ================= */}
          {currentStep === 3 && (
            <div className="py-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile Template Ready!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your Linkle has been configured with the{" "}
                  <strong className="text-purple-600 dark:text-purple-400">
                    {selectedTemplate.name}
                  </strong>{" "}
                  sensible defaults.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-left text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>Profile bio scaffolding applied</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>
                    {customSocialLinks.length} social link channels initialized
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>
                    {customBusinessLinks.length} CTA business links created
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span>Live theme palette synchronized</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.refresh();
                }}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/25"
              >
                Open Dashboard & Manage Links
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {currentStep !== 3 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Roles
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteScratch}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Zap className="w-3.5 h-3.5" /> Start from scratch
              </button>
            )}

            <div className="flex items-center gap-2">
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextToCustomize}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25"
                >
                  {selectedTemplateId === "scratch" ? (
                    "Launch Blank Profile"
                  ) : (
                    <>
                      Personalize Defaults <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyTemplate}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...
                    </>
                  ) : (
                    <>
                      Apply & Launch <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Profile Import Modal */}
        <ProfileImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
