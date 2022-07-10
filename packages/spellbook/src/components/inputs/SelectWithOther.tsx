import React, { useEffect, useCallback, useState, useRef } from "react";
import styled from "styled-components";

const OTHER_VALUE = "__OTHER__";

export const SelectWithOther = ({ onChange, otherLabel, children, ...props }) => {
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
      <select ref={selectRef} onChange={onChangeSelectHandler} {...props} value={showOther ? OTHER_VALUE : props.value}>
        {children}
        <option value={OTHER_VALUE}>{otherLabel ?? "Other"}:</option>
      </select>
      {showOther && (
        <>
          <input onChange={onChange} placeholder={props.type === "number" ? "123..." : "Aa..."} {...props} />
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  select {
    width: 30%;
    max-width: 30%;
  }
  input {
    flex-grow: 1;
  }
`;
