/**
 * Typed error for non-2xx API responses.
 * Backend format: { message?, errors? }
 */
export class ApiError extends Error {
  readonly errors?: string[];
  readonly status?: number;

  constructor(
    message: string,
    errors?: string[],
    status?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
    this.status = status;
  }
}

/** Generic fallback when error origin is unknown. */
const FALLBACK_MESSAGE = "Bir hata oluştu.";

/**
 * Convert API or other errors into a single user-friendly message.
 * Use for toast.error() and inline error display. Keeps format consistent.
 */
export function toUserFriendlyMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return FALLBACK_MESSAGE;
}
