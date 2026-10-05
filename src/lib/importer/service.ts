import { prisma } from "@/lib/db";
import { revalidateProfile } from "@/lib/cache";
import { isSafeUrl } from "@/lib/utm";
import {
  SuggestedLink,
  ExistingUserLinkRef,
  ImportParseResult,
  ConfirmImportItem,
  SupportedImportPlatform,
} from "./types";

const FORBIDDEN_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
];

const INSTAGRAM_RESERVED = [
  "explore",
  "accounts",
  "direct",
  "reels",
  "stories",
  "p",
  "tv",
  "about",
  "legal",
  "developer",
  "help",
];

const GITHUB_RESERVED = [
  "orgs",
  "settings",
  "features",
  "marketplace",
  "pricing",
  "topics",
  "trending",
  "about",
  "explore",
  "search",
  "pulls",
  "issues",
  "notifications",
];

const TWITTER_RESERVED = [
  "home",
  "explore",
  "notifications",
  "messages",
  "search",
  "intent",
  "share",
  "i",
  "settings",
  "tos",
  "privacy",
];

/**
 * Normalizes a raw string into a valid URL object or null if invalid or unsafe.
 */
function toValidUrl(rawUrl: string): URL | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) return null;
  }

  if (/[\r\n\t\0]/.test(trimmed)) return null;

  try {
    const withScheme =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Strips tracking parameters from a URL.
 */
function cleanUrl(urlObj: URL): string {
  const clone = new URL(urlObj.toString());
  const paramsToRemove = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "igsh",
    "si",
    "ref",
    "source",
    "fbclid",
    "gclid",
    "t",
    "s",
  ];

  for (const p of paramsToRemove) {
    clone.searchParams.delete(p);
  }

  // Remove trailing slashes from path if root is empty
  let path = clone.pathname;
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  clone.pathname = path;

  // Clear hash
  clone.hash = "";

  return clone.toString();
}

/**
 * Parses a single URL and extracts platform, handle, and suggested Linkle entry.
 */
