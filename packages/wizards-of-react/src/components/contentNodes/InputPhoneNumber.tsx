import React, { useEffect, useState } from "react";
import { COUNTRY_CALLING_CODES, parseTel } from "tel-fns";
import { Input } from "./fallbacks/Input";
import { Select } from "./fallbacks/Select";

type TInputPhoneNumberProps = {
  className?: string;
  disabled?: boolean;
  onChange: (value: string, validations: Record<string, boolean>) => void;
  value: string;
  defaultCountryCode?: number;
  allowSelectingCountryCode?: boolean;
  "data-wiz-label"?: string;
};

export const InputPhoneNumber: React.FC<TInputPhoneNumberProps> = ({
  allowSelectingCountryCode,
  className,
  defaultCountryCode = 1,
  disabled,
  onChange,
  value,
  ...props
}) => {
  const [countryCode, setCountryCode] = useState(`+${parseTel(value).getCountryCode ?? `${defaultCountryCode}`}`);
  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState(parseTel(value)?.getNationalNumber ?? "");

  // Format the input value as '(xxx) xxx-xxxx'
  const handleOnChange = (event) => {
    const newValue = event.target.value;
    // Numbers cannot exceed 20? digits.
    let cleanValue = newValue.replace(/\D/g, "").substring(0, 20);
    // Only do this formatting for US phone numbers.
    if (countryCode === "+1") {
      // US Phone numbers only have up to 10 digits.
      cleanValue = cleanValue.substring(0, 10);
      let formattedValue = "";
      for (let i = 0; i < cleanValue.length; i++) {
        if (i === 0) {
          formattedValue += "(";
        }
        if (i === 3) {
          formattedValue += ") ";
        }
        if (i === 6) {
          formattedValue += "-";
        }
        formattedValue += cleanValue[i];
      }
      setPhoneNumberDisplay(formattedValue);
    } else {
      setPhoneNumberDisplay(cleanValue);
    }
    // Update internal values (display is so we can format for and re-iterate US phone number flow)
    onChange(`${countryCode}${cleanValue}`, { isValidNumber: parseTel(`${countryCode}${cleanValue}`).isValidNumber });
  };

  return (
    <div
      className="xw__phone-input-wrapper"
      data-wiz-label={props["data-wiz-label"]}
    >
      {allowSelectingCountryCode === false ? (
        <span className="xw__phone-us-code">+{defaultCountryCode}</span>
      ) : (
        <Select
          className={className}
          disabled={disabled}
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          {Object.keys(COUNTRY_CALLING_CODES)
            .sort()
            .sort((a) => (a === "US" ? -1 : 0))
            .map((country) => (
              <option key={country} value={COUNTRY_CALLING_CODES[country]}>
                {country} {COUNTRY_CALLING_CODES[country]}
              </option>
            ))}
        </Select>
      )}
      <Input
        className={`xw__phone-input ${className || ""}`}
        type="tel"
        placeholder={countryCode === "+1" ? "(###) ###-####" : "### ### ###"}
        value={phoneNumberDisplay}
        onChange={handleOnChange}
      />
    </div>
  );
};
