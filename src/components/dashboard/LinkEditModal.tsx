"use client";

import { useState } from "react";
import {
  Calendar,
  Tag,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import { buildUtmUrl } from "@/lib/utm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import {
  FormField,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
} from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string | null;
  isVisible: boolean;
  order: number;
  userId: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  utmEnabled?: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

interface BusinessLink {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  isVisible: boolean;
  order: number;
  userId: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  utmEnabled?: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

interface PaymentLink {
  id: string;
  platform: string;
  value: string;
  isVisible: boolean;
  order: number;
  userId: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

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

const getInitialHandle = (
  urlOrValue: string,
  platform: string,
  baseUrls: Record<string, { prefix: string }>
) => {
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

export default function LinkEditModal({
  item,
  onClose,
  onSave,
}: LinkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"details" | "appearance" | "schedule">("details");

  const formatInitialDate = (dateVal: any) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const [socialForm, setSocialForm] = useState({
    platform: item.type === "social" ? item.data.platform : "",
    handle:
      item.type === "social"
        ? getInitialHandle(item.data.url, item.data.platform, platformBaseUrls)
        : "",
    label: item.type === "social" ? item.data.label || "" : "",
    startDate:
      item.type === "social" ? formatInitialDate(item.data.startDate) : "",
    endDate: item.type === "social" ? formatInitialDate(item.data.endDate) : "",
  });

  const [businessForm, setBusinessForm] = useState({
    title: item.type === "business" ? item.data.title : "",
    url: item.type === "business" ? item.data.url : "",
    description: item.type === "business" ? item.data.description || "" : "",
    thumbnailUrl:
      item.type === "business" ? item.data.thumbnailUrl || "" : "",
    startDate:
      item.type === "business" ? formatInitialDate(item.data.startDate) : "",
    endDate:
      item.type === "business" ? formatInitialDate(item.data.endDate) : "",
  });

  const [paymentForm, setPaymentForm] = useState({
    platform: item.type === "payment" ? item.data.platform : "",
    handle:
      item.type === "payment"
        ? getInitialHandle(item.data.value, item.data.platform, paymentBaseUrls)
        : "",
    startDate:
      item.type === "payment" ? formatInitialDate(item.data.startDate) : "",
    endDate:
      item.type === "payment" ? formatInitialDate(item.data.endDate) : "",
  });

  const isUtmSupported = item.type === "business" || item.type === "social";
  const [utmForm, setUtmForm] = useState({
    utmEnabled: isUtmSupported ? Boolean((item.data as any).utmEnabled) : false,
    utmSource: isUtmSupported ? (item.data as any).utmSource || "" : "",
    utmMedium: isUtmSupported ? (item.data as any).utmMedium || "" : "",
    utmCampaign: isUtmSupported ? (item.data as any).utmCampaign || "" : "",
    utmContent: isUtmSupported ? (item.data as any).utmContent || "" : "",
    utmTerm: isUtmSupported ? (item.data as any).utmTerm || "" : "",
  });

  const currentBaseUrl = (() => {
    if (item.type === "social") {
      const base = platformBaseUrls[socialForm.platform];
      return base ? base.prefix + socialForm.handle : socialForm.handle;
    }
    if (item.type === "business") {
      return businessForm.url;
    }
    return "";
  })();

  const previewResult = buildUtmUrl(currentBaseUrl, utmForm);

  const formatIsoForSubmit = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === "") return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  };

  const validateUrl = (url: string) => {
    const trimmed = url.trim().toLowerCase();
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("vbscript:")
    ) {
      return "Dangerous URL schemes are not permitted.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (item.type === "business") {
      const schemeError = validateUrl(businessForm.url);
      if (schemeError) {
        setError(schemeError);
        return;
      }
    }

    setLoading(true);

    let body = {};
    let endpoint = "";

