import styled from "styled-components";
import { wizardTheme } from "../../../theme";
import { InputSizesCSS } from "./InputSizes.css";
import { InputStatesCSS } from "./InputStates.css";

type TTextareaCSS = {
  width?: string;
};

export const Textarea = styled.textarea<TTextareaCSS>`
  width: ${(props) => props.width || "100%"};
  outline: none;
  padding: 0.8em 1em;
  font-size: 0.9em;
  border: 1px solid ${wizardTheme.colors.white[300]};
  border-bottom: 2px solid ${wizardTheme.colors.white[300]};
  border-radius: 4px;
  &::placeholder {
    color: ${wizardTheme.colors.gray[900]};
  }
  ${InputStatesCSS}
  ${InputSizesCSS}
`;
