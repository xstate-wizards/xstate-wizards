import React from "react";
import { $TSFixMe } from "@xstate-wizards/spells";
import { Input as FallbackInput } from "./fallbacks/Input";

type TCurrencyInputProps = $TSFixMe;

export const CurrencyInput: React.FC<TCurrencyInputProps> = ({
  className,
  dataTestId,
  disabled,
  onChange,
  placeholder,
  value,
  ...props
}) => {
  // Styled/Component Refs
  const Input = props.serializations?.components?.Input ?? FallbackInput;
  // Handlers
  return (
    <div className="xw--currency-input">
      <span className="xw--currency-symbol">$</span>
      <Input
        type="text"
        className={className}
        placeholder={placeholder || 0}
        value={value}
        disabled={disabled}
        onChange={onChange}
        data-test-id={dataTestId}
        data-test-label={props["data-test-label"]}
        data-wiz-label={props["data-wiz-label"]}
      />
    </div>
  );
};
