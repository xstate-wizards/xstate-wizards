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

const DEFAULT_COUNTRY_CODE = "+1";

//if someone has +1 for example, this might non-deterministically return US or CA. But I'm considering that acceptable
//since this only happens if someone already had already filled out this input and coming back to revisit their answer,
//in which case if they notice the mistake they'll change it, and if they don't it's harmless
const findCountryFromCountryCode = (countryCode: number) => {
  return Object.keys(COUNTRY_CALLING_CODES)
    .sort()
    .sort((a) => (a === "US" ? -1 : 0))
    .find((key) => COUNTRY_CALLING_CODES[key] === countryCode);
};

//("US", "+1") => "US +1"
const getAnnotatedCountryCode = (country: string, countryCode: string) => {
  return `${country} ${countryCode}`;
};

//("US +1") => "+1"
const getCountryCodeFromAnnotatedCountryCode = (annotatedCountryCode: string) => {
  return annotatedCountryCode.split(" ")?.[1];
};

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

  const prefilledCountryCode = parseTel(value).getCountryCode || DEFAULT_COUNTRY_CODE;

  const prefilledCountry = findCountryFromCountryCode(prefilledCountryCode);

  const prefilledAnnotatedCountryCode = getAnnotatedCountryCode(prefilledCountry, prefilledCountryCode);

  const [annotatedCountryCode, setAnnotatedCountryCode] = useState(prefilledAnnotatedCountryCode);

  const [phoneNumber, setPhoneNumber] = useState(parseTel(value)?.getNationalNumber ?? "");
  // --- onChange
  useEffect(() => {
    if (annotatedCountryCode && phoneNumber) {
      const extractedCountryCode = getCountryCodeFromAnnotatedCountryCode(annotatedCountryCode);
      const cleanedPhoneNumber = `${extractedCountryCode}${phoneNumber}`;
      const parsed = parseTel(cleanedPhoneNumber);
      console.log("cleaned phone number", cleanedPhoneNumber);
      // --- If a valid number, push back change. Should this be looser and just use isPossibleNumber
      if (parsed.isPossibleNumber) {
        console.log("is parsed possible");
        onChange(cleanedPhoneNumber);
        // --- otherwise clear
      } else {
        onChange(null);
      }
    }
  }, [annotatedCountryCode, phoneNumber]);

  // RENDER
  return (
    <StyledInputPhoneNumber>
      <Select
        disabled={disabled}
        size={size}
        value={annotatedCountryCode}
        onChange={(e) => setAnnotatedCountryCode(e.target.value)}
      >
        {Object.keys(COUNTRY_CALLING_CODES)
          .sort()
          .sort((a) => (a === "US" ? -1 : 0))
          .map((country) => {
            const annotatedCountryCode = getAnnotatedCountryCode(country, COUNTRY_CALLING_CODES[country]);
            return (
              <option key={annotatedCountryCode} value={annotatedCountryCode}>
                {annotatedCountryCode}
              </option>
            );
          })}
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
