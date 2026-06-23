"use client";

import { useState, useEffect } from "react";
import { usePreview } from "./PreviewContext";
import { Check, Palette, Type, Layout, MapPin, ChevronDown } from "lucide-react";

interface User {
  id: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  themePrimaryColor: string;
  themeButtonStyle: string;
  locationAddress?: string | null;
  locationGoogleMapsEmbedUrl?: string | null;
  locationIsVisible: boolean;
}

// --- THEME PRESETS ---
const THEMES = [
  {
    id: "indigo",
    name: "Indigo",
    color: "#6366f1",
    gradient: "from-indigo-500 to-purple-600",
    preview: "bg-gradient-to-br from-indigo-500 to-purple-600",
  },
  {
    id: "rose",
    name: "Rose",
    color: "#f43f5e",
    gradient: "from-rose-500 to-pink-600",
    preview: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
  {
    id: "amber",
    name: "Amber",
    color: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    preview: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: "emerald",
    name: "Emerald",
    color: "#10b981",
    gradient: "from-emerald-400 to-teal-500",
    preview: "bg-gradient-to-br from-emerald-400 to-teal-500",
  },
  {
    id: "sky",
    name: "Sky",
    color: "#0ea5e9",
    gradient: "from-sky-400 to-blue-500",
    preview: "bg-gradient-to-br from-sky-400 to-blue-500",
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    color: "#d946ef",
    gradient: "from-fuchsia-500 to-pink-500",
    preview: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  },
  {
    id: "cyan",
    name: "Cyan",
    color: "#06b6d4",
    gradient: "from-cyan-400 to-sky-500",
    preview: "bg-gradient-to-br from-cyan-400 to-sky-500",
  },
  {
    id: "neutral",
    name: "Minimal",
    color: "#737373",
    gradient: "from-neutral-500 to-stone-600",
    preview: "bg-gradient-to-br from-neutral-500 to-stone-600",
  },
];

// --- BUTTON STYLES ---
const BUTTON_STYLES = [
  {
    id: "pill",
    name: "Pill",
    description: "Fully rounded corners",
    preview: "rounded-full",
  },
  {
    id: "rounded",
    name: "Rounded",
    description: "Softly rounded corners",
    preview: "rounded-xl",
  },
  {
    id: "square",
    name: "Square",
    description: "Sharp corners",
    preview: "rounded-none",
  },
  {
    id: "outline",
    name: "Outline",
    description: "Border only, no fill",
    preview: "rounded-xl border-2",
  },
];

// --- FONTS ---
const FONTS = [
  { id: "Inter", label: "Inter (Default)" },
  { id: "Poppins", label: "Poppins" },
  { id: "DM Sans", label: "DM Sans" },
  { id: "Space Grotesk", label: "Space Grotesk" },
  { id: "Syne", label: "Syne" },
  { id: "Playfair Display", label: "Playfair Display" },
  { id: "Roboto Mono", label: "Roboto Mono" },
];

export default function AppearanceForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    displayName: user.displayName ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    bannerUrl: user.bannerUrl ?? "",
    themePrimaryColor: user.themePrimaryColor ?? "#6366f1",
    themeButtonStyle: user.themeButtonStyle ?? "pill",
    themeFontFamily: "Inter",
    locationAddress: user.locationAddress ?? "",
    locationGoogleMapsEmbedUrl: user.locationGoogleMapsEmbedUrl ?? "",
    locationIsVisible: user.locationIsVisible ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { updatePreviewUser } = usePreview();
  const [activeSection, setActiveSection] = useState<"profile" | "theme" | "buttons" | "fonts" | "location">("profile");

  useEffect(() => {
    updatePreviewUser(form);
  }, [form, updatePreviewUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
    }
    setSaving(false);
  };

  const navItems = [
    { id: "profile", label: "Profile", icon: Layout },
    { id: "theme", label: "Color Theme", icon: Palette },
    { id: "buttons", label: "Button Style", icon: Layout },
    { id: "fonts", label: "Typography", icon: Type },
    { id: "location", label: "Location", icon: MapPin },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Appearance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Customize how your Linkle profile looks</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 shadow-glow text-sm">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {success && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-xs"><Check className="w-3 h-3" /></span>
          Profile saved successfully!
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Responsive Tab Navigation */}
        <nav className="w-full md:w-44 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar flex-nowrap pb-2 md:pb-0">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === id
                  ? "gradient-bg text-white shadow-glow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">

          {/* Profile Info Section */}
          {activeSection === "profile" && (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Info</h2>
              </div>

              {form.avatarUrl && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40 shrink-0">
                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{form.displayName || "Your Name"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{form.bio || "Your bio here"}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                <input name="displayName" value={form.displayName} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
                <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner URL <span className="text-gray-400">(optional)</span></label>
                <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              </div>
            </section>
          )}

          {/* Color Theme Section */}
          {activeSection === "theme" && (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Color Theme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">Choose a preset or pick a custom accent color.</p>

              {/* Theme Presets */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Presets</label>
                <div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-4 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setForm(p => ({ ...p, themePrimaryColor: theme.color }))}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                        form.themePrimaryColor === theme.color
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                          : "border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${theme.preview} shadow-md relative`}>
                        {form.themePrimaryColor === theme.color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Accent Color</label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md" style={{ backgroundColor: form.themePrimaryColor }} />
                    <input
                      type="color"
                      value={form.themePrimaryColor}
                      onChange={(e) => setForm(p => ({ ...p, themePrimaryColor: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl"
                      title="Pick a custom color"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Custom Color</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{form.themePrimaryColor.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setForm(p => ({ ...p, themePrimaryColor: "#6366f1" }))}
                    className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Live Preview Swatch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Button Preview</label>
                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center gap-3">
                  <button
                    className="px-6 py-2.5 rounded-full text-white text-sm font-semibold shadow-md transition-all"
                    style={{ backgroundColor: form.themePrimaryColor }}
                  >
                    Follow
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-full text-sm font-semibold border-2 transition-all"
                    style={{ borderColor: form.themePrimaryColor, color: form.themePrimaryColor }}
                  >
                    Message
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Button Style Section */}
          {activeSection === "buttons" && (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Button Style</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how your link buttons look on your profile page.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {BUTTON_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setForm(p => ({ ...p, themeButtonStyle: style.id }))}
                    className={`group relative p-4 rounded-2xl border-2 transition-all text-left ${
                      form.themeButtonStyle === style.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                        : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700"
                    }`}
                  >
                    {form.themeButtonStyle === style.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Style preview */}
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className={`h-8 px-4 text-xs font-semibold flex items-center text-white ${style.preview}`}
                        style={{ backgroundColor: form.themePrimaryColor }}
                      >
                        My Link
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{style.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{style.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Typography Section */}
          {activeSection === "fonts" && (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Typography</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a font family for your profile page.</p>
              </div>

              <div className="space-y-3">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setForm(p => ({ ...p, themeFontFamily: font.id }))}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      form.themeFontFamily === font.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10"
                        : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {form.themeFontFamily === font.id ? (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-zinc-600 shrink-0" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: font.id }}>{font.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" style={{ fontFamily: font.id }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Location Section */}
          {activeSection === "location" && (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Show your studio, office or city on your profile.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <input name="locationAddress" value={form.locationAddress} onChange={handleChange} placeholder="123 Studio, City"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Google Maps Embed URL</label>
                <input name="locationGoogleMapsEmbedUrl" value={form.locationGoogleMapsEmbedUrl} onChange={handleChange} placeholder="https://www.google.com/maps/embed?..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                <button
                  onClick={() => setForm(p => ({ ...p, locationIsVisible: !p.locationIsVisible }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${form.locationIsVisible ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.locationIsVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Show location on profile</p>
                  <p className="text-xs text-gray-400">{form.locationIsVisible ? "Visible to visitors" : "Hidden from visitors"}</p>
                </div>
              </label>
            </section>
          )}

          {/* Sticky Save */}
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 shadow-glow">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
