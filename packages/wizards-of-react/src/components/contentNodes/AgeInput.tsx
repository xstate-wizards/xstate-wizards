import React from "react";
import { InputRow } from "./InputRow";
import { TWizardSerializations } from "@xstate-wizards/spells";
import { Select as FallbackSelect } from "./fallbacks/Select";

type TAgeInputProps = {
  className?: string;
  dataTestId?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  value?: number | string;
  serializations: TWizardSerializations;
};

const roundToHundreth = (x): number => {
  const precision = 0.01;
  const y = +x + (precision === undefined ? 0.5 : precision / 2);
  return y - (y % (precision === undefined ? 1 : +precision));
};

export const AgeInput: React.FC<TAgeInputProps> = ({ className, dataTestId, disabled, onChange, value, ...props }) => {
  // Styled/Component Refs
  const Select = props.serializations?.components?.Select ?? FallbackSelect;
  // Handlers
  const updateMonth = (m: string) => {
    const newValue = Math.trunc(Number(value || 0)) + Number(m);
    onChange?.(newValue);
  };
  const updateYear = (y: string) => {
    const newValue = Number(y) + (Number(value || 0) % 1);
    onChange?.(newValue);
  };

  return (
    <InputRow className="xw__age-input">
      <Select
        className={className}
        value={Math.trunc(Number(value || 0))}
        disabled={disabled}
        onChange={(e) => updateYear(e.target.value)}
        data-test-id={dataTestId}
      >
        <option value="">---</option>
        {Array(100)
          .fill(null)
          .map((opt, i) => (
            <option key={i} value={i}>
              {i} Years
            </option>
          ))}
      </Select>
      <Select
        className={className}
        value={roundToHundreth(Number(value || 0) % 1)}
        disabled={disabled}
        onChange={(e) => updateMonth(e.target.value)}
      >
        {Array(12)
          .fill(null)
          .map((n, m) => (
            <option key={m} value={roundToHundreth(m / 12)}>
              {m} Months
            </option>
          ))}
      </Select>
    </InputRow>
  );
};
