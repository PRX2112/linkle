"use client";

import { useState, useEffect } from "react";
import { usePreview } from "./PreviewContext";
import { Plus, Globe, Instagram, Twitter, Linkedin, Youtube, Github, Mail, Phone, MessageCircle, BarChart3, GripVertical, QrCode, Star } from "lucide-react";
import QRCodeModal from "./QRCodeModal";
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

interface SocialLink { id: string; platform: string; url: string; label?: string | null; isVisible: boolean; order: number; userId: string; }
interface BusinessLink { id: string; title: string; url: string; description?: string | null; thumbnailUrl?: string | null; isVisible: boolean; order: number; userId: string; }
interface PaymentLink { id: string; platform: string; value: string; isVisible: boolean; order: number; userId: string; }

interface UserWithLinks {
  id: string;
  username?: string | null;
  socialLinks: SocialLink[];
  businessLinks: BusinessLink[];
  paymentLinks: PaymentLink[];
  contactActions: { id: string; type: string; label: string; url: string; isVisible: boolean; }[];
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

export default function LinksManager({ user }: { user: UserWithLinks }) {
  const [activeTab, setActiveTab] = useState<"social" | "business" | "payments" | "contact" | "tools">("social");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const { updatePreviewUser } = usePreview();

  // Social Links state
  const [socialLinks, setSocialLinks] = useState(user.socialLinks);
  const [newSocial, setNewSocial] = useState({ platform: "instagram", url: "", label: "" });

  // Business Links state
  const [businessLinks, setBusinessLinks] = useState(user.businessLinks);
  const [newBusiness, setNewBusiness] = useState({ title: "", url: "", description: "", thumbnailUrl: "" });

  // Payment Links state
  const [paymentLinks, setPaymentLinks] = useState(user.paymentLinks);
  const [newPayment, setNewPayment] = useState({ platform: "upi", value: "" });

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
      payments: paymentLinks as any 
    });
  }, [socialLinks, businessLinks, paymentLinks, updatePreviewUser]);

  const handleSaveSocial = async () => {
    if (!newSocial.url) return;
    setSaving(true);
    const res = await fetch("/api/links/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSocial),
    });
    if (res.ok) {
      const data = await res.json();
      setSocialLinks((prev) => [...prev, data]);
      setNewSocial({ platform: "instagram", url: "", label: "" });
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
    if (!newPayment.value) return;
    setSaving(true);
    const res = await fetch("/api/links/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPayment),
    });
    if (res.ok) {
      const data = await res.json();
      setPaymentLinks((prev) => [...prev, data]);
      setNewPayment({ platform: "upi", value: "" });
      showSuccess("Payment link added!");
    }
    setSaving(false);
  };

  const handleDeletePayment = async (id: string) => {
    await fetch(`/api/links/payment/${id}`, { method: "DELETE" });
    setPaymentLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const [emailCapture, setEmailCapture] = useState({ enabled: false, title: "Subscribe to my newsletter", placeholder: "Enter your email", saved: false });

  const tabs = [
    { id: "social", label: "Social" },
    { id: "business", label: "Links" },
    { id: "payments", label: "Payments" },
    { id: "tools", label: "⚡ Tools", badge: true },
  ] as const;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Links</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage everything shown on your Linkle page
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <>
              <a
                href={`/p/${user.username}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <Globe className="w-4 h-4" /> Preview
              </a>
              <button
                onClick={() => setShowQR(true)}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                title="Download QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </>
          )}
          <button 
            className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-glow flex items-center gap-2"
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
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
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
                            {Math.floor(Math.random() * 500) + 10} Clicks
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                          <button
                            onClick={() => {
                              setFeaturedIds(prev => {
                                const next = new Set(prev);
                                next.has(link.id) ? next.delete(link.id) : next.add(link.id);
                                return next;
                              });
                            }}
                            className={`text-xs font-medium flex items-center gap-1 transition-colors ${featuredIds.has(link.id) ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                            title="Pin as Featured"
                          >
                            <Star className={`w-3.5 h-3.5 ${featuredIds.has(link.id) ? "fill-amber-500" : ""}`} />
                            {featuredIds.has(link.id) ? "Featured" : "Feature"}
                          </button>
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                          <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
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
              <select value={newSocial.platform} onChange={(e) => setNewSocial((p) => ({ ...p, platform: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40">
                {["instagram","twitter","linkedin","youtube","github","email","phone","whatsapp","website"].map((p) => (
                   <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <input value={newSocial.url} onChange={(e) => setNewSocial((p) => ({ ...p, url: e.target.value }))}
                placeholder="URL or handle"
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
            <button onClick={handleSaveSocial} disabled={saving || !newSocial.url}
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
                          {Math.floor(Math.random() * 800) + 100} Clicks
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
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
            <div className="space-y-3">
              <input value={newBusiness.title} onChange={(e) => setNewBusiness((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title (e.g., My Portfolio)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              <input value={newBusiness.url} onChange={(e) => setNewBusiness((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
              <input value={newBusiness.description} onChange={(e) => setNewBusiness((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
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
                          {Math.floor(Math.random() * 50) + 5} Clicks
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></div>
                        <button className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Edit</button>
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
              <select value={newPayment.platform} onChange={(e) => setNewPayment((p) => ({ ...p, platform: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40">
                {["upi","paypal","stripe","paytm","phonepe","googlepay","crypto"].map((p) => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
              <input value={newPayment.value} onChange={(e) => setNewPayment((p) => ({ ...p, value: e.target.value }))}
                placeholder="UPI ID / payment link"
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
            </div>
            <button onClick={handleSavePayment} disabled={saving || !newPayment.value}
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
                onClick={() => setEmailCapture(e => ({ ...e, enabled: !e.enabled }))}
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
                    onChange={e => setEmailCapture(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Placeholder</label>
                  <input
                    value={emailCapture.placeholder}
                    onChange={e => setEmailCapture(prev => ({ ...prev, placeholder: e.target.value }))}
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
                  onClick={() => setEmailCapture(prev => ({ ...prev, saved: true }))}
                  className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-glow"
                >
                  {emailCapture.saved ? "✓ Saved" : "Save Block"}
                </button>
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
    </div>
  );
}
