import { css } from "styled-components";
import { wizardTheme } from "../../../theme";

type TTypographyCSS = {
  color?: string; // deprecate
  colorVariant?: number; // deprecate
  opacity?: string | number; // deprecate
  textAlign?: string; // deprecate
};

export const TypographyCSS = css<TTypographyCSS>`
  ${(props) => {
    if (props.textAlign) {
      console.debug("DEPRECATED: TypographyCSS > props.textAlign");
      return `text-align: ${props.textAlign};`;
    }
  }}
  ${(props) => {
    // If a string
    // 1) Try pulling from theme
    if (props.color && wizardTheme.colors[props.color]?.[props.colorVariant || 500] != null) {
      return `color: ${wizardTheme.colors[props.color]?.[props.colorVariant || 500]};`;
    }
    // 2) Or just set the value
    if (typeof props.color === "string") {
      return `color: ${props.color};`;
    }
    // Otherwise default to Gray
    return `color: ${wizardTheme.colors.gray[500]};`;
  }}
  ${(props) => {
    if (props.opacity) {
      console.debug("DEPRECATED: TypographyCSS > props.opacity");
      return `opacity: ${props.opacity};`;
    }
  }}
`;