    if (item.type === "social") {
      const base = platformBaseUrls[socialForm.platform];
      const fullUrl = base ? base.prefix + socialForm.handle : socialForm.handle;
      const schemeError = validateUrl(fullUrl);
      if (schemeError) {
        setError(schemeError);
        return;
      }
      body = {
        platform: socialForm.platform,
        url: fullUrl,
        label: socialForm.label,
        startDate: formatIsoForSubmit(socialForm.startDate),
        endDate: formatIsoForSubmit(socialForm.endDate),
        utmEnabled: utmForm.utmEnabled,
        utmSource: utmForm.utmSource ? utmForm.utmSource.trim() : null,
        utmMedium: utmForm.utmMedium ? utmForm.utmMedium.trim() : null,
        utmCampaign: utmForm.utmCampaign ? utmForm.utmCampaign.trim() : null,
        utmContent: utmForm.utmContent ? utmForm.utmContent.trim() : null,
        utmTerm: utmForm.utmTerm ? utmForm.utmTerm.trim() : null,
      };
      endpoint = `/api/links/social/${item.data.id}`;
    } else if (item.type === "business") {
      body = {
        ...businessForm,
        startDate: formatIsoForSubmit(businessForm.startDate),
        endDate: formatIsoForSubmit(businessForm.endDate),
        utmEnabled: utmForm.utmEnabled,
        utmSource: utmForm.utmSource ? utmForm.utmSource.trim() : null,
        utmMedium: utmForm.utmMedium ? utmForm.utmMedium.trim() : null,
        utmCampaign: utmForm.utmCampaign ? utmForm.utmCampaign.trim() : null,
        utmContent: utmForm.utmContent ? utmForm.utmContent.trim() : null,
        utmTerm: utmForm.utmTerm ? utmForm.utmTerm.trim() : null,
      };
      endpoint = `/api/links/business/${item.data.id}`;
    } else if (item.type === "payment") {
      const base = paymentBaseUrls[paymentForm.platform];
      const fullValue = base
        ? base.prefix + paymentForm.handle
        : paymentForm.handle;
      const schemeError = validateUrl(fullValue);
      if (schemeError) {
        setError(schemeError);
        return;
      }
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
    <Modal
      isOpen={true}
      onClose={onClose}
      size="md"
      title="Edit Link Details"
      description="Update link destination, appearance, schedule, and UTM tracking."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection("details")}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
              activeSection === "details"
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
            }`}
          >
            Details
          </button>

          {item.type === "business" && (
            <button
              type="button"
              onClick={() => setActiveSection("appearance")}
              className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                activeSection === "appearance"
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
              }`}
            >
              Appearance
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSection("schedule")}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
              activeSection === "schedule"
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
            }`}
          >
            Schedule & UTM
          </button>
        </div>

        {/* Section 1: Details */}
        {activeSection === "details" && (
          <div className="space-y-4 pt-1">
            {item.type === "social" && (
              <>
                <FormField>
                  <FormLabel required>Platform</FormLabel>
                  <Select
                    value={socialForm.platform}
                    onChange={(e) =>
                      setSocialForm((p) => ({ ...p, platform: e.target.value }))
                    }
                  >
                    {Object.keys(platformBaseUrls).map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Username or Link</FormLabel>
                  <Input
                    value={socialForm.handle}
                    onChange={(e) =>
                      setSocialForm((p) => ({ ...p, handle: e.target.value }))
                    }
                    placeholder={
                      platformBaseUrls[socialForm.platform]?.placeholder ||
                      "username"
                    }
                    leftAddon={
                      platformBaseUrls[socialForm.platform]?.prefix || ""
                    }
                  />
                </FormField>

                <FormField>
                  <FormLabel>Custom Label (Optional)</FormLabel>
                  <Input
                    value={socialForm.label}
                    onChange={(e) =>
                      setSocialForm((p) => ({ ...p, label: e.target.value }))
                    }
                    placeholder="e.g. My Instagram"
                  />
                  <FormHelperText>
                    Overrides default platform name on your profile.
                  </FormHelperText>
                </FormField>
              </>
            )}

            {item.type === "business" && (
              <>
                <FormField>
                  <FormLabel required>Link Title</FormLabel>
                  <Input
                    required
                    value={businessForm.title}
                    onChange={(e) =>
                      setBusinessForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. My Portfolio"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Destination URL</FormLabel>
                  <Input
                    required
                    type="url"
                    value={businessForm.url}
                    onChange={(e) =>
                      setBusinessForm((p) => ({ ...p, url: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </FormField>

                <FormField>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    rows={2}
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Add a brief description about this destination..."
                  />
                </FormField>
              </>
            )}

            {item.type === "payment" && (
              <>
                <FormField>
                  <FormLabel required>Payment Method</FormLabel>
                  <Select
                    value={paymentForm.platform}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        platform: e.target.value,
                      }))
                    }
                  >
                    {Object.keys(paymentBaseUrls).map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Account Handle or UPI ID</FormLabel>
                  <Input
                    value={paymentForm.handle}
                    onChange={(e) =>
                      setPaymentForm((p) => ({ ...p, handle: e.target.value }))
                    }
                    placeholder={
                      paymentBaseUrls[paymentForm.platform]?.placeholder ||
                      "Account ID"
                    }
                  />
                </FormField>
              </>
            )}
          </div>
        )}

        {/* Section 2: Appearance (Business Link Thumbnail) */}
        {activeSection === "appearance" && item.type === "business" && (
          <div className="space-y-4 pt-1">
            <ImageUpload
              label="Thumbnail Image"
              helperText="Upload a square icon or thumbnail to accompany this link card."
              value={businessForm.thumbnailUrl}
              onChange={(url) =>
                setBusinessForm((p) => ({ ...p, thumbnailUrl: url }))
              }
              aspectRatio="thumbnail"
              folder="thumbnails"
              maxWidth={600}
              maxHeight={600}
            />
          </div>
        )}

        {/* Section 3: Schedule & UTM */}
        {activeSection === "schedule" && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>Scheduling (Visibility Window)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField>
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      item.type === "social"
                        ? socialForm.startDate
                        : item.type === "business"
                        ? businessForm.startDate
                        : paymentForm.startDate
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (item.type === "social")
                        setSocialForm((p) => ({ ...p, startDate: val }));
                      else if (item.type === "business")
                        setBusinessForm((p) => ({ ...p, startDate: val }));
                      else setPaymentForm((p) => ({ ...p, startDate: val }));
                    }}
                  />
                </FormField>

                <FormField>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      item.type === "social"
                        ? socialForm.endDate
                        : item.type === "business"
                        ? businessForm.endDate
                        : paymentForm.endDate
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (item.type === "social")
                        setSocialForm((p) => ({ ...p, endDate: val }));
                      else if (item.type === "business")
                        setBusinessForm((p) => ({ ...p, endDate: val }));
                      else setPaymentForm((p) => ({ ...p, endDate: val }));
                    }}
                  />
                </FormField>
              </div>
              <FormHelperText>
                Leave blank for continuous publication.
              </FormHelperText>
            </div>

            {/* UTM Tracking Configuration */}
            {isUtmSupported && (
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>UTM Campaign Tracking</span>
                  </div>
                  <Toggle
                    checked={utmForm.utmEnabled}
                    onChange={(c) =>
                      setUtmForm((p) => ({ ...p, utmEnabled: c }))
                    }
                    size="sm"
                  />
                </div>

                {utmForm.utmEnabled && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField>
                        <FormLabel>Source</FormLabel>
                        <Input
                          placeholder="e.g. bio, instagram"
                          value={utmForm.utmSource}
                          onChange={(e) =>
                            setUtmForm((p) => ({
                              ...p,
                              utmSource: e.target.value,
                            }))
                          }
                        />
                      </FormField>

                      <FormField>
                        <FormLabel>Campaign</FormLabel>
                        <Input
                          placeholder="e.g. summer_launch"
                          value={utmForm.utmCampaign}
                          onChange={(e) =>
                            setUtmForm((p) => ({
                              ...p,
                              utmCampaign: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                    </div>

                    {previewResult.isValid && previewResult.url && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs">
                        <span className="font-semibold text-gray-500 text-[10px] uppercase block mb-1">
                          Generated URL Preview:
                        </span>
                        <p className="font-mono text-gray-700 dark:text-zinc-300 break-all text-[11px]">
                          {previewResult.url}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
