import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";
import { TypographyCSS } from "./Typography.css";

export const H0CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 60px;
  font-weight: 800;
  line-height: 60px;
  letter-spacing: -0.5px;
  @media screen and (max-width: 45em) {
    font-size: 44px;
    line-height: 140%;
  }
`;

export const H0 = styled.h1`
  ${H0CSS}
  ${TypographyCSS}
`;

export const H1CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 52px;
  font-weight: 800;
  line-height: 58px;
  letter-spacing: -0.5px;
  @media screen and (max-width: 45em) {
    font-size: 40px;
    line-height: 140%;
  }
`;

export const H1 = styled.h1`
  ${H1CSS}
  ${TypographyCSS}
`;

export const H2CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 40px;
  line-height: 48px;
  font-weight: 800;
  @media screen and (max-width: 45em) {
    font-size: 32px;
    line-height: 140%;
  }
`;

export const H2 = styled.h2`
  ${H2CSS}
  ${TypographyCSS}
`;

export const H3CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 2em;
  line-height: 45px;
  font-weight: 600;
  @media screen and (max-width: 45em) {
    font-size: 27px;
    line-height: 140%;
  }
`;

export const H3 = styled.h3`
  ${H3CSS}
  ${TypographyCSS}
`;

export const H4CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 1.5em;
  line-height: 36px;
  font-weight: 600;
  @media screen and (max-width: 45em) {
    font-size: 23px;
    line-height: 140%;
  }
`;

export const H4 = styled.h4`
  ${H4CSS}
  ${TypographyCSS}
`;

export const H5CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 1.25em;
  line-height: 1.5em;
  font-weight: 600;
  @media screen and (max-width: 45em) {
    font-size: 18px;
    line-height: 140%;
  }
`;

export const H5 = styled.h5`
  ${H5CSS}
  ${TypographyCSS}
`;

export const H6CSS = css`
  color: ${wizardTheme.colors.black[300]};
  font-size: 1em;
  line-height: 1.5em;
  font-weight: 600;
  @media screen and (max-width: 45em) {
    font-size: 13px;
    line-height: 140%;
  }
`;

export const H6 = styled.h6`
  ${H6CSS}
  ${TypographyCSS}
`;
