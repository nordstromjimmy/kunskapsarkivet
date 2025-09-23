/**
 * Post domain types & helpers (no runtime deps)
 *
 * Keep this file as the single source of truth for Post shapes.
 * UI, repos, and actions should import types from here.
 */

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------

/** Canonical list of categories shown in the UI. */
export const categories = [
  "Slöjd & Hantverk",
  "Mat & Förvaring",
  "Livet på Landet",
  "Folktro & Berättelser",
  "Språk & Ord",
  "Hus & Hem",
] as const;

export const categoryColors: Record<string, { bg: string; text: string }> = {
  "Slöjd & Hantverk": { bg: "bg-rose-100", text: "text-rose-800" },
  "Mat & Förvaring": { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Livet på Landet": { bg: "bg-sky-100", text: "text-sky-800" },
  "Folktro & Berättelser": { bg: "bg-violet-100", text: "text-violet-800" },
  "Språk & Ord": { bg: "bg-amber-100", text: "text-amber-900" },
  "Hus & Hem": { bg: "bg-fuchsia-100", text: "text-fuchsia-800" },
};

/** Union type of all valid category strings. */
export type Category = (typeof categories)[number];

// -----------------------------------------------------------------------------
// Core types
// -----------------------------------------------------------------------------

/** ISO 8601 date string (e.g., "2025-09-22T18:45:00Z" or "2025-09-22"). */
export type ISODateString = string;

export type Post = {
  id: string;
  /**
   * Optional slug. Some posts may be drafts before a slug is assigned.
   * When present, it should be URL-safe (lowercase, hyphenated).
   */
  slug?: string;
  title: string;
  excerpt: string;
  /** Strongly typed category constrained to the categories list. */
  category: Category;
  author: string;
  /** ISO date string; store as UTC when possible. */
  date: ISODateString;
};

// -----------------------------------------------------------------------------
// Narrowing & small helpers (optional but handy)
// -----------------------------------------------------------------------------

/**
 * Type guard to check if a string is a valid Category.
 * Useful when accepting user input or DB values.
 */
export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}

/**
 * Normalize a category-like string into a valid Category if possible.
 * Returns undefined when it cannot map safely.
 */
export function toCategory(
  value: string | null | undefined
): Category | undefined {
  if (!value) return undefined;
  // Simple normalization: trim and match case-sensitively against canonical list.
  const trimmed = value.trim();
  return isCategory(trimmed) ? trimmed : undefined;
}

/**
 * Basic slugifier to keep slugs consistent.
 * (Feel free to replace with your existing util and re-export here.)
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Quick helper to format ISO dates for UI (keep i18n in the UI layer if needed). */
export function formatDate(
  iso: ISODateString,
  locale = "sv-SE",
  opts?: Intl.DateTimeFormatOptions
) {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...opts,
  });
}

/**
 * Minimal constructor with a few guardrails.
 * Use in places where you assemble a Post from form/DB fragments.
 */
export function makePost(
  input: Omit<Post, "slug" | "category"> & {
    slug?: string;
    category: string;
  }
): Post {
  const category = toCategory(input.category);
  if (!category) {
    throw new Error(`Invalid category: ${input.category}`);
  }
  const slug = input.slug ? slugify(input.slug) : undefined;

  return {
    ...input,
    category,
    slug,
  };
}
