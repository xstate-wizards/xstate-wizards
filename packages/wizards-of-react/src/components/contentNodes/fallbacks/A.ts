import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";
import { TypographyCSS } from "./Typography.css";

export const ACSS = css`
  text-decoration: none;
  &,
  &:visited,
  &:active {
    color: ${wizardTheme.colors.brand[500]};
  }
  &:hover {
    color: ${wizardTheme.colors.brand[100]};
    text-decoration: none;
    cursor: pointer;
  }
`;

export const A = styled.a`
  ${ACSS}
  ${TypographyCSS}
`;
