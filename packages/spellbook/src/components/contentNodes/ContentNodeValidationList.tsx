import React from "react";
import { ValdidationTypes } from "@xstate-wizards/spells";

export const ContentNodeValidationList = ({ onChange, validations, value }) => {
  return (
    <div className="xw-sb__validation-list">
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
    </div>
  );
};