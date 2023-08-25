import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { COUNTRY_CALLING_CODES, parseTel } from "tel-fns";
import { Input } from "./fallbacks/Input";
import { Select } from "./fallbacks/Select";
import { TComponentSize } from "./fallbacks/types";

type TInputPhoneNumberProps = {
  disabled?: boolean;
  isValid?: boolean;
  onChange: (value: string) => void;
  size?: TComponentSize;
  value: string;
  allowCountryCode?: boolean;
};

export const InputPhoneNumber: React.FC<TInputPhoneNumberProps> = ({
  disabled,
  isValid,
  onChange,
  size,
  value,
  allowCountryCode = true,
}) => {
  const [countryCode, setCountryCode] = useState(`+${parseTel(value).getCountryCode ?? "1"}`);
  const [phoneNumber, setPhoneNumber] = useState(parseTel(value)?.getNationalNumber ?? "");
  useEffect(() => {
    if (countryCode && phoneNumber) {
      const parsed = parseTel(`${countryCode}${phoneNumber}`);
      logger.info(parsed);
      // If a valid number, push back change. Should this be looser and just use isPossibleNumber
      if (parsed.isValidNumber) {
        onChange(`${countryCode}${phoneNumber}`);
      } else {
        // We should still push back a value if not, because a user can continue to type a number and context doesn't update when its invalid
        onChange("");
      }
    }
  }, [countryCode, phoneNumber]);

  // RENDER
  return (
    <StyledInputPhoneNumber>
      {allowCountryCode ? (
        <Select
          disabled={disabled}
          isValid={isValid}
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
      ) : (
        <StyledUSCode>+1</StyledUSCode>
      )}
      <Input
        // @ts-ignore
        size={size}
        disabled={disabled}
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        isValid={isValid}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
    </StyledInputPhoneNumber>
  );
};

export const StyledInputPhoneNumber = styled.div`
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
