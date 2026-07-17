import { revalidateTag } from "next/cache";

/**
 * Invalidates the tag-based edge cache for a specific user's public profile page.
 * Enforces a normalized lowercase format for username consistency.
 * 
 * @param username The public username handle of the user to revalidate.
 */
export function revalidateProfile(username: string | null | undefined) {
  if (username) {
    const normalized = username.toLowerCase().trim();
    try {
      revalidateTag(`user-profile-${normalized}`);
    } catch (error) {
      console.error(`Failed to revalidate cache tag for user-profile-${normalized}:`, error);
    }
  }
}
