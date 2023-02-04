import styled, { css } from "styled-components";
import { TypographyCSS } from "./Typography.css";

type TSmallCSS = {
  padding?: string; // deprecate
};

export const SmallCSS = css<TSmallCSS>`
  font-size: 13px;
  line-height: 100%;
  padding: ${(props) => {
    if (props.padding) {
      console.warn("DEPRECATED: SmallCSS > props.padding");
      return props.padding;
    }
    return "0 0.25em 0 0";
  }};
`;

export const Small = styled.small`
  ${SmallCSS}
  ${TypographyCSS}
`;
