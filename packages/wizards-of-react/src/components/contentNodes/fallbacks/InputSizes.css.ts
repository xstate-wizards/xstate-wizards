import { css } from "styled-components";
import { TComponentSize } from "./types";

export const InputSizesCSS = css<{
  size?: TComponentSize;
}>`
  ${(props) => {
    if (props.size === "xs") {
      return `
        padding: 0.8em 0.5em;
        font-size: 0.8em;
      `;
    }
    if (props.size === "sm") {
      return `
        padding: 0.8em 0.5em;
        font-size: 0.8em;
      `;
    }
    if (props.size === "md" || !props.size) {
      return `
        padding: 0.8em 0.5em;
        font-size: 1em;
      `;
    }
    if (props.size === "lg") {
      return `
        padding: 0.8em;
        font-size: 1.2em;
      `;
    }
    if (props.size === "xl") {
      return `
        width: 100%;
        padding: 0.8em 0.5em;
        font-size: 1.6em;
        text-align: center;
      `;
    }
    return `
      padding: 0.8em 0.5em;
      font-size: 1.1em;
    `;
  }}
`;
