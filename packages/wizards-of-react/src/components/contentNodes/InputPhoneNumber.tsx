// TODO: Refactor all this into its own package prob
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { COUNTRY_CALLING_CODES, parseTel } from "tel-fns";
import { $TSFixMe } from "@xstate-wizards/spells";
import { logger } from "../../wizardDebugger";

type TInputPhoneNumberProps =
  | $TSFixMe
  | {
      disabled?: boolean;
      isValid?: boolean;
      onChange: (value: string) => void;
      size?: string;
      value?: string;
    };

const FallbackInput = styled.input``;
const FallbackSelect = styled.select``;

export const InputPhoneNumber: React.FC<TInputPhoneNumberProps> = ({
  disabled,
  onChange,
  size,
  value,
  dataTestId,
  ...props
}) => {
  // SETUP
  // --- styled/component refs
  const Input = props.serializations?.components?.Input ?? FallbackInput;
  const Select = props.serializations?.components?.Select ?? FallbackSelect;
  // --- state
  const [countryCode, setCountryCode] = useState(`+${parseTel(value).getCountryCode ?? "1"}`);

  const [phoneNumber, setPhoneNumber] = useState(parseTel(value)?.getNationalNumber ?? "");
  // --- onChange
  useEffect(() => {
    if (countryCode && phoneNumber) {
      const parsed = parseTel(`${countryCode}${phoneNumber}`);
      // --- If a valid number, push back change. Should this be looser and just use isPossibleNumber
      if (parsed.isPossibleNumber) {
        onChange(`${countryCode}${phoneNumber}`);
        // --- otherwise clear
      } else {
        onChange(null);
      }
    }
  }, [countryCode, phoneNumber]);

  const uniqueCountryCodes = Array.from(new Set(Object.values(COUNTRY_CALLING_CODES)));

  // RENDER
  return (
    <StyledInputPhoneNumber>
      <Select disabled={disabled} size={size} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
        {uniqueCountryCodes
          .sort()
          .sort((a) => (a === "+1" ? -1 : 0))
          .map((countryCode) => (
            <option key={countryCode} value={countryCode}>
              {countryCode}
            </option>
          ))}
      </Select>
      <Input
        disabled={disabled}
        size={size}
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        data-test-id={dataTestId}
        data-test-label={props["data-test-label"]}
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
