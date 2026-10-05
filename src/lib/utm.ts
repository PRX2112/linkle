/**
 * Safe UTM URL Builder & Parameter Utility
 *
 * Rules:
 * 1. Only allow http: and https: protocols (NEVER javascript:, data:, vbscript:, file:, etc.)
 * 2. Preserve existing query parameters and hash fragments
 * 3. Safely encode all parameter values
 * 4. Never mutate the base URL unless UTM tracking is explicitly enabled
 */

export interface UtmConfig {
  utmEnabled?: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

export interface UtmBuildResult {
  url: string;
  isValid: boolean;
  error?: string;
}

const FORBIDDEN_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
];

/**
 * Validates whether a given URL string uses a safe web protocol (http or https).
 */
export function isSafeUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  // Check forbidden schemes
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) return false;
  }

  // Prevent control characters and carriage return injections
  if (/[\r\n\t\0]/.test(trimmed)) return false;

  try {
    const urlObj = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    );
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Generates the destination URL safely with UTM parameters.
 * Preserves existing query parameters and encodes all parameters correctly.
 */
export function buildUtmUrl(baseUrl: string, config?: UtmConfig | null): UtmBuildResult {
  if (!baseUrl || typeof baseUrl !== "string") {
    return { url: "", isValid: false, error: "URL cannot be empty." };
  }

  const trimmed = baseUrl.trim();

  // Security check: Never allow javascript: or unsafe URL schemes
  if (!isSafeUrl(trimmed)) {
    return {
      url: trimmed,
      isValid: false,
      error: "Unsafe URL scheme detected. Only http:// and https:// URLs are supported.",
    };
  }

  let urlObj: URL;
  try {
    const hasProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://");
    urlObj = new URL(hasProtocol ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      url: trimmed,
      isValid: false,
      error: "Invalid URL format.",
    };
  }

  // If UTM tracking is not enabled or no config provided, return validated base URL
  if (!config?.utmEnabled) {
    return {
      url: urlObj.toString(),
      isValid: true,
    };
  }

  // Apply non-empty UTM parameters while preserving existing query parameters
  const utmMap: Record<string, string | null | undefined> = {
    utm_source: config.utmSource,
    utm_medium: config.utmMedium,
    utm_campaign: config.utmCampaign,
    utm_content: config.utmContent,
    utm_term: config.utmTerm,
  };

  let hasAnyUtm = false;
  for (const [key, val] of Object.entries(utmMap)) {
    if (val && typeof val === "string" && val.trim().length > 0) {
      urlObj.searchParams.set(key, val.trim());
      hasAnyUtm = true;
    }
  }

  return {
    url: urlObj.toString(),
    isValid: true,
  };
}

/**
 * Extracts UTM parameters from any URL string.
 */
export function extractUtmParams(urlStr?: string | null): UtmConfig {
  if (!urlStr || typeof urlStr !== "string") {
    return { utmEnabled: false };
  }

  try {
    const hasProtocol = urlStr.startsWith("http://") || urlStr.startsWith("https://");
    const parsed = new URL(hasProtocol ? urlStr : `https://${urlStr}`);
    
    const utmSource = parsed.searchParams.get("utm_source");
    const utmMedium = parsed.searchParams.get("utm_medium");
    const utmCampaign = parsed.searchParams.get("utm_campaign");
    const utmContent = parsed.searchParams.get("utm_content");
    const utmTerm = parsed.searchParams.get("utm_term");

    const hasUtm = Boolean(utmSource || utmMedium || utmCampaign || utmContent || utmTerm);

    return {
      utmEnabled: hasUtm,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      utmTerm: utmTerm || null,
    };
  } catch {
    return { utmEnabled: false };
  }
}
