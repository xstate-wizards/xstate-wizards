import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";
import { hexToRgba } from "../../styled/hexToRgba";
import { TButtonCSS } from "./types";

export const ButtonCSS = css<TButtonCSS>`
  box-sizing: border-box;
  background: ${wizardTheme.colors.blue[500]};
  border: 1px solid ${wizardTheme.colors.blue[500]};
  border-bottom: 3px solid ${wizardTheme.colors.blue[300]};
  color: ${wizardTheme.colors.white[900]};
  path {
    fill: ${wizardTheme.colors.white[900]};
  }
  border-radius: 4px;
  text-decoration: none;
  justify-content: center;
  text-align: center;
  transition: 0.1s color;
  cursor: pointer;
  svg {
    position: relative;
    top: 2px;
    right: 3px;
    max-height: 18px;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props) => (props.width ? `min-width: ${props.width};` : "")}

  // Sizing
  font-weight: 500;
  ${(props) => {
    if (props.size === "xs") {
      return `
        padding: .3em .6em;
        font-size: 0.8em;
        svg {
          height: 0.8em;
          width: 0.8em;
        }
      `;
    }
    if (props.size === "sm") {
      return `
        padding: 0.5em 1em;
        font-size: 0.8em;
        svg {
          height: 0.8em;
          width: 0.8em;
        }
      `;
    }
    if (props.size === "md" || !props.size) {
      return `
        padding: 0.6em 1.2em;
        font-size: 1em;
        svg {
          height: 1em;
          width: 1em;
        }
      `;
    }
    if (props.size === "lg") {
      return `
        padding: 0.8em 1.4em;
        font-size: 1.4em;
        svg {
          height: 1.2em;
          width: 1.2em;
          margin-left: 0.5em;
        }
      `;
    }
    if (props.size === "xl") {
      return `
        width: 100%;
        padding: 1em 2em;
        font-size: 1.6em;
        text-align: center;
        svg {
          height: 1.2em;
          width: 1.2em;
          margin: 0 0.25em;
        }
      `;
    }
    return `
      padding: 0.6em 1.2em;
      font-size: 1.1em;
    `;
  }}

  // Colors
  transition: background 250ms, border 250ms, color 250ms, path 250ms, fill 250ms, opacity 250ms;
  // --- Disabled Props
  ${(props) => {
    if (props.disabled)
      return css`
        cursor: not-allowed;
      `;
  }}
  // --- Button Types
  ${(props) => {
    if (props.variant === "white" && props.inverted) {
      return css`
        background: transparent;
        border: 1px solid ${wizardTheme.colors.white[900]};
        color: ${wizardTheme.colors.white[900]};
        opacity: 1;
        &:disabled {
          opacity: 0.6;
        }
        &:focus {
          outline: none;
        }
      `;
    }
    if (props.variant === "white" && !props.inverted) {
      return css`
        background: ${wizardTheme.colors.white[900]};
        border: 1px solid ${wizardTheme.colors.white[300]};
        border-bottom: 3px solid ${wizardTheme.colors.white[300]};
        color: ${wizardTheme.colors.blue[500]};
        &:disabled {
          border: 1px solid ${wizardTheme.colors.white[500]};
          border-bottom: 3px solid ${wizardTheme.colors.white[300]};
          color: ${hexToRgba(wizardTheme.colors.blue[300], 0.5)};
        }
        &:focus {
          outline: none;
          border: 1px solid ${wizardTheme.colors.blue[500]};
          border-bottom: 3px solid ${wizardTheme.colors.blue[300]};
        }
      `;
    }
    if (props.variant === "warning" && props.inverted) {
      return css`
        background: transparent;
        border: 1px solid ${wizardTheme.colors.red[500]};
        color: ${wizardTheme.colors.red[500]};
        path {
          fill: ${wizardTheme.colors.red[500]};
        }
        opacity: 1;
        &:disabled {
          opacity: 0.6;
        }
        &:focus {
          outline: none;
        }
      `;
    }
    if (props.variant === "warning" && !props.inverted) {
      return css`
        background: ${wizardTheme.colors.red[500]};
        border: 1px solid ${wizardTheme.colors.red[300]};
        border-bottom: 3px solid ${wizardTheme.colors.red[100]};
        color: white;
        &:hover {
          background: ${wizardTheme.colors.red[300]};
        }
        &:disabled {
          background: ${wizardTheme.colors.red[100]};
          color: ${hexToRgba(wizardTheme.colors.white[900], 0.5)};
        }
      `;
    }
    if (props.variant === "success" && props.inverted) {
      return css`
        background: transparent;
        border: 1px solid ${wizardTheme.colors.green[500]};
        color: ${wizardTheme.colors.green[300]};
        path {
          fill: ${wizardTheme.colors.green[500]};
        }
        &:disabled {
          color: ${hexToRgba(wizardTheme.colors.green[300], 0.5)};
        }
      `;
    }
    if (props.variant === "success" && !props.inverted) {
      return css`
        background: ${wizardTheme.colors.green[500]};
        border: 1px solid ${wizardTheme.colors.green[500]};
        border-bottom: 3px solid ${wizardTheme.colors.green[300]};
        color: white;
        &:hover {
          background: ${wizardTheme.colors.green[300]};
          border: 1px solid ${wizardTheme.colors.green[300]};
          border-bottom: 3px solid ${wizardTheme.colors.green[100]};
        }
        &:disabled {
          background: ${wizardTheme.colors.green[300]};
          color: ${hexToRgba(wizardTheme.colors.white[900], 0.5)};
        }
      `;
    }
    if (props.variant === "default" && props.inverted) {
      return css`
        background: transparent;
        border: 1px solid ${wizardTheme.colors.gray[900]};
        color: ${wizardTheme.colors.gray[500]};
        path {
          fill: ${wizardTheme.colors.gray[500]};
        }
        &:disabled {
          border: 1px solid ${hexToRgba(wizardTheme.colors.gray[900], 0.5)};
          color: ${hexToRgba(wizardTheme.colors.gray[500], 0.5)};
        }
      `;
    }
    if (props.variant === "default" && !props.inverted) {
      return css`
        background: ${wizardTheme.colors.gray[900]};
        border: 1px solid ${wizardTheme.colors.gray[900]};
        border-bottom: 3px solid ${wizardTheme.colors.gray[700]};
        color: white;
        &:hover {
          background: ${wizardTheme.colors.gray[800]};
          border: 1px solid ${wizardTheme.colors.gray[900]};
          border-bottom: 3px solid ${wizardTheme.colors.gray[500]};
        }
        &:disabled {
          background: ${wizardTheme.colors.gray[800]};
          color: ${hexToRgba(wizardTheme.colors.white[900], 0.5)};
        }
      `;
    }
    // Primary/brand button if no buttonType
    if (props.inverted) {
      return css`
        background: transparent;
        border: 1px solid ${wizardTheme.colors.blue[500]};
        color: ${wizardTheme.colors.blue[500]};
        path {
          fill: ${wizardTheme.colors.blue[500]};
        }
      `;
    }
    return css`
      &:hover {
        background: ${wizardTheme.colors.blue[300]};
      }
      &:disabled {
        background: ${wizardTheme.colors.blue[300]};
        color: ${hexToRgba(wizardTheme.colors.white[900], 0.5)};
      }
    `;
  }}
`;

export const Button = styled.button`
  ${ButtonCSS}
`;

export const ButtonLink = styled.a`
  ${ButtonCSS}
`;
