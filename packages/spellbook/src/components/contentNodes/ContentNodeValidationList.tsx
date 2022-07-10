import React from "react";
import styled from "styled-components";
import { ValdidationTypes } from "@xstate-wizards/spells";

export const ContentNodeValidationList = ({ onChange, validations, value }) => {
  return (
    <StyledContentNodeValidationList>
      <select
        onChange={(e) => {
          onChange((value ?? []).concat(e.target.value));
        }}
      >
        <option value="">--</option>
        <optgroup label="Base Validations">
          {Object.values(ValdidationTypes)
            ?.filter((v) => !value?.includes(v))
            ?.sort()
            ?.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
        </optgroup>
        <optgroup label="Custom Validations">
          {[...Object.keys(validations ?? {})]
            ?.filter((v) => !value?.includes(v))
            ?.sort()
            ?.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
        </optgroup>
      </select>
      <div className="active-validations">
        {value?.map((v) => (
          <small key={v}>
            {v}{" "}
            <span
              onClick={() => {
                onChange((value ?? []).filter((validation) => validation !== v));
              }}
            >
              ❌
            </span>
          </small>
        ))}
      </div>
    </StyledContentNodeValidationList>
  );
};

const StyledContentNodeValidationList = styled.div`
  display: flex;
  select {
    width: 100%;
    max-width: 120px;
  }
  .active-validations {
    display: flex;
    small {
      margin-left: 6px;
    }
  }
`;
