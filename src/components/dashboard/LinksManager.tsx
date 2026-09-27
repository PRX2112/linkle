"use client";

import { useState, useEffect } from "react";
import { usePreview } from "./PreviewContext";
import { Plus, Globe, Instagram, Twitter, Linkedin, Youtube, Github, Mail, Phone, MessageCircle, BarChart3, GripVertical, QrCode, Star, Wallet, CreditCard, Smartphone, Bitcoin, DollarSign } from "lucide-react";
import QRCodeModal from "./QRCodeModal";
import LinkEditModal from "./LinkEditModal";
import StyledSelect from "./StyledSelect";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 w-full">
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

interface SocialLink { id: string; platform: string; url: string; label?: string | null; isVisible: boolean; order: number; userId: string; featured?: boolean; startDate?: Date | string | null; endDate?: Date | string | null; }
interface BusinessLink { id: string; title: string; url: string; description?: string | null; thumbnailUrl?: string | null; isVisible: boolean; order: number; userId: string; featured?: boolean; startDate?: Date | string | null; endDate?: Date | string | null; }
interface PaymentLink { id: string; platform: string; value: string; isVisible: boolean; order: number; userId: string; featured?: boolean; startDate?: Date | string | null; endDate?: Date | string | null; }

interface UserWithLinks {
  id: string;
  username?: string | null;
  socialLinks: SocialLink[];
  businessLinks: BusinessLink[];
  paymentLinks: PaymentLink[];
  contactActions: { id: string; type: string; label: string; url: string; isVisible: boolean; }[];
  emailCaptureEnabled?: boolean;
  emailCaptureTitle?: string;
  emailCapturePlaceholder?: string;
  capturedEmails?: { id: string; email: string; createdAt: Date | string; }[];
  clicksMap?: Record<string, number>;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  github: <Github className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
};

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
  const [activeTab, setActiveTab] = useState<"social" | "business" | "payments" | "contact" | "tools">("social");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: "social" | "business" | "payment"; data: any } | null>(null);
  const { updatePreviewUser } = usePreview();

  // Social Links state
  const [socialLinks, setSocialLinks] = useState(user.socialLinks);
  const [newSocial, setNewSocial] = useState({ platform: "instagram", handle: "", label: "" });

  // Business Links state
  const [businessLinks, setBusinessLinks] = useState(user.businessLinks);
  const [newBusiness, setNewBusiness] = useState({ title: "", url: "", description: "", thumbnailUrl: "" });

  // Payment Links state
  const [paymentLinks, setPaymentLinks] = useState(user.paymentLinks);
  const [newPayment, setNewPayment] = useState({ platform: "upi", handle: "" });

  const [emailCapture, setEmailCapture] = useState({
    enabled: user.emailCaptureEnabled || false,
    title: user.emailCaptureTitle || "Subscribe to my newsletter",
    placeholder: user.emailCapturePlaceholder || "Enter your email",
    saved: true,
  });

  const [capturedEmails, setCapturedEmails] = useState(user.capturedEmails || []);

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
        setEmailCapture(prev => ({ ...prev, saved: true }));
        showSuccess("Email capture settings saved!");
      } else {
        showSuccess("Failed to save email capture settings.");
      }
    } catch {
      showSuccess("Error saving email capture settings.");
    }
    setSaving(false);
  };


  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndSocial = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = socialLinks.findIndex((item) => item.id === active.id);
      const newIndex = socialLinks.findIndex((item) => item.id === over.id);
      const newLinks = arrayMove(socialLinks, oldIndex, newIndex);
      
      // Update order property optimistic
      const updatedLinks = newLinks.map((link, index) => ({ ...link, order: index }));
      setSocialLinks(updatedLinks);

      // Persist to DB
      await fetch('/api/links/social/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: updatedLinks.map(l => ({ id: l.id, order: l.order })) })
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
      await fetch('/api/links/business/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: updatedLinks.map(l => ({ id: l.id, order: l.order })) })
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
      await fetch('/api/links/payment/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: updatedLinks.map(l => ({ id: l.id, order: l.order })) })
      });
    }
  };

  useEffect(() => {
    updatePreviewUser({ 
      socialLinks: socialLinks as any, 
      businessLinks: businessLinks as any, 
      payments: paymentLinks as any,
      emailCaptureEnabled: emailCapture.enabled,
      emailCaptureTitle: emailCapture.title,
      emailCapturePlaceholder: emailCapture.placeholder
    });
  }, [socialLinks, businessLinks, paymentLinks, emailCapture, updatePreviewUser]);

  const handleSaveSocial = async () => {
    if (!newSocial.handle) return;
    setSaving(true);
    const base = platformBaseUrls[newSocial.platform];
    const fullUrl = base ? base.prefix + newSocial.handle : newSocial.handle;
    const res = await fetch("/api/links/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: newSocial.platform, url: fullUrl, label: newSocial.label }),
    });
    if (res.ok) {
      const data = await res.json();
      setSocialLinks((prev) => [...prev, data]);
      setNewSocial({ platform: "instagram", handle: "", label: "" });
      showSuccess("Social link added!");
    }
    setSaving(false);
  };

  const handleDeleteSocial = async (id: string) => {
    await fetch(`/api/links/social/${id}`, { method: "DELETE" });
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
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
      showSuccess("Business link added!");
    }
    setSaving(false);
  };

  const handleDeleteBusiness = async (id: string) => {
    await fetch(`/api/links/business/${id}`, { method: "DELETE" });
    setBusinessLinks((prev) => prev.filter((l) => l.id !== id));
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
      showSuccess("Payment link added!");
    }
    setSaving(false);
  };

  const handleDeletePayment = async (id: string) => {
    await fetch(`/api/links/payment/${id}`, { method: "DELETE" });
    setPaymentLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSaveEditedLink = (updatedLink: any) => {
    if (!editingItem) return;
    
    if (editingItem.type === "social") {
      setSocialLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
      showSuccess("Social link updated!");
    } else if (editingItem.type === "business") {
      setBusinessLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
      showSuccess("Link updated!");
    } else if (editingItem.type === "payment") {
      setPaymentLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
      showSuccess("Payment method updated!");
    }
  };



  const tabs = [
    { id: "social", label: "Social" },
    { id: "business", label: "Links" },
    { id: "payments", label: "Payments" },
    { id: "tools", label: "⚡ Tools", badge: true },
  ] as const;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Links</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage everything shown on your Linkle page
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {user.username && (
            <>
              <a
                href={`/p/${user.username}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 shrink-0"
              >
                <Globe className="w-4 h-4" /> Preview
              </a>
              <button
                onClick={() => setShowQR(true)}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all shrink-0"
                title="Download QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </>
          )}
          <button 
            className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-glow flex items-center gap-2 shrink-0"
            onClick={() => {
              document.getElementById('add-link-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Plus className="w-4 h-4" /> Add New Link
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && user.username && (
        <QRCodeModal
          username={user.username}
          displayName={null}
          onClose={() => setShowQR(false)}
        />
      )}

      {successMsg && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-xs">✓</span>
          {successMsg}
        </div>
      )}

      {/* Profile Section Separator (Visual only for now context) */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Content</h2>
          <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-x-auto no-scrollbar max-w-full flex-nowrap shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Social Tab */}
      {activeTab === "social" && (
        <section className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSocial}>
            <SortableContext items={socialLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {socialLinks.map((link) => (
                <SortableItem key={link.id} id={link.id}>
                  <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0 shadow-sm">
                        {platformIcons[link.platform] ?? <Globe className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold capitalize text-gray-900 dark:text-white flex items-center gap-2">
                          {link.platform}
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium tracking-wide uppercase">Social</span>
                        </div>
                        <div className="text-sm text-gray-400 truncate mt-0.5">{link.url}</div>
                        
                        {/* Mock Analytics & Actions */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {user.clicksMap?.[link.id] || 0} Clicks
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                          <button
                            onClick={async () => {
                              const updatedFeatured = !link.featured;
                              const updated = socialLinks.map(l => l.id === link.id ? { ...l, featured: updatedFeatured } : l);
                              setSocialLinks(updated);
                              await fetch(`/api/links/social/${link.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ featured: updatedFeatured })
                              });
                            }}
                            className={`text-xs font-medium flex items-center gap-1 transition-colors ${link.featured ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                            title="Pin as Featured"
                          >
                            <Star className={`w-3.5 h-3.5 ${link.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            {link.featured ? "Featured" : "Feature"}
                          </button>
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                          <button onClick={() => setEditingItem({ type: "social", data: link })} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                          <button onClick={() => handleDeleteSocial(link.id)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:hidden">Visibility</span>
                      <button 
                        onClick={() => {
                          const updated = socialLinks.map(l => l.id === link.id ? { ...l, isVisible: !l.isVisible } : l);
                          setSocialLinks(updated);
                          fetch(`/api/links/social/${link.id}/toggle`, { method: "PATCH", body: JSON.stringify({ isVisible: !link.isVisible }) });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${link.isVisible ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${link.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                        {link.isVisible ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <div id="add-link-section" className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 space-y-4 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              Add Social Link
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StyledSelect
                value={newSocial.platform}
                onChange={(val) => setNewSocial((p) => ({ ...p, platform: val, handle: "" }))}
                options={[
                  { value: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "bg-gradient-to-br from-pink-500 to-orange-400" },
                  { value: "twitter", label: "Twitter", icon: <Twitter className="w-4 h-4" />, color: "bg-gradient-to-br from-sky-400 to-blue-500" },
                  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "bg-gradient-to-br from-blue-600 to-blue-800" },
                  { value: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "bg-gradient-to-br from-red-500 to-red-700" },
                  { value: "github", label: "GitHub", icon: <Github className="w-4 h-4" />, color: "bg-gradient-to-br from-gray-700 to-gray-900" },
                  { value: "email", label: "Email", icon: <Mail className="w-4 h-4" />, color: "bg-gradient-to-br from-emerald-400 to-teal-600" },
                  { value: "phone", label: "Phone", icon: <Phone className="w-4 h-4" />, color: "bg-gradient-to-br from-green-500 to-green-700" },
                  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="w-4 h-4" />, color: "bg-gradient-to-br from-green-400 to-emerald-600" },
                  { value: "website", label: "Website", icon: <Globe className="w-4 h-4" />, color: "bg-gradient-to-br from-indigo-500 to-purple-600" },
                ]}
              />
              <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-400 dark:focus-within:border-purple-500 transition-all">
                {platformBaseUrls[newSocial.platform]?.prefix && (
                  <span className="flex items-center px-3 py-2 sm:py-0 bg-gray-100 dark:bg-zinc-700 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-600 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
                    {platformBaseUrls[newSocial.platform].prefix}
                  </span>
                )}
                <input
                  value={newSocial.handle}
                  onChange={(e) => setNewSocial((p) => ({ ...p, handle: e.target.value }))}
                  placeholder={platformBaseUrls[newSocial.platform]?.placeholder || "handle"}
                  className="flex-1 px-3 py-3 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none min-w-0"
                />
              </div>
            </div>
            <button onClick={handleSaveSocial} disabled={saving || !newSocial.handle}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-glow">
              Add To Profile
            </button>
          </div>
        </section>
      )}

      {/* Business/Links Tab */}
      {activeTab === "business" && (
        <section className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndBusiness}>
            <SortableContext items={businessLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {businessLinks.map((link) => (
                <SortableItem key={link.id} id={link.id}>
                  <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
                    {link.thumbnailUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 border border-gray-100 dark:border-zinc-800">
                        <img src={link.thumbnailUrl} alt={link.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {link.title}
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-medium tracking-wide uppercase">Link Block</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{link.url}</div>
                      {link.description && <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">{link.description}</div>}
                      
                      {/* Mock Analytics & Actions */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <BarChart3 className="w-3.5 h-3.5" />
                          {user.clicksMap?.[link.id] || 0} Clicks
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button onClick={() => setEditingItem({ type: "business", data: link })} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button onClick={() => handleDeleteBusiness(link.id)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">Delete</button>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:hidden">Visibility</span>
                      <button 
                        onClick={() => {
                          const updated = businessLinks.map(l => l.id === link.id ? { ...l, isVisible: !l.isVisible } : l);
                          setBusinessLinks(updated);
                          fetch(`/api/links/business/${link.id}/toggle`, { method: "PATCH", body: JSON.stringify({ isVisible: !link.isVisible }) });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${link.isVisible ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${link.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                        {link.isVisible ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <div id="add-link-section" className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 space-y-4 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              Add Link Block
            </h3>
            <div className="space-y-4">
              <input value={newBusiness.title} onChange={(e) => setNewBusiness((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title (e.g., My Portfolio)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              <input value={newBusiness.url} onChange={(e) => setNewBusiness((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              <input value={newBusiness.description} onChange={(e) => setNewBusiness((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              
              <div>
                <ImageUpload
                  label="Thumbnail Image (optional)"
                  helperText="Upload a thumbnail for your link card. Auto-compressed and optimized."
                  value={newBusiness.thumbnailUrl}
                  onChange={(url) => setNewBusiness((p) => ({ ...p, thumbnailUrl: url }))}
                  aspectRatio="thumbnail"
                  folder="thumbnails"
                  maxWidth={600}
                  maxHeight={600}
                />
              </div>
            </div>
            <button onClick={handleSaveBusiness} disabled={saving || !newBusiness.title || !newBusiness.url}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-glow">
              Add To Profile
            </button>
          </div>

        </section>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <section className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPayment}>
            <SortableContext items={paymentLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {paymentLinks.map((link) => (
                <SortableItem key={link.id} id={link.id}>
                  <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
                     <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold capitalize text-gray-900 dark:text-white flex items-center gap-2">
                        {link.platform}
                        <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-medium tracking-wide uppercase">Payment</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{link.value}</div>
                      
                      {/* Mock Analytics & Actions */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <BarChart3 className="w-3.5 h-3.5" />
                          {user.clicksMap?.[link.id] || 0} Clicks
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button onClick={() => setEditingItem({ type: "payment", data: link })} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button onClick={() => handleDeletePayment(link.id)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">Delete</button>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:hidden">Visibility</span>
                      <button 
                        onClick={() => {
                          const updated = paymentLinks.map(l => l.id === link.id ? { ...l, isVisible: !l.isVisible } : l);
                          setPaymentLinks(updated);
                          fetch(`/api/links/payment/${link.id}/toggle`, { method: "PATCH", body: JSON.stringify({ isVisible: !link.isVisible }) });
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${link.isVisible ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${link.isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                        {link.isVisible ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <div id="add-link-section" className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 space-y-4 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              Add Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StyledSelect
                value={newPayment.platform}
                onChange={(val) => setNewPayment((p) => ({ ...p, platform: val, handle: "" }))}
                options={[
                  { value: "upi", label: "UPI", icon: <Smartphone className="w-4 h-4" />, color: "bg-gradient-to-br from-orange-500 to-orange-700" },
                  { value: "paypal", label: "PayPal", icon: <DollarSign className="w-4 h-4" />, color: "bg-gradient-to-br from-blue-500 to-blue-700" },
                  { value: "stripe", label: "Stripe", icon: <CreditCard className="w-4 h-4" />, color: "bg-gradient-to-br from-indigo-500 to-purple-600" },
                  { value: "paytm", label: "Paytm", icon: <Wallet className="w-4 h-4" />, color: "bg-gradient-to-br from-sky-400 to-cyan-600" },
                  { value: "phonepe", label: "PhonePe", icon: <Smartphone className="w-4 h-4" />, color: "bg-gradient-to-br from-purple-600 to-indigo-800" },
                  { value: "googlepay", label: "Google Pay", icon: <Wallet className="w-4 h-4" />, color: "bg-gradient-to-br from-green-400 to-blue-500" },
                  { value: "crypto", label: "Crypto", icon: <Bitcoin className="w-4 h-4" />, color: "bg-gradient-to-br from-amber-400 to-yellow-600" },
                ]}
              />
              <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-400 dark:focus-within:border-purple-500 transition-all">
                {paymentBaseUrls[newPayment.platform]?.prefix && (
                  <span className="flex items-center px-3 py-2 sm:py-0 bg-gray-100 dark:bg-zinc-700 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-650 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
                    {paymentBaseUrls[newPayment.platform].prefix}
                  </span>
                )}
                <input
                  value={newPayment.handle}
                  onChange={(e) => setNewPayment((p) => ({ ...p, handle: e.target.value }))}
                  placeholder={paymentBaseUrls[newPayment.platform]?.placeholder || "handle"}
                  className="flex-1 px-3 py-3 bg-transparent text-sm text-foreground placeholder-gray-400 focus:outline-none min-w-0"
                />
              </div>
            </div>
            <button onClick={handleSavePayment} disabled={saving || !newPayment.handle}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-glow">
              Add To Profile
            </button>
          </div>
        </section>
      )}

      {/* Tools Tab */}
      {activeTab === "tools" && (
        <section className="space-y-5">
          {/* Email Capture Block */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email Capture</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Collect emails from profile visitors</p>
                </div>
              </div>
              <button
                onClick={() => setEmailCapture(e => ({ ...e, enabled: !e.enabled, saved: false }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailCapture.enabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailCapture.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {emailCapture.enabled && (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Block Title</label>
                  <input
                    value={emailCapture.title}
                    onChange={e => setEmailCapture(prev => ({ ...prev, title: e.target.value, saved: false }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Placeholder</label>
                  <input
                    value={emailCapture.placeholder}
                    onChange={e => setEmailCapture(prev => ({ ...prev, placeholder: e.target.value, saved: false }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Preview</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{emailCapture.title}</p>
                  <div className="flex gap-2">
                    <input disabled placeholder={emailCapture.placeholder} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-400" />
                    <button disabled className="px-4 py-2 rounded-lg gradient-bg text-white text-sm font-semibold opacity-80">Subscribe</button>
                  </div>
                </div>

                <button
                  onClick={handleSaveEmailCapture}
                  disabled={saving || emailCapture.saved}
                  className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-glow"
                >
                  {emailCapture.saved ? "✓ Saved" : "Save Block"}
                </button>

                {/* Collected Emails List */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Collected Emails ({capturedEmails.length})</h4>
                  {capturedEmails.length === 0 ? (
                    <p className="text-xs text-gray-400">No emails collected yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {capturedEmails.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-zinc-800/40 rounded-lg text-xs">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{item.email}</span>
                          <span className="text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {capturedEmails.length > 0 && (
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Email,Date\n" 
                          + capturedEmails.map(e => `${e.email},${new Date(e.createdAt).toLocaleDateString()}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `${user.username || 'user'}_subscribers.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      📥 Download CSV List
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* QR Code Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">QR Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Download a shareable QR code for your profile</p>
            </div>
            {user.username ? (
              <button
                onClick={() => setShowQR(true)}
                className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-glow shrink-0"
              >
                Download QR
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">Set a username first</span>
            )}
          </div>

          {/* Scheduled Links Notice */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
              <span className="text-lg">🗓</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Scheduled Links</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set start/end dates for links — launch promos automatically</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800 shrink-0">
              Coming Soon
            </span>
          </div>
        </section>
      )}

      {editingItem && (
        <LinkEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEditedLink}
        />
      )}
    </div>
  );
}