export function identifyPlatform(rawUrl: string): {
  platform: SupportedImportPlatform;
  normalizedUrl: string;
  entryType: "social" | "business";
  handle?: string;
  suggestedLabel: string;
  isValid: boolean;
  isSupported: boolean;
  errorMessage?: string;
} {
  const urlObj = toValidUrl(rawUrl);

  if (!urlObj) {
    return {
      platform: "website",
      normalizedUrl: rawUrl.trim(),
      entryType: "business",
      suggestedLabel: "Invalid URL",
      isValid: false,
      isSupported: false,
      errorMessage: "Invalid URL format or unsafe protocol (only http/https allowed)",
    };
  }

  const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = urlObj.pathname;
  const segments = pathname.split("/").filter(Boolean);

  // 1. Instagram
  if (hostname === "instagram.com" || hostname === "instagr.am") {
    let handle = segments[0] ? segments[0].replace(/^@/, "") : "";
    if (handle && !INSTAGRAM_RESERVED.includes(handle.toLowerCase())) {
      const normalized = `https://instagram.com/${handle}`;
      return {
        platform: "instagram",
        normalizedUrl: normalized,
        entryType: "social",
        handle,
        suggestedLabel: `Instagram (@${handle})`,
        isValid: true,
        isSupported: true,
      };
    }
  }

  // 2. YouTube
  if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtu.be"
  ) {
    if (hostname === "youtu.be" && segments[0]) {
      return {
        platform: "youtube",
        normalizedUrl: `https://youtube.com/watch?v=${segments[0]}`,
        entryType: "business",
        suggestedLabel: "YouTube Video",
        isValid: true,
        isSupported: true,
      };
    }

    if (segments.length > 0) {
      const first = segments[0];
      if (first.startsWith("@")) {
        const handle = first.replace(/^@/, "");
        return {
          platform: "youtube",
          normalizedUrl: `https://youtube.com/@${handle}`,
          entryType: "social",
          handle,
          suggestedLabel: `YouTube (@${handle})`,
          isValid: true,
          isSupported: true,
        };
      }
      if (first === "c" || first === "user" || first === "channel") {
        const name = segments[1] || first;
        return {
          platform: "youtube",
          normalizedUrl: `https://youtube.com/${first}/${segments[1] || ""}`,
          entryType: "social",
          handle: name,
          suggestedLabel: `YouTube (${name})`,
          isValid: true,
          isSupported: true,
        };
      }
    }
  }

  // 3. LinkedIn
  if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
    if (segments[0] === "in" && segments[1]) {
      const handle = segments[1];
      return {
        platform: "linkedin",
        normalizedUrl: `https://linkedin.com/in/${handle}`,
        entryType: "social",
        handle,
        suggestedLabel: `LinkedIn (${handle})`,
        isValid: true,
        isSupported: true,
      };
    }
    if (segments[0] === "company" && segments[1]) {
      const handle = segments[1];
      return {
        platform: "linkedin",
        normalizedUrl: `https://linkedin.com/company/${handle}`,
        entryType: "social",
        handle,
        suggestedLabel: `LinkedIn Company (${handle})`,
        isValid: true,
        isSupported: true,
      };
    }
  }

  // 4. GitHub
  if (hostname === "github.com") {
    const handle = segments[0];
    if (handle && !GITHUB_RESERVED.includes(handle.toLowerCase())) {
      const normalized = `https://github.com/${handle}`;
      return {
        platform: "github",
        normalizedUrl: normalized,
        entryType: "social",
        handle,
        suggestedLabel: `GitHub (@${handle})`,
        isValid: true,
        isSupported: true,
      };
    }
  }

  // 5. X / Twitter
  if (
    hostname === "twitter.com" ||
    hostname === "x.com" ||
    hostname.endsWith(".twitter.com")
  ) {
    const handle = segments[0] ? segments[0].replace(/^@/, "") : "";
    if (handle && !TWITTER_RESERVED.includes(handle.toLowerCase())) {
      const normalized = `https://x.com/${handle}`;
      return {
        platform: "twitter",
        normalizedUrl: normalized,
        entryType: "social",
        handle,
        suggestedLabel: `X (@${handle})`,
        isValid: true,
        isSupported: true,
      };
    }
  }

  // 6. Personal Website / Generic URL
  const cleaned = cleanUrl(urlObj);
  const domainLabel =
    hostname.charAt(0).toUpperCase() + hostname.slice(1);

  return {
    platform: "website",
    normalizedUrl: cleaned,
    entryType: "business",
    suggestedLabel: `${domainLabel} Website`,
    isValid: true,
    isSupported: true,
  };
}

/**
 * Parses raw text input containing one or more URLs, normalizes them,
 * and performs duplicate detection both within the batch and against existing profile links.
 */
