import { css } from "styled-components";
import { wizardTheme } from "@xstate-wizards/wizards-of-react";

export const SharedCrystalBallCSS = css`
  font-family: sans-serif;
  button {
    background: none;
    border-radius: 4px;
    border: 1px solid ${wizardTheme.colors.gray[900]};
    color: ${wizardTheme.colors.gray[500]};
    cursor: pointer;
  }
`;
