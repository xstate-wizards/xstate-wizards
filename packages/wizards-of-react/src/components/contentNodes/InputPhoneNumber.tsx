import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { COUNTRY_CALLING_CODES, parseTel } from "tel-fns";
import { Input } from "./fallbacks/Input";
import { Select } from "./fallbacks/Select";
import { TComponentSize } from "./fallbacks/types";

type TInputPhoneNumberProps = {
  disabled?: boolean;
  isValid?: boolean;
  onChange: (value: string, validations: Record<string, boolean>) => void;
  size?: TComponentSize;
  value: string;
  defaultCountryCode?: number;
  allowSelectingCountryCode?: boolean;
  "data-test-label"?: string;
  "data-wiz-label"?: string;
};

export const InputPhoneNumber: React.FC<TInputPhoneNumberProps> = ({
  allowSelectingCountryCode,
  defaultCountryCode = 1,
  disabled,
  isValid,
  onChange,
  size,
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
    <StyledInputPhoneNumberWrapper
      data-test-label={props["data-test-label"]} // DEPRECATED
      data-wiz-label={props["data-wiz-label"]}
    >
      {allowSelectingCountryCode === false ? (
        <StyledUSCode>+{defaultCountryCode}</StyledUSCode>
      ) : (
        <Select
          disabled={disabled}
          //isValid={isValid}
          // @ts-ignore
          size={size}
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
      <StyledInputPhoneNumber
        type="tel"
        // @ts-ignore
        size={size}
        placeholder={countryCode === "+1" ? "(###) ###-####" : "### ### ###"}
        value={phoneNumberDisplay}
        onChange={handleOnChange}
      />
    </StyledInputPhoneNumberWrapper>
  );
};

export const StyledInputPhoneNumberWrapper = styled.div`
  display: flex;
  height: auto;
  & > select,
  & > input {
    flex-grow: 1;
    margin: 0;
  }
  & > select {
    max-width: 120px;
    margin: 0;
    margin-bottom: 0 !important; // YIKES
  }
`;

export const StyledInputPhoneNumber = styled(Input)`
  display: flex;
  height: auto;
  & > select,
  & > input {
    flex-grow: 1;
    margin: 0;
  }
  & > select {
    max-width: 120px;
    margin: 0;
    margin-bottom: 0 !important; // YIKES
  }
`;

const StyledUSCode = styled.span`
  display: flex;
  align-items: center;
  font-weight: normal;
  white-space: nowrap;
  font-size: 16px;
  min-height: 1.2em;
  padding: 0px 16px;
`;
