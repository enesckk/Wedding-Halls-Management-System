/**
 * Simple HTML escaping for XSS protection.
 * Escapes HTML special characters to prevent XSS attacks.
 * 
 * @param input - User-generated text that may contain HTML/JS
 * @returns Sanitized text safe for rendering
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
