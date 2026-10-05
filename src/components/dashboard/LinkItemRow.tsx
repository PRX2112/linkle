"use client";

import * as React from "react";
import { useState } from "react";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Copy,
  Check,
  Star,
  Trash2,
  ExternalLink,
  BarChart3,
  Calendar,
  Tag,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Mail,
  Phone,
  MessageCircle,
  Smartphone,
  CreditCard,
  DollarSign,
  Wallet,
  Bitcoin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown";

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
  // Payments
  upi: <Smartphone className="w-4 h-4" />,
  paypal: <DollarSign className="w-4 h-4" />,
  stripe: <CreditCard className="w-4 h-4" />,
  paytm: <Wallet className="w-4 h-4" />,
  phonepe: <Smartphone className="w-4 h-4" />,
  googlepay: <Wallet className="w-4 h-4" />,
  crypto: <Bitcoin className="w-4 h-4" />,
};

export interface LinkItemRowProps {
  id: string;
  type: "social" | "business" | "payment";
  title: string;
  url: string;
  platform?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  isVisible: boolean;
  featured?: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  utmEnabled?: boolean;
  utmSource?: string | null;
  utmCampaign?: string | null;
  clicks?: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: (visible: boolean) => void;
  onToggleFeatured?: () => void;
  dragHandleProps?: any;
}

export function LinkItemRow({
  id,
  type,
  title,
  url,
  platform,
  description,
  thumbnailUrl,
  isVisible,
  featured,
  startDate,
  endDate,
  utmEnabled,
  utmSource,
  utmCampaign,
  clicks = 0,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  dragHandleProps,
}: LinkItemRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Schedule status text
  const scheduleStatus = (() => {
    if (!startDate && !endDate) return null;
    const now = new Date();
    if (startDate) {
      const start = new Date(startDate);
      if (start > now) {
        return `Starts ${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (end < now) {
        return "Expired";
      }
      return `Ends ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }
    return null;
  })();

  const iconElement = platform ? platformIcons[platform.toLowerCase()] || <Globe className="w-4 h-4" /> : <Globe className="w-4 h-4" />;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 transition-all duration-150 shadow-subtle hover:border-gray-300 dark:hover:border-zinc-700",
        !isVisible && "opacity-70 bg-gray-50/60 dark:bg-zinc-900/40 border-dashed"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...dragHandleProps}
        aria-label={`Reorder ${title}`}
        className="cursor-grab active:cursor-grabbing min-w-[36px] min-h-[36px] p-2 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 touch-none shrink-0 flex items-center justify-center"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Visual Identifier: Thumbnail or Icon */}
      {thumbnailUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700/80 shrink-0">
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-zinc-700/60">
          {iconElement}
        </div>
      )}

      {/* Content Center */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
            {title}
          </h4>

          {/* Badges */}
          {featured && (
            <Badge variant="warning" size="sm" className="gap-1 font-semibold text-[10px]">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              Featured
            </Badge>
          )}

          {!isVisible && (
            <Badge variant="default" size="sm" className="text-[10px] text-gray-500">
              Hidden
            </Badge>
          )}

          {scheduleStatus && (
            <Badge
              variant={scheduleStatus === "Expired" ? "error" : "brand"}
              size="sm"
              className="gap-1 text-[10px]"
            >
              <Calendar className="w-2.5 h-2.5" />
              {scheduleStatus}
            </Badge>
          )}

          {utmEnabled && (
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex gap-1 text-[10px]">
              <Tag className="w-2.5 h-2.5" />
              UTM
            </Badge>
          )}
        </div>

        {/* Destination URL */}
        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5 max-w-sm sm:max-w-md md:max-w-lg">
          {url}
        </p>

        {/* Optional Description */}
        {description && (
          <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 line-clamp-1 opacity-90">
            {description}
          </p>
        )}
      </div>

      {/* Clicks count (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400 px-2 shrink-0">
        <BarChart3 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
        <span>{clicks.toLocaleString()}</span>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-2 shrink-0 pl-1">
        <Toggle
          checked={isVisible}
          onChange={onToggleVisibility}
          size="sm"
          aria-label={isVisible ? "Set hidden" : "Set visible"}
        />
        <span className="hidden sm:inline-block text-xs font-medium text-gray-500 dark:text-zinc-400 w-12 text-left">
          {isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      {/* Overflow Actions Dropdown */}
      <div className="shrink-0">
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Link actions menu"
              className="min-w-[36px] min-h-[36px] p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          }
        >
          <DropdownItem icon={<Pencil className="w-3.5 h-3.5" />} onClick={onEdit}>
            Edit details
          </DropdownItem>

          <DropdownItem
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? "Link copied!" : "Copy link URL"}
          </DropdownItem>

          {onToggleFeatured && (
            <DropdownItem
              icon={<Star className={cn("w-3.5 h-3.5", featured && "fill-amber-500 text-amber-500")} />}
              onClick={onToggleFeatured}
            >
              {featured ? "Remove featured" : "Feature on profile"}
            </DropdownItem>
          )}

          <DropdownDivider />

          <DropdownItem
            destructive
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={onDelete}
          >
            Delete link
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
