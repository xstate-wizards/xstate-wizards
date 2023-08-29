import React from "react";
import styled from "styled-components";
import { $TSFixMe } from "@xstate-wizards/spells";
import { wizardTheme } from "../../theme";
import { Input as FallbackInput } from "./fallbacks/Input";

type TCurrencyInputProps = $TSFixMe;

export const CurrencyInput: React.FC<TCurrencyInputProps> = ({
  dataTestId,
  disabled,
  isValid,
  onChange,
  placeholder,
  size,
  value,
  ...props
}) => {
  // Styled/Component Refs
  const Input = props.serializations?.components?.Input ?? FallbackInput;
  // Handlers
  return (
    <StyledCurrencyInput>
      <CurrencySymbol>$</CurrencySymbol>
      <Input
        type="text"
        placeholder={placeholder || 0}
        value={value}
        size={size}
        disabled={disabled}
        isValid={isValid}
        onChange={onChange}
        data-test-id={dataTestId}
        data-test-label={props["data-test-label"]}
      />
    </StyledCurrencyInput>
  );
};

const StyledCurrencyInput = styled.div`
  position: relative;
  input {
    outline: 0;
    position: relative;
    z-index: 1;
    padding-left: 1.4em;
  }
  span {
    color: ${(props) => wizardTheme.colors.gray[900]};
  }
`;

const CurrencySymbol = styled.span`
  position: absolute;
  top: 50%;
  z-index: 2;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 0.75em;
  font-size: 13px;
`;
