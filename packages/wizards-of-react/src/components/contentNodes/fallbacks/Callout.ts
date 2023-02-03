import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";

enum CalloutVariant {
  error = "error",
  warning = "warning",
}

enum TextAlign {
  center = "center",
  left = "left",
  right = "right",
}

export const Callout = styled.div<{ onClick: Function; textAlign: TextAlign; variant: CalloutVariant }>`
  padding: 0.5em 1em;
  margin-top: 0.5em !important; // override node
  margin-bottom: 1em !important; // override node
  background: ${wizardTheme.colors.blue[900]};
  border-radius: 4px;
  border: 1px solid ${wizardTheme.colors.blue[700]};
  box-shadow: ${wizardTheme.effects.shadow[300]};
  ${(p) => (typeof p.onClick === "function" ? "cursor: pointer;" : "")}
  small {
    color: ${wizardTheme.colors.gray[700]};
    font-weight: 700;
  }

  // TEXT ALIGNMENT
  ${(props) => {
    if (props.textAlign)
      return css`
        text-align: ${props.textAlign};
      `;
  }}

  // VARIANTS
  ${(props) => {
    // DEPRECATE styleType
    // @ts-ignore
    if (props.variant === "error" || props.styleType === "error") {
      return css`
        background: ${wizardTheme.colors.red[900]};
        border-color: ${wizardTheme.colors.red[900]};
        box-shadow: none;
        small {
          color: ${wizardTheme.colors.red[500]};

          svg {
            stroke: ${wizardTheme.colors.red[500]};
            width: 1em;
            height: 1em;
          }
        }
      `;
    }
    // DEPRECATE styleType
    // @ts-ignore
    if (props.variant === "warning" || props.styleType === "warning") {
      return css`
        background: ${wizardTheme.colors.yellow[900]};
        border-color: ${wizardTheme.colors.yellow[700]};
        box-shadow: none;
        small {
          color: ${wizardTheme.colors.gray[500]};

          svg {
            stroke: ${wizardTheme.colors.yellow[700]};
            width: 1em;
            height: 1em;
          }
        }
      `;
    }
  }}
`;
