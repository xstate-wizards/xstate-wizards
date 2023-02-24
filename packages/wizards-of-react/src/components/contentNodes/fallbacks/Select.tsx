import styled from "styled-components";
import { wizardTheme } from "../../../theme";
import { InputSizesCSS } from "./InputSizesCSS";
import { InputStatesCSS, TInputStatesCSS } from "./InputStatesCSS";
import { TComponentSize } from "./types";

type TSelectCSS = { size?: TComponentSize; width?: string } & TInputStatesCSS;

export const Select = styled.select<TSelectCSS>`
  width: ${(props) => props.width || "100%"};
  outline: none;
  padding: 0.8em 1em;
  font-size: 0.9em;
  border: 1px solid ${wizardTheme.colors.white[500]};
  border-bottom: 2px solid ${wizardTheme.colors.white[300]};
  appearance: none;
  border-radius: 4px;
  background: ${wizardTheme.colors.white[900]};
  &::placeholder {
    color: ${wizardTheme.colors.gray[900]};
  }
  background-image: linear-gradient(45deg, transparent 50%, ${wizardTheme.colors.white[300]} 50%),
    linear-gradient(135deg, ${wizardTheme.colors.white[300]} 50%, transparent 50%),
    linear-gradient(to right, ${wizardTheme.colors.white[300]}, ${wizardTheme.colors.white[300]});
  background-position: calc(100% - 20px) calc(1.25em), calc(100% - 15px) calc(1.25em), calc(100% - 2.5em) 0.5em;
  background-size: 5px 5px, 5px 5px, 1px 2em;
  background-repeat: no-repeat;
  ${InputStatesCSS}
  ${InputSizesCSS}
`;
