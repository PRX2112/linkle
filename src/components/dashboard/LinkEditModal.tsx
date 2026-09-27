"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface SocialLink { id: string; platform: string; url: string; label?: string | null; isVisible: boolean; order: number; userId: string; startDate?: Date | string | null; endDate?: Date | string | null; }
interface BusinessLink { id: string; title: string; url: string; description?: string | null; thumbnailUrl?: string | null; isVisible: boolean; order: number; userId: string; startDate?: Date | string | null; endDate?: Date | string | null; }
interface PaymentLink { id: string; platform: string; value: string; isVisible: boolean; order: number; userId: string; startDate?: Date | string | null; endDate?: Date | string | null; }

type LinkItem = 
  | { type: "social"; data: SocialLink }
  | { type: "business"; data: BusinessLink }
  | { type: "payment"; data: PaymentLink };

const platformBaseUrls: Record<string, { prefix: string; placeholder: string }> = {
  instagram: { prefix: "https://instagram.com/", placeholder: "username" },
  twitter: { prefix: "https://x.com/", placeholder: "username" },
  linkedin: { prefix: "https://linkedin.com/in/", placeholder: "username" },
  youtube: { prefix: "https://youtube.com/@", placeholder: "channel" },
  github: { prefix: "https://github.com/", placeholder: "username" },
  email: { prefix: "mailto:", placeholder: "you@example.com" },
  phone: { prefix: "tel:", placeholder: "+1234567890" },
  whatsapp: { prefix: "https://wa.me/", placeholder: "1234567890" },
  website: { prefix: "https://", placeholder: "yoursite.com" },
};

const paymentBaseUrls: Record<string, { prefix: string; placeholder: string }> = {
  upi: { prefix: "", placeholder: "username@bank (UPI ID)" },
  paypal: { prefix: "https://paypal.me/", placeholder: "username" },
  stripe: { prefix: "https://buy.stripe.com/", placeholder: "payment-link-id" },
  paytm: { prefix: "", placeholder: "UPI ID or Phone Number" },
  phonepe: { prefix: "", placeholder: "UPI ID or Phone Number" },
  googlepay: { prefix: "", placeholder: "UPI ID" },
  crypto: { prefix: "", placeholder: "Wallet Address" },
};

const getInitialHandle = (urlOrValue: string, platform: string, baseUrls: Record<string, { prefix: string }>) => {
  const base = baseUrls[platform];
  if (base && base.prefix && urlOrValue.startsWith(base.prefix)) {
    return urlOrValue.slice(base.prefix.length);
  }
  return urlOrValue;
};