export function parseProfileUrls(
  rawInput: string | string[],
  existingLinks: ExistingUserLinkRef[] = []
): ImportParseResult {
  let lines: string[] = [];

  if (Array.isArray(rawInput)) {
    lines = rawInput;
  } else if (typeof rawInput === "string") {
    // Split by newlines, commas, or spaces
    lines = rawInput
      .split(/[\r\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  const seenInBatch = new Set<string>();
  const existingSet = new Set<string>();
  const existingPlatformSet = new Set<string>();

  for (const item of existingLinks) {
    if (item.url) {
      const parsed = toValidUrl(item.url);
      if (parsed) existingSet.add(cleanUrl(parsed).toLowerCase());
    }
    if (item.platform) {
      existingPlatformSet.add(item.platform.toLowerCase());
    }
  }

  const suggestions: SuggestedLink[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let unsupportedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const identified = identifyPlatform(raw);
    const tempId = `import_${i}_${Date.now()}`;

    let isDuplicate = false;
    let duplicateReason: string | undefined = undefined;

    if (!identified.isValid) {
      unsupportedCount++;
      suggestions.push({
        id: tempId,
        originalUrl: raw,
        normalizedUrl: raw,
        platform: identified.platform,
        entryType: identified.entryType,
        handle: identified.handle,
        suggestedLabel: identified.suggestedLabel,
        isValid: false,
        isSupported: false,
        isDuplicate: false,
        errorMessage: identified.errorMessage,
        selected: false,
      });
      continue;
    }

    const normKey = identified.normalizedUrl.toLowerCase();

    // 1. Check duplicate within current input batch
    if (seenInBatch.has(normKey)) {
      isDuplicate = true;
      duplicateReason = "Duplicate URL in pasted list";
      duplicateCount++;
    } else {
      seenInBatch.add(normKey);

      // 2. Check duplicate against existing links in user's profile
      if (existingSet.has(normKey)) {
        isDuplicate = true;
        duplicateReason = "Already in your Linkle profile";
        duplicateCount++;
      } else if (
        identified.entryType === "social" &&
        identified.platform !== "website" &&
        existingPlatformSet.has(identified.platform.toLowerCase())
      ) {
        isDuplicate = true;
        duplicateReason = `You already have a ${identified.platform} social link configured`;
        duplicateCount++;
      }
    }

    if (identified.isValid && !isDuplicate) {
      validCount++;
    }

    suggestions.push({
      id: tempId,
      originalUrl: raw,
      normalizedUrl: identified.normalizedUrl,
      platform: identified.platform,
      entryType: identified.entryType,
      handle: identified.handle,
      suggestedLabel: identified.suggestedLabel,
      isValid: identified.isValid,
      isSupported: identified.isSupported,
      isDuplicate,
      duplicateReason,
      selected: identified.isValid && !isDuplicate, // pre-selected only if valid and not duplicate
    });
  }

  return {
    totalInput: lines.length,
    validCount,
    duplicateCount,
    unsupportedCount,
    suggestions,
  };
}

/**
 * Securely writes confirmed links to the database in a transaction.
 */
export async function commitImportedLinks(
  userId: string,
  confirmedItems: ConfirmImportItem[]
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!confirmedItems || confirmedItems.length === 0) {
    return { addedSocialCount: 0, addedBusinessCount: 0 };
  }

  const socialItems = confirmedItems.filter((i) => i.entryType === "social");
  const businessItems = confirmedItems.filter((i) => i.entryType === "business");

  let addedSocialCount = 0;
  let addedBusinessCount = 0;

  await prisma.$transaction(async (tx) => {
    // 1. Add Social Links
    if (socialItems.length > 0) {
      const currentSocialCount = await tx.socialLink.count({ where: { userId } });
      const socialCreates = socialItems
        .filter((s) => s.url && isSafeUrl(s.url))
        .map((s, idx) => ({
          userId,
          platform: s.platform || "website",
          url: s.url.trim(),
          label: s.label?.trim() || null,
          order: currentSocialCount + idx,
          isVisible: true,
        }));

      if (socialCreates.length > 0) {
        await tx.socialLink.createMany({ data: socialCreates });
        addedSocialCount = socialCreates.length;
      }
    }

    // 2. Add Business Links
    if (businessItems.length > 0) {
      const currentBusinessCount = await tx.businessLink.count({ where: { userId } });
      const businessCreates = businessItems
        .filter((b) => b.url && isSafeUrl(b.url))
        .map((b, idx) => ({
          userId,
          title: b.title?.trim() || b.label?.trim() || "My Website",
          url: b.url.trim(),
          description: b.description?.trim() || null,
          order: currentBusinessCount + idx,
          isVisible: true,
        }));

      if (businessCreates.length > 0) {
        await tx.businessLink.createMany({ data: businessCreates });
        addedBusinessCount = businessCreates.length;
      }
    }
  });

  if (user.username) {
    revalidateProfile(user.username);
  }

  return { addedSocialCount, addedBusinessCount };
}
