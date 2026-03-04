import React from "react";
import { TLocalizedString } from "@xstate-wizards/spells";

type TLocalizedInputProps = {
  activeLocale: string;
  value: TLocalizedString | null | undefined;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  onChange: (value: Record<string, string>) => void;
};

/**
 * LocalizedInput
 * A text input that always works with locale objects (Record<string, string>).
 * Shows a single input for the active locale. onChange always produces a locale object.
 */
export const LocalizedInput: React.FC<TLocalizedInputProps> = ({
  activeLocale,
  value,
  placeholder,
  multiline = false,
  rows = 3,
  onChange,
}) => {
  // Normalize value to a locale object
  const localeObj: Record<string, string> =
    value == null
      ? {}
      : typeof value === "string"
        ? { [activeLocale]: value }
        : value;

  const currentValue = localeObj[activeLocale] ?? "";

  const handleChange = (newText: string) => {
    onChange({ ...localeObj, [activeLocale]: newText });
  };

  if (multiline) {
    return (
      <textarea
        className="xw-sb__localized-input"
        value={currentValue}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }

  return (
    <input
      className="xw-sb__localized-input"
      type="text"
      value={currentValue}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};
