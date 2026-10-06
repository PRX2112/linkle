"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePreview } from "./PreviewContext";
import {
  Plus,
  Globe,
  Share2,
  CreditCard,
  Mail,
  QrCode,
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import QRCodeModal from "./QRCodeModal";
import LinkEditModal from "./LinkEditModal";
import OnboardingWizard from "./OnboardingWizard";
import ProfileImportModal from "./ProfileImportModal";
import { AddLinkModal } from "./AddLinkModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { LinkItemRow } from "./LinkItemRow";
import ImageUpload from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItemWrapper({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: any) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : undefined}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string | null;
  isVisible: boolean;
  order: number;
  userId: string;
  featured?: boolean;
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
  featured?: boolean;
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
  featured?: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

interface UserWithLinks {
  id: string;
  username?: string | null;
  displayName?: string | null;
  onboardingCompleted?: boolean;
  selectedTemplate?: string | null;
  socialLinks: SocialLink[];
  businessLinks: BusinessLink[];
  paymentLinks: PaymentLink[];
  contactActions: {
    id: string;
    type: string;
    label: string;
    url: string;
    isVisible: boolean;
  }[];
  emailCaptureEnabled?: boolean;
  emailCaptureTitle?: string;
  emailCapturePlaceholder?: string;
  capturedEmails?: { id: string; email: string; createdAt: Date | string }[];
  clicksMap?: Record<string, number>;
}

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

export default function LinksManager({ user }: { user: UserWithLinks }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"social" | "business" | "payments" | "tools">("social");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedProfile, setCopiedProfile] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    user.onboardingCompleted === false || searchParams?.get("onboarding") === "true"
  );
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: "social" | "business" | "payment";
    data: any;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "social" | "business" | "payment";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { updatePreviewUser } = usePreview();

  // Links state
  const [socialLinks, setSocialLinks] = useState(user.socialLinks);
  const [newSocial, setNewSocial] = useState({ platform: "instagram", handle: "", label: "" });

  const [businessLinks, setBusinessLinks] = useState(user.businessLinks);
  const [newBusiness, setNewBusiness] = useState({
    title: "",
    url: "",
    description: "",
    thumbnailUrl: "",
  });

  const [paymentLinks, setPaymentLinks] = useState(user.paymentLinks);
  const [newPayment, setNewPayment] = useState({ platform: "upi", handle: "" });

  const [emailCapture, setEmailCapture] = useState({
    enabled: user.emailCaptureEnabled || false,
    title: user.emailCaptureTitle || "Subscribe to my newsletter",
    placeholder: user.emailCapturePlaceholder || "Enter your email",
    saved: true,
  });
  const [capturedEmails, setCapturedEmails] = useState(user.capturedEmails || []);

  const showStatus = (msg: string, type: "success" | "error" | "info" = "success") => {
    setStatusMsg(msg);
    if (type === "error") {
      toast.error(msg);
    } else if (type === "info") {
      toast.info(msg);
    } else {
      toast.success(msg);
    }
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const username = user.username?.trim();
  const profileUrl = typeof window !== "undefined" && username
    ? `${window.location.origin}/p/${username}`
    : username
      ? `https://linklez.vercel.app/p/${username}`
      : "";

  const handleCopyProfile = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedProfile(true);
      toast.info("Profile link copied to clipboard");
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch {
      toast.error("Couldn't copy link to clipboard");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync with live preview context
  useEffect(() => {
    updatePreviewUser({
      socialLinks: socialLinks as any,
      businessLinks: businessLinks as any,
      payments: paymentLinks as any,
      emailCaptureEnabled: emailCapture.enabled,
      emailCaptureTitle: emailCapture.title,
      emailCapturePlaceholder: emailCapture.placeholder,
    });
  }, [socialLinks, businessLinks, paymentLinks, emailCapture, updatePreviewUser]);

  // Overall counts summary
  const summaryStats = useMemo(() => {
    const all = [...socialLinks, ...businessLinks, ...paymentLinks];
    const total = all.length;
    const visible = all.filter((l) => l.isVisible).length;
    const featured = all.filter((l) => (l as any).featured).length;
    const scheduled = all.filter((l) => l.startDate || l.endDate).length;
    return { total, visible, featured, scheduled };
  }, [socialLinks, businessLinks, paymentLinks]);

  // Drag and drop handlers
  const handleDragEndSocial = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = socialLinks.findIndex((item) => item.id === active.id);
      const newIndex = socialLinks.findIndex((item) => item.id === over.id);
      const newLinks = arrayMove(socialLinks, oldIndex, newIndex);
      const updatedLinks = newLinks.map((link, index) => ({ ...link, order: index }));
      setSocialLinks(updatedLinks);
      showStatus("Reordering saved");

      await fetch("/api/links/social/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: updatedLinks.map((l) => ({ id: l.id, order: l.order })) }),
      });
    }
  };

  const handleDragEndBusiness = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = businessLinks.findIndex((item) => item.id === active.id);
      const newIndex = businessLinks.findIndex((item) => item.id === over.id);
      const newLinks = arrayMove(businessLinks, oldIndex, newIndex);
      const updatedLinks = newLinks.map((link, index) => ({ ...link, order: index }));
      setBusinessLinks(updatedLinks);
      showStatus("Reordering saved");

      await fetch("/api/links/business/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: updatedLinks.map((l) => ({ id: l.id, order: l.order })) }),
      });
    }
  };

  const handleDragEndPayment = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paymentLinks.findIndex((item) => item.id === active.id);
      const newIndex = paymentLinks.findIndex((item) => item.id === over.id);
      const newLinks = arrayMove(paymentLinks, oldIndex, newIndex);
      const updatedLinks = newLinks.map((link, index) => ({ ...link, order: index }));
      setPaymentLinks(updatedLinks);
      showStatus("Reordering saved");

      await fetch("/api/links/payment/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: updatedLinks.map((l) => ({ id: l.id, order: l.order })) }),
      });
    }
  };

  // Visibility toggle handlers
  const handleToggleVisibility = async (type: "social" | "business" | "payment", id: string, nextVisible: boolean) => {
    if (type === "social") {
      setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isVisible: nextVisible } : l)));
      await fetch(`/api/links/social/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
    } else if (type === "business") {
      setBusinessLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isVisible: nextVisible } : l)));
      await fetch(`/api/links/business/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
    } else if (type === "payment") {
      setPaymentLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isVisible: nextVisible } : l)));
      await fetch(`/api/links/payment/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
    }
    showStatus(nextVisible ? "Link published" : "Link hidden");
  };

  // Featured toggle handlers
  const handleToggleFeatured = async (type: "social" | "business" | "payment", id: string, current: boolean) => {
    const nextFeatured = !current;
    if (type === "social") {
      setSocialLinks((prev) => prev.map((l) => (l.id === id ? { ...l, featured: nextFeatured } : l)));
      await fetch(`/api/links/social/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
    } else if (type === "business") {
      setBusinessLinks((prev) => prev.map((l) => (l.id === id ? { ...l, featured: nextFeatured } : l)));
      await fetch(`/api/links/business/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
    }
    showStatus(nextFeatured ? "Marked as featured" : "Removed from featured");
  };

  // Add handlers
  const handleSaveSocial = async () => {
    if (!newSocial.handle) return;
    setSaving(true);
    const base = platformBaseUrls[newSocial.platform];
    const fullUrl = base ? base.prefix + newSocial.handle : newSocial.handle;
    const res = await fetch("/api/links/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: newSocial.platform,
        url: fullUrl,
        label: newSocial.label,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSocialLinks((prev) => [...prev, data]);
      setNewSocial({ platform: "instagram", handle: "", label: "" });
      showStatus("Social link added!", "success");
    } else {
      const err = await res.json();
      showStatus(err.error || "Failed to add social link", "error");
    }
    setSaving(false);
  };

  const handleSaveBusiness = async () => {
    if (!newBusiness.title || !newBusiness.url) return;
    setSaving(true);
    const res = await fetch("/api/links/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBusiness),
    });
    if (res.ok) {
      const data = await res.json();
      setBusinessLinks((prev) => [...prev, data]);
      setNewBusiness({ title: "", url: "", description: "", thumbnailUrl: "" });
      showStatus("Link block added!", "success");
    } else {
      const err = await res.json();
      showStatus(err.error || "Failed to add link", "error");
    }
    setSaving(false);
  };

  const handleSavePayment = async () => {
    if (!newPayment.handle) return;
    setSaving(true);
    const base = paymentBaseUrls[newPayment.platform];
    const fullValue = base ? base.prefix + newPayment.handle : newPayment.handle;
    const res = await fetch("/api/links/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: newPayment.platform, value: fullValue }),
    });
    if (res.ok) {
      const data = await res.json();
      setPaymentLinks((prev) => [...prev, data]);
      setNewPayment({ platform: "upi", handle: "" });
      showStatus("Payment method added!", "success");
    } else {
      const err = await res.json();
      showStatus(err.error || "Failed to add payment method", "error");
    }
    setSaving(false);
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const { type, id } = deleteTarget;
    if (type === "social") {
      await fetch(`/api/links/social/${id}`, { method: "DELETE" });
      setSocialLinks((prev) => prev.filter((l) => l.id !== id));
    } else if (type === "business") {
      await fetch(`/api/links/business/${id}`, { method: "DELETE" });
      setBusinessLinks((prev) => prev.filter((l) => l.id !== id));
    } else if (type === "payment") {
      await fetch(`/api/links/payment/${id}`, { method: "DELETE" });
      setPaymentLinks((prev) => prev.filter((l) => l.id !== id));
    }
    setIsDeleting(false);
    setDeleteTarget(null);
    showStatus("Link deleted", "info");
  };

  // Edit callback
  const handleSaveEditedLink = (updatedLink: any) => {
    if (!editingItem) return;
    if (editingItem.type === "social") {
      setSocialLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    } else if (editingItem.type === "business") {
      setBusinessLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    } else if (editingItem.type === "payment") {
      setPaymentLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    }
    showStatus("Changes saved successfully", "success");
  };

  // Email capture save
  const handleSaveEmailCapture = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailCaptureEnabled: emailCapture.enabled,
          emailCaptureTitle: emailCapture.title,
          emailCapturePlaceholder: emailCapture.placeholder,
        }),
      });
      if (res.ok) {
        setEmailCapture((prev) => ({ ...prev, saved: true }));
        showStatus("Email capture saved!", "success");
      } else {
        showStatus("Failed to save email capture.", "error");
      }
    } catch {
      showStatus("Error saving email capture.", "error");
    }
    setSaving(false);
  };

  const tabs = [
    { id: "social" as const, label: "Social", count: socialLinks.length },
    { id: "business" as const, label: "Links", count: businessLinks.length },
    { id: "payments" as const, label: "Payments", count: paymentLinks.length },
    { id: "tools" as const, label: "Tools", count: emailCapture.enabled ? 1 : 0 },
  ];

  const totalLinkCount = socialLinks.length + businessLinks.length + paymentLinks.length;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Links
            </h2>
            {statusMsg && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                {statusMsg}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage everything that appears on your Linkle profile.
          </p>

          {/* Compact Public Profile URL Bar */}
          {username && (
            <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-md bg-gray-100/70 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 text-xs">
              <span className="text-gray-400">linklez.vercel.app/p/{username}</span>
              <button
                type="button"
                onClick={handleCopyProfile}
                title="Copy profile link"
                className="min-w-[28px] min-h-[28px] p-1 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
              >
                {copiedProfile ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Primary Header Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add link
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<QrCode className="w-4 h-4" />}
            onClick={() => setShowQR(true)}
            title="Download profile QR Code"
          >
            QR
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
            onClick={() => setShowOnboarding(true)}
            title="Browse profile templates"
          >
            <span className="hidden sm:inline">Templates</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Download className="w-4 h-4 text-purple-600" />}
            onClick={() => setShowImport(true)}
            title="Import profile links from URLs"
          >
            <span className="hidden sm:inline">Import</span>
          </Button>
        </div>
      </div>

      {/* 2. Compact Inline Summary Bar */}
      {totalLinkCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {summaryStats.total} total links
          </span>
          <span>•</span>
          <span>{summaryStats.visible} published</span>
          <span>•</span>
          <span>{summaryStats.featured} featured</span>
          {summaryStats.scheduled > 0 && (
            <>
              <span>•</span>
              <span>{summaryStats.scheduled} scheduled</span>
            </>
          )}
        </div>
      )}

      {/* 3. Category Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg max-w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 ${isActive
                  ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                  : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-zinc-700/40"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold"
                    : "bg-gray-200/70 dark:bg-zinc-700/60 text-gray-500 dark:text-zinc-400"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. First-Time Starter Helper (If 0 Total Links) */}
      {totalLinkCount === 0 && (
        <div className="p-5 rounded-xl border border-brand-200/70 dark:border-brand-900/40 bg-brand-50/50 dark:bg-brand-950/20 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-900 dark:text-brand-200">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Your profile is ready for links</span>
          </div>
          <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed max-w-xl">
            Start with your most important destinations. You can add social channels, custom portfolio
            pages, payment methods, or import from your existing URLs.
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("social");
                document.getElementById("add-social-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              + Add Social
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("business");
                document.getElementById("add-business-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              + Add Website / Link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("payments");
                document.getElementById("add-payment-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              + Add Payment
            </Button>
          </div>
        </div>
      )}

      {/* 5. TAB: Social Links */}
      {activeTab === "social" && (
        <div className="space-y-4">
          {socialLinks.length === 0 ? (
            <EmptyState
              icon={<Share2 className="w-6 h-6" />}
              title="No social links yet"
              description="Connect your Instagram, LinkedIn, GitHub, YouTube, or personal website."
              action={
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    document.getElementById("add-social-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Add social link
                </Button>
              }
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSocial}>
              <SortableContext items={socialLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <SortableItemWrapper key={link.id} id={link.id}>
                      {(dragHandleProps) => (
                        <LinkItemRow
                          id={link.id}
                          type="social"
                          platform={link.platform}
                          title={link.label || link.platform.toUpperCase()}
                          url={link.url}
                          isVisible={link.isVisible}
                          featured={link.featured}
                          startDate={link.startDate}
                          endDate={link.endDate}
                          utmEnabled={link.utmEnabled}
                          utmSource={link.utmSource}
                          utmCampaign={link.utmCampaign}
                          clicks={user.clicksMap?.[link.id] || 0}
                          onEdit={() => setEditingItem({ type: "social", data: link })}
                          onDelete={() =>
                            setDeleteTarget({
                              type: "social",
                              id: link.id,
                              title: link.label || link.platform,
                            })
                          }
                          onToggleVisibility={(v) => handleToggleVisibility("social", link.id, v)}
                          onToggleFeatured={() => handleToggleFeatured("social", link.id, Boolean(link.featured))}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableItemWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Inline Add Social Form */}
          <Card id="add-social-section" variant="subtle" className="p-4 sm:p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                Add Social Channel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={newSocial.platform}
                  onChange={(e) =>
                    setNewSocial((p) => ({ ...p, platform: e.target.value, handle: "" }))
                  }
                  selectSize="md"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                  <option value="github">GitHub</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="website">Personal Website</option>
                </Select>

                <Input
                  value={newSocial.handle}
                  onChange={(e) => setNewSocial((p) => ({ ...p, handle: e.target.value }))}
                  placeholder={platformBaseUrls[newSocial.platform]?.placeholder || "username"}
                  leftAddon={platformBaseUrls[newSocial.platform]?.prefix || ""}
                  inputSize="md"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <Input
                  value={newSocial.label}
                  onChange={(e) => setNewSocial((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Optional custom button label (e.g. My Instagram)"
                  inputSize="sm"
                  className="max-w-md"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSocial}
                  disabled={saving || !newSocial.handle.trim()}
                  isLoading={saving}
                >
                  Add Social
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. TAB: Business / Custom Links */}
      {activeTab === "business" && (
        <div className="space-y-4">
          {businessLinks.length === 0 ? (
            <EmptyState
              icon={<Globe className="w-6 h-6" />}
              title="No link blocks yet"
              description="Showcase your portfolio, product, store, articles, or custom destinations."
              action={
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    document.getElementById("add-business-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Add website / link block
                </Button>
              }
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndBusiness}>
              <SortableContext items={businessLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {businessLinks.map((link) => (
                    <SortableItemWrapper key={link.id} id={link.id}>
                      {(dragHandleProps) => (
                        <LinkItemRow
                          id={link.id}
                          type="business"
                          title={link.title}
                          url={link.url}
                          description={link.description}
                          thumbnailUrl={link.thumbnailUrl}
                          isVisible={link.isVisible}
                          featured={link.featured}
                          startDate={link.startDate}
                          endDate={link.endDate}
                          utmEnabled={link.utmEnabled}
                          utmSource={link.utmSource}
                          utmCampaign={link.utmCampaign}
                          clicks={user.clicksMap?.[link.id] || 0}
                          onEdit={() => setEditingItem({ type: "business", data: link })}
                          onDelete={() =>
                            setDeleteTarget({
                              type: "business",
                              id: link.id,
                              title: link.title,
                            })
                          }
                          onToggleVisibility={(v) => handleToggleVisibility("business", link.id, v)}
                          onToggleFeatured={() => handleToggleFeatured("business", link.id, Boolean(link.featured))}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableItemWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Inline Add Business Form */}
          <Card id="add-business-section" variant="subtle" className="p-4 sm:p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                Add Link Block
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={newBusiness.title}
                  onChange={(e) => setNewBusiness((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Title (e.g. My Portfolio)"
                  inputSize="md"
                />
                <Input
                  type="url"
                  value={newBusiness.url}
                  onChange={(e) => setNewBusiness((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  inputSize="md"
                />
              </div>

              <Input
                value={newBusiness.description}
                onChange={(e) => setNewBusiness((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional short description..."
                inputSize="sm"
              />

              <div className="pt-1">
                <ImageUpload
                  label="Thumbnail Image (Optional)"
                  helperText="Upload a thumbnail icon or preview image."
                  value={newBusiness.thumbnailUrl}
                  onChange={(url) => setNewBusiness((p) => ({ ...p, thumbnailUrl: url }))}
                  aspectRatio="thumbnail"
                  folder="thumbnails"
                  maxWidth={600}
                  maxHeight={600}
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveBusiness}
                  disabled={saving || !newBusiness.title.trim() || !newBusiness.url.trim()}
                  isLoading={saving}
                >
                  Add Link Block
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7. TAB: Payment Methods */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {paymentLinks.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-6 h-6" />}
              title="No payment methods yet"
              description="Accept payments, tips, or bookings via UPI, PayPal, Stripe, or Crypto."
              action={
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    document.getElementById("add-payment-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Add payment method
                </Button>
              }
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPayment}>
              <SortableContext items={paymentLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {paymentLinks.map((link) => (
                    <SortableItemWrapper key={link.id} id={link.id}>
                      {(dragHandleProps) => (
                        <LinkItemRow
                          id={link.id}
                          type="payment"
                          platform={link.platform}
                          title={link.platform.toUpperCase()}
                          url={link.value}
                          isVisible={link.isVisible}
                          featured={link.featured}
                          startDate={link.startDate}
                          endDate={link.endDate}
                          clicks={user.clicksMap?.[link.id] || 0}
                          onEdit={() => setEditingItem({ type: "payment", data: link })}
                          onDelete={() =>
                            setDeleteTarget({
                              type: "payment",
                              id: link.id,
                              title: `${link.platform.toUpperCase()} (${link.value})`,
                            })
                          }
                          onToggleVisibility={(v) => handleToggleVisibility("payment", link.id, v)}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableItemWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Inline Add Payment Form */}
          <Card id="add-payment-section" variant="subtle" className="p-4 sm:p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                Add Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  value={newPayment.platform}
                  onChange={(e) =>
                    setNewPayment((p) => ({ ...p, platform: e.target.value, handle: "" }))
                  }
                  selectSize="md"
                >
                  <option value="upi">UPI (India QR & Apps)</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe Payment Link</option>
                  <option value="paytm">Paytm</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="googlepay">Google Pay</option>
                  <option value="crypto">Crypto Wallet</option>
                </Select>

                <Input
                  value={newPayment.handle}
                  onChange={(e) => setNewPayment((p) => ({ ...p, handle: e.target.value }))}
                  placeholder={paymentBaseUrls[newPayment.platform]?.placeholder || "Handle or Account ID"}
                  leftAddon={paymentBaseUrls[newPayment.platform]?.prefix || ""}
                  inputSize="md"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSavePayment}
                  disabled={saving || !newPayment.handle.trim()}
                  isLoading={saving}
                >
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 8. TAB: Tools & Email Capture */}
      {activeTab === "tools" && (
        <div className="space-y-4">
          <Card variant="default" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/50">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Email Capture Block
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Collect visitor emails into a downloadable subscriber list.
                  </p>
                </div>
              </div>

              <Toggle
                checked={emailCapture.enabled}
                onChange={(c) => setEmailCapture((p) => ({ ...p, enabled: c, saved: false }))}
                size="sm"
                aria-label="Toggle email capture"
              />
            </div>

            {!emailCapture.enabled ? (
              <div className="py-6 px-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center space-y-1.5">
                <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                  Email capture is currently disabled
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Turn on the toggle above to display a newsletter subscription block directly on your Linkle profile and build your direct audience.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Header Title
                    </label>
                    <Input
                      value={emailCapture.title}
                      onChange={(e) =>
                        setEmailCapture((p) => ({ ...p, title: e.target.value, saved: false }))
                      }
                      inputSize="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Input Placeholder
                    </label>
                    <Input
                      value={emailCapture.placeholder}
                      onChange={(e) =>
                        setEmailCapture((p) => ({ ...p, placeholder: e.target.value, saved: false }))
                      }
                      inputSize="sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEmailCapture}
                    disabled={saving || emailCapture.saved}
                    isLoading={saving}
                  >
                    {emailCapture.saved ? "Saved" : "Save Email Capture"}
                  </Button>
                </div>

                {/* Subscribers List */}
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      Collected Emails ({capturedEmails.length})
                    </h4>
                    {capturedEmails.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const csvContent =
                            "data:text/csv;charset=utf-8,Email,Date\n" +
                            capturedEmails
                              .map(
                                (e) =>
                                  `${e.email},${new Date(e.createdAt).toLocaleDateString()}`
                              )
                              .join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute(
                            "download",
                            `${user.username || "user"}_subscribers.csv`
                          );
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        Download CSV
                      </button>
                    )}
                  </div>

                  {capturedEmails.length === 0 ? (
                    <div className="py-5 px-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">
                      <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                        No subscribers collected yet
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        When visitors submit their email on your public profile, their addresses will be securely collected here and ready for CSV download.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {capturedEmails.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/60 text-xs"
                        >
                          <span className="font-medium text-gray-800 dark:text-zinc-200">
                            {item.email}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Unified Add Link Modal */}
      <AddLinkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelectCategory={(cat) => {
          setActiveTab(cat);
          setTimeout(() => {
            const sectionId =
              cat === "social"
                ? "add-social-section"
                : cat === "business"
                  ? "add-business-section"
                  : cat === "payments"
                    ? "add-payment-section"
                    : undefined;
            if (sectionId) {
              document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        }}
        onOpenTemplates={() => setShowOnboarding(true)}
        onOpenImport={() => setShowImport(true)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title={deleteTarget.title}
          itemType={deleteTarget.type === "payment" ? "payment method" : "link"}
          isDeleting={isDeleting}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <LinkEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEditedLink}
        />
      )}

      {/* QR Code Modal */}
      {showQR && user.username && (
        <QRCodeModal
          username={user.username}
          displayName={user.displayName}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Templates & Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        user={user as any}
        onSuccess={(updatedUser) => {
          if (updatedUser) {
            if (updatedUser.socialLinks) setSocialLinks(updatedUser.socialLinks);
            if (updatedUser.businessLinks) setBusinessLinks(updatedUser.businessLinks);
            if (updatedUser.paymentLinks) setPaymentLinks(updatedUser.paymentLinks);
          }
          setShowOnboarding(false);
          router.refresh();
        }}
      />

      {/* Profile Import Modal */}
      <ProfileImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => {
          showStatus("Links imported successfully!");
          router.refresh();
        }}
      />
    </div>
  );
}
