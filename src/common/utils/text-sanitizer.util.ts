/**
 * Sanitizes text for database insertion by removing null bytes,
 * hidden control characters, and normalizing whitespace.
 */
export function sanitizeTextForDatabase(value: string | undefined | null): string {
  if (!value) return "";

  return value
    .replace(/\0/g, "") // Remove null bytes
    .replace(/\u0000/g, "") // Remove unicode null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove ASCII control characters
    .replace(/\uFFFD/g, "") // Remove PDF replacement characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
