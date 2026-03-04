import jsonLogic from "json-logic-js";
import { TLocalizedString } from "../types";

/**
 * Resolves a localized string to a plain string.
 * - If value is a plain string, returns it directly.
 * - If value is a Record<locale, string>, picks the locale match or first value as fallback.
 * - If context is provided, interpolates {path} tokens using json-logic var.
 */
export function resolveText(
  value: TLocalizedString | null | undefined,
  locale?: string,
  context?: any
): string {
  if (value == null) return "";
  // Pick the raw string
  const str =
    typeof value === "string"
      ? value
      : (locale && value[locale]) ?? Object.values(value)[0] ?? "";
  // Interpolate {path} tokens if context provided
  if (!context) return str;
  return str.replace(/\{([^}]+)\}/g, (match, path) => {
    try {
      const result = jsonLogic.apply({ var: path }, context);
      return result != null ? String(result) : match;
    } catch {
      return match;
    }
  });
}
