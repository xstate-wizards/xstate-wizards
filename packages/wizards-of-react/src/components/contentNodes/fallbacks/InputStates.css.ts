import { css } from "styled-components";
import { wizardTheme } from "../../../theme";

export type TInputStatesCSS = {
  disabled?: boolean;
  isValid?: boolean;
};

export const InputStatesCSS = css<TInputStatesCSS>`
  ${(props) => {
    if (props.disabled) {
      return css`
        background: ${wizardTheme.colors.white[700]};
      `;
    }
  }}
  ${(props) => {
    if (props.isValid === false) {
      return css`
        box-shadow: inset 0 -1px 1px ${wizardTheme.colors.red[500]};
        color: ${wizardTheme.colors.red[500]};
      `;
    }
  }}
`;
