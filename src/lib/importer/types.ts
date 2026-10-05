export type SupportedImportPlatform =
  | "instagram"
  | "youtube"
  | "linkedin"
  | "github"
  | "twitter"
  | "website";

export type ImportEntryType = "social" | "business";

export interface SuggestedLink {
  id: string; // Transient ID for UI checkbox selection
  originalUrl: string;
  normalizedUrl: string;
  platform: SupportedImportPlatform;
  entryType: ImportEntryType;
  handle?: string;
  suggestedLabel: string;
  isValid: boolean;
  isSupported: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
  errorMessage?: string;
  selected: boolean;
}

export interface ExistingUserLinkRef {
  platform?: string;
  url: string;
}

export interface ImportParseResult {
  totalInput: number;
  validCount: number;
  duplicateCount: number;
  unsupportedCount: number;
  suggestions: SuggestedLink[];
}

export interface ConfirmImportItem {
  entryType: ImportEntryType;
  platform?: string;
  url: string;
  label?: string;
  title?: string;
  description?: string;
}
