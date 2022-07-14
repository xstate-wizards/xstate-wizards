import React, { useEffect, useCallback, useState, useRef } from "react";
import styled from "styled-components";
import { defaultTheme } from "../../theme";
import { CurrencyInput } from "./CurrencyInput";

const OTHER_VALUE = "__OTHER__";

const FallbackInput = styled.input``;
const FallbackSelect = styled.select``;

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
    <Container>
      <Select ref={selectRef} onChange={onChangeSelectHandler} {...props} value={showOther ? OTHER_VALUE : props.value}>
        {children}
        <option value={OTHER_VALUE}>Other:</option>
      </Select>
      {showOther && props.type === "currency" && <CurrencyInput onChange={onChange} {...props} />}
      {showOther && props.type !== "currency" && (
        <Input onChange={onChange} placeholder={props.type === "number" ? "123..." : "Aa..."} {...props} />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  @media (max-width: ${(props) => defaultTheme.breakpoints[500]}) {
    flex-direction: column;
  }
  & > *:first-child {
    flex-grow: 0;
    flex-shrink: 2;
  }
  & > *:nth-child(2) {
    flex-grow: 1;

    @media (min-width: ${(props) => defaultTheme.breakpoints[500]}) {
      margin-left: 20px;
    }
  }
`;
