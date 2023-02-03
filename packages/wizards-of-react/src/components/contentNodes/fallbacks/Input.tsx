import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";
import { InputSizesCSS } from "./InputSizes.css";
import { InputStatesCSS } from "./InputStates.css";

type TInputCSS = {
  width?: string;
};

export const InputCSS = css<TInputCSS>`
  width: ${(props) => props.width || "100%"};
  outline: none;
  padding: 0.8em 1em;
  font-size: 0.9em;
  border: 1px solid ${wizardTheme.colors.white[500]};
  border-radius: 4px;
  &::placeholder {
    color: ${wizardTheme.colors.gray[800]};
  }
  &[type="checkbox"] {
    margin: 0;
    padding: 0;
    max-height: 18px;
    max-width: 18px;
  }
  ${InputStatesCSS}
  ${InputSizesCSS}
`;

export const Input = styled.input`
  ${InputCSS}
`;