interface LinkEditModalProps {
  item: LinkItem;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export default function LinkEditModal({ item, onClose, onSave }: LinkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatInitialDate = (dateVal: any) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      // Format to YYYY-MM-DDTHH:MM (required for datetime-local value)
      const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return "";
    }
  };

  // States based on link type
  const [socialForm, setSocialForm] = useState({
    platform: item.type === "social" ? item.data.platform : "",
    handle: item.type === "social" ? getInitialHandle(item.data.url, item.data.platform, platformBaseUrls) : "",
    label: item.type === "social" ? item.data.label || "" : "",
    startDate: item.type === "social" ? formatInitialDate(item.data.startDate) : "",
    endDate: item.type === "social" ? formatInitialDate(item.data.endDate) : "",
  });

  const [businessForm, setBusinessForm] = useState({
    title: item.type === "business" ? item.data.title : "",
    url: item.type === "business" ? item.data.url : "",
    description: item.type === "business" ? item.data.description || "" : "",
    thumbnailUrl: item.type === "business" ? item.data.thumbnailUrl || "" : "",
    startDate: item.type === "business" ? formatInitialDate(item.data.startDate) : "",
    endDate: item.type === "business" ? formatInitialDate(item.data.endDate) : "",
  });


  const [paymentForm, setPaymentForm] = useState({
    platform: item.type === "payment" ? item.data.platform : "",
    handle: item.type === "payment" ? getInitialHandle(item.data.value, item.data.platform, paymentBaseUrls) : "",
    startDate: item.type === "payment" ? formatInitialDate(item.data.startDate) : "",
    endDate: item.type === "payment" ? formatInitialDate(item.data.endDate) : "",
  });

  const formatIsoForSubmit = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === "") return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let body = {};
    let endpoint = "";

    if (item.type === "social") {
      const base = platformBaseUrls[socialForm.platform];
      const fullUrl = base ? base.prefix + socialForm.handle : socialForm.handle;
      body = {
        platform: socialForm.platform,
        url: fullUrl,
        label: socialForm.label,
        startDate: formatIsoForSubmit(socialForm.startDate),
        endDate: formatIsoForSubmit(socialForm.endDate),
      };
      endpoint = `/api/links/social/${item.data.id}`;
    } else if (item.type === "business") {
      body = {
        ...businessForm,
        startDate: formatIsoForSubmit(businessForm.startDate),
        endDate: formatIsoForSubmit(businessForm.endDate),
      };
      endpoint = `/api/links/business/${item.data.id}`;
    } else if (item.type === "payment") {
      const base = paymentBaseUrls[paymentForm.platform];
      const fullValue = base ? base.prefix + paymentForm.handle : paymentForm.handle;
      body = {
        platform: paymentForm.platform,
        value: fullValue,
        startDate: formatIsoForSubmit(paymentForm.startDate),
        endDate: formatIsoForSubmit(paymentForm.endDate),
      };
      endpoint = `/api/links/payment/${item.data.id}`;
    }

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update link");
      }

      const updatedLink = await res.json();
      onSave(updatedLink);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">Edit Link</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your link details and schedule visibility window.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {item.type === "social" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform</label>
                <select
                  value={socialForm.platform}
                  onChange={(e) => setSocialForm(prev => ({ ...prev, platform: e.target.value, handle: "" }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                >
                  {["instagram", "twitter", "linkedin", "youtube", "github", "email", "phone", "whatsapp", "website"].map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username / Handle</label>
                <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 transition-all">
                  {platformBaseUrls[socialForm.platform]?.prefix && (
                    <span className="flex items-center px-3 py-2 sm:py-0 bg-gray-100 dark:bg-zinc-800 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-700 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
                      {platformBaseUrls[socialForm.platform].prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    required
                    value={socialForm.handle}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder={platformBaseUrls[socialForm.platform]?.placeholder || "handle"}
                    className="flex-1 px-3 py-3 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none min-w-0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={socialForm.label}
                  onChange={(e) => setSocialForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Follow me"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-900 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
            </>
          )}

          {item.type === "business" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={businessForm.title}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. My Website"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL</label>
                <input
                  type="text"
                  required
                  value={businessForm.url}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://yourlink.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell your audience about this link..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none"
                />
              </div>
              <div>
                <ImageUpload
                  label="Thumbnail Image (Optional)"
                  helperText="Upload or update the thumbnail image for this link card. Auto-compressed before upload."
                  value={businessForm.thumbnailUrl}
                  onChange={(url) => setBusinessForm(prev => ({ ...prev, thumbnailUrl: url }))}
                  aspectRatio="thumbnail"
                  folder="thumbnails"
                  maxWidth={600}
                  maxHeight={600}
                />
              </div>
            </>
          )}

          {item.type === "payment" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Platform</label>
                <select
                  value={paymentForm.platform}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, platform: e.target.value, handle: "" }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                >
                  {["upi", "paypal", "stripe", "paytm", "phonepe", "googlepay", "crypto"].map((p) => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Handle / ID</label>
                <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 transition-all">
                  {paymentBaseUrls[paymentForm.platform]?.prefix && (
                    <span className="flex items-center px-3 py-2 sm:py-0 bg-gray-100 dark:bg-zinc-800 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-700 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
                      {paymentBaseUrls[paymentForm.platform].prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    required
                    value={paymentForm.handle}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder={paymentBaseUrls[paymentForm.platform]?.placeholder || "handle"}
                    className="flex-1 px-3 py-3 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none min-w-0"
                  />
                </div>
              </div>
            </>
          )}

          {/* Scheduling Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500" />
              Schedule Visibility (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={
                    item.type === "social" ? socialForm.startDate :
                    item.type === "business" ? businessForm.startDate :
                    paymentForm.startDate
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (item.type === "social") setSocialForm(prev => ({ ...prev, startDate: val }));
                    else if (item.type === "business") setBusinessForm(prev => ({ ...prev, startDate: val }));
                    else setPaymentForm(prev => ({ ...prev, startDate: val }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={
                    item.type === "social" ? socialForm.endDate :
                    item.type === "business" ? businessForm.endDate :
                    paymentForm.endDate
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (item.type === "social") setSocialForm(prev => ({ ...prev, endDate: val }));
                    else if (item.type === "business") setBusinessForm(prev => ({ ...prev, endDate: val }));
                    else setPaymentForm(prev => ({ ...prev, endDate: val }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              Leave dates blank to keep the link visible indefinitely.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-glow"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
