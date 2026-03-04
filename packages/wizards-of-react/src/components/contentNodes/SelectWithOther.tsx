import React, { useEffect, useCallback, useState, useRef } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { Input as FallbackInput } from "./fallbacks/Input";
import { Select as FallbackSelect } from "./fallbacks/Select";

const OTHER_VALUE = "__OTHER__";

export const SelectWithOther = ({ onChange, children, ...props }) => {
  // Styled/Component Refs
  const Input = props.serializations?.components?.Input ?? FallbackInput;
  const Select = props.serializations?.components?.Select ?? FallbackSelect;
  // State
  const selectRef = useRef<HTMLSelectElement>();
  const [showOther, setShowOther] = useState(false);
  useEffect(() => {
    if (selectRef.current) {
      if (!Array.prototype.some.call(selectRef.current.options, (opt) => opt.value === String(props.value))) {
        // if the current value does not exist within <options />,
        // we should select "Other" and show the value input
        setShowOther(true);
      }
    }
  }, [selectRef.current]);

  const onChangeSelectHandler = useCallback(
    (e) => {
      if (e.target.value === OTHER_VALUE) {
        setShowOther(true);
      } else {
        setShowOther(false);
        onChange(e);
      }
    },
    [setShowOther, onChange]
  );

  return (
    <div className="xw__select-with-other">
      <Select ref={selectRef} onChange={onChangeSelectHandler} {...props} value={showOther ? OTHER_VALUE : props.value}>
        {children}
        <option value={OTHER_VALUE}>Other:</option>
      </Select>
      {showOther && props.type === "currency" && <CurrencyInput onChange={onChange} {...props} />}
      {showOther && props.type !== "currency" && (
        <Input onChange={onChange} placeholder={props.type === "number" ? "123..." : "Aa..."} {...props} />
      )}
    </div>
  );
};
