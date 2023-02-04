import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { COUNTRY_CALLING_CODES, parseTel } from "tel-fns";
import { Input } from "./fallbacks/Input";
import { Select } from "./fallbacks/Select";
import { TComponentSize } from "./fallbacks/types";

type TInputPhoneNumberProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
  size?: TComponentSize;
  value: string;
};

export const InputPhoneNumber: React.FC<TInputPhoneNumberProps> = ({ disabled, onChange, size, value }) => {
  const [countryCode, setCountryCode] = useState(`+${parseTel(value).getCountryCode ?? "1"}`);
  const [phoneNumber, setPhoneNumber] = useState(parseTel(value)?.getNationalNumber ?? "");
  useEffect(() => {
    if (countryCode && phoneNumber) {
      const parsed = parseTel(`${countryCode}${phoneNumber}`);
      // If a valid number, push back change. Should this be looser and just use isPossibleNumber
      if (parsed.isPossibleNumber) onChange(`${countryCode}${phoneNumber}`);
    }
  }, [countryCode, phoneNumber]);

  // RENDER
  return (
    <StyledInputPhoneNumber>
      {/* @ts-ignore */}
      <Select disabled={disabled} size={size} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
        {Object.keys(COUNTRY_CALLING_CODES)
          .sort()
          .sort((a) => (a === "US" ? -1 : 0))
          .map((country) => (
            // @ts-ignore
            <option key={country} value={COUNTRY_CALLING_CODES[country]}>
              {/* @ts-ignore */}
              {country} {COUNTRY_CALLING_CODES[country]}
            </option>
          ))}
      </Select>
      <Input
        // @ts-ignore
        size={size}
        disabled={disabled}
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
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
