import styled, { css } from "styled-components";
import { wizardTheme } from "../../../theme";

type TTableCSS = {
  hoverHighlight?: boolean; // deprecate
  space?: "tight"; // deprecate
  size?: "xs" | "sm"; // make consistent
  width?: string; // deprecate
};

export const Table = styled.table<TTableCSS>`
  width: ${(props) => props.width || "100%"};
  border-spacing: 0;
  text-align: left;
  border-radius: 2px;
  thead {
    background: ${wizardTheme.colors.white[700]};
  }
  tbody {
    background: ${wizardTheme.colors.white[900]};
    tr.divider {
      height: 12px;
      td {
        background: ${wizardTheme.colors.white[700]};
        opacity: 0.5;
        height: 100%;
        width: 100%;
        font-weight: 500;
      }
    }
  }
  th,
  td {
    border: 1px solid ${wizardTheme.colors.white[500]};
  }
  th {
    border-bottom: 1px solid ${wizardTheme.colors.white[300]};
  }
  p {
    margin: 0;
  }
  ${(props) => {
    if (props.space === "tight") {
      console.warn("DEPRECATED: Table > props.space");
      return css`
        p {
          font-size: 0.8em;
        }
        th,
        td {
          padding: 0.2em 0.6em;
        }
      `;
    }
    if (props.size === "sm") {
      return css`
        th {
          font-size: 13px;
        }
        td {
          font-size: 12px;
          & > input {
            font-size: initial;
          }
        }
        th,
        td {
          padding: 0.3em 0.5em;
        }
      `;
    }
    if (props.size === "xs") {
      return css`
        th {
          font-size: 12px;
        }
        td {
          font-size: 11px;
          & > input {
            font-size: initial;
          }
        }
        th,
        td {
          padding: 0.2em 0.4em;
        }
      `;
    }
    return css`
      p {
        font-size: 0.9em;
      }
      th,
      td {
        padding: 0.5em 0.8em;
      }
    `;
  }}
  ${(props) => {
    if (props.hoverHighlight) {
      return css`
        tbody > tr:hover {
          cursor: pointer;
          color: ${wizardTheme.colors.blue[500]};
          transition: 150ms;
        }
      `;
    }
  }}
  tr.success > td:first-of-type {
    border-left: 4px solid ${wizardTheme.colors.green[500]};
    margin-left: -4px;
  }
  tr.warning > td:first-of-type {
    border-left: 4px solid ${wizardTheme.colors.orange[500]};
    margin-left: -4px;
  }
  tr.critical > td:first-of-type {
    border-left: 4px solid ${wizardTheme.colors.red[500]};
    margin-left: -4px;
  }
`;
