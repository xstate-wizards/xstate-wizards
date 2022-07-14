import React from "react";
import styled from "styled-components";
import { $TSFixMe } from "@xstate-wizards/spells";
import { defaultTheme } from "../../theme";

const FallbackInput = styled.input``;

export const CurrencyInput: React.FC<$TSFixMe> = ({
  dataTestId,
  disabled,
  isValid,
  placeholder,
  size,
  value,
  onChange,
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
    color: ${(props) => defaultTheme.colors.gray[900]};
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
