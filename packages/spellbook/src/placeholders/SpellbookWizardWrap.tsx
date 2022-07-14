import { $TSFixMe } from "@xstate-wizards/spells";
import React, { useRef } from "react";
import styled, { css } from "styled-components";
import {
  THEME_COLOR_BLUE_800,
  THEME_COLOR_BLUE_900,
  THEME_COLOR_GRAY,
  THEME_COLOR_RED,
  THEME_COLOR_WHITE_OFF,
} from "../theme";

export const SpellBookWizardWrap = ({
  children,
  title,
  progress,
  sections,
  // showResourcesUpdatesWarning,
  "data-test-id": dataTestId,
}) => {
  // SETUP
  // --- grab wrapper size for progress bar width calc
  const wrapRef = useRef();
  // RENDER
  return (
    <StyledSpellBookWizardWrap ref={wrapRef}>
      <div className="x-wizard__header">{title}</div>
      {progress && wrapRef != null ? (
        <StyledSpellBookWizardProgressBar
          progress={progress}
          width={(wrapRef as $TSFixMe)?.current?.scrollWidth ?? 0}
        />
      ) : null}
      {sections ? (
        <StyledSpellBookWizardSectionBar sections={sections}>
          <div className="x-wizard-section-bar__scroll">
            {sections.map((section) => (
              <span
                key={section.trigger}
                className={`x-wizard-section-bar__tag ${section.highlight ? "highlight" : ""}`}
              >
                {section.name}
              </span>
            ))}
          </div>
        </StyledSpellBookWizardSectionBar>
      ) : null}
      {/* {/* {showResourcesUpdatesWarning && <ResourcesUpdatesWarning />} */}
      <form className="x-wizard__body" onSubmit={(e) => e.preventDefault()} data-test-id={dataTestId}>
        {children}
      </form>
    </StyledSpellBookWizardWrap>
  );
};

const SharedSpellBookWizardCSS = css`
  & > table,
  & > div:not(.content-node__input):not(.node__row):not(.content-node__row) {
    margin-bottom: 1em;
  }
  & > button,
  & > a.button-link {
    display: block;
    width: 100%;
    margin: 1em 0;
    font-weight: 500;
    button {
      width: 100%;
    }
  }
  & > p,
  ul > li,
  ol > li {
    font-size: 15px;
    line-height: 22px;
    // For markdown within <li> elements, clear paragraph props
    & > p {
      margin: 0;
      font-size: 15px;
    }
  }
  ul {
    list-style: disc;
    padding-left: 20px;
  }
  ol {
    padding-left: 20px;
  }
  .content-node__row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-grow: 1;
    // TODO: NEED TO FIND A BETTER WAY TO HAVE BUTTONS INLINE WITH INPUT HEIGHTS >:|
    & > h4,
    & > h5,
    & > h6 {
      margin: 0.3em 0;
    }
    & > button {
      max-height: 34px;
      margin: 0.3em 0;
    }
    &.always-inline {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media (max-width: 45em) {
      & > div,
      & > div > div {
        width: 100%;
        button {
          width: 100%;
        }
      }
      &:not(.always-inline) {
        flex-direction: column;
        justify-content: initial;
        align-items: flex-start;
      }
    }
  }
  .content-node__input__required-tick {
    margin-left: 3px;
    color: ${THEME_COLOR_RED};
  }
  .content-node__input__label {
    font-weight: 500;
    font-size: 14px;
    line-height: 1.3;
  }
  .content-node__input {
    flex-basis: 0;
    flex-grow: 1;
    margin: 0.2em 0;
    small {
      font-weight: 500;
    }
    label {
      small {
        display: block;
        margin: 1em 0 0.25em;
      }
    }
    textarea {
      font-size: 14px;
      line-height: 150%;
      font-family: "Averta", san-serif;
    }
    input[type="date"]:not(:disabled) {
      background: white;
    }
    &.validation-error {
      .content-node__input__validation-message {
        color: ${THEME_COLOR_RED};
      }
    }
    & > label,
    .content-node__input__label {
      small {
        padding-bottom: 0.3em;
      }
      &.checkbox {
        margin: 0.5em;
        small {
          margin: 0;
        }
      }
    }
    &.checkbox {
      padding-top: 0.2em;
      small {
        padding-top: 0.3em;
      }
    }
    &.json-array {
      margin-bottom: 0.5em;
      .json-panel {
        border: 1px solid ${THEME_COLOR_WHITE_OFF};
        padding: 1em;
        margin-bottom: 1em;
        border-radius: 4px;
        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          button {
            padding: 0.1em 0.4em;
          }
        }
        .json-panel__inputs {
          &.row {
            display: flex;
            label {
              flex-grow: 1;
              padding-right: 6px;
              &:last-of-type {
                padding-right: 0;
              }
              &.checkbox {
                flex-grow: 0;
              }
            }
            @media (max-width: 45em) {
              flex-direction: column;
            }
          }
          & > button {
            margin-left: 6px;
            margin-top: 18px;
          }
          label small {
            margin-top: 0;
          }
        }
      }
      &.xs {
        .json-panel {
          margin-bottom: 0.5em;
          padding: 0.75em 0;
          border: 0;
        }
      }
      .json-array-add {
        margin-bottom: 1em;
        display: flex;
        justify-content: center;
      }
    }
  }
`;

const StyledSpellBookWizardWrap = styled.div`
  .x-wizard__header {
    // DEPRECATED: We don't need to absolute position bc we removed wrappers
    // position: absolute;
    // left: 0;
    height: 46px;
    width: 100%;
    padding: 0.6em 0.25em 0.4em;
    text-align: center;
    background: white;
    font-size: 13px;
    font-weight: 900;
    color: #4d555b;
    display: flex;
    flex-direction: column
    align-items: center;
    justify-content: center;
  }
  .x-wizard__body {
    // Body
    max-width: 600px;
    padding: 3em 1.5em;
    margin: 0 auto;
    margin-bottom: 53px; // Height of bottom navbar
    // Content Nodes
    ${SharedSpellBookWizardCSS}
    & > h2, & > h3, & > h4, & > h5 {
      text-align: center;
    }
    & > h6 {
      margin-bottom: 0.25em;
      margin-top: 0.25em;
    }
    & > h2,
    & > h3,
    & > h4,
    & > h5,
    & > h6,
    & > p {
      @media (max-width: 45em) {
        text-align: left;
      }
    }
    & > button.x-wizard__header-back-button {
      position: relative;
      top: -125px;
      // left: calc(1.5em + 32px + 8px);
      width: 88px;
      height: 32px;
      max-height: 32px;
      margin: 0;
      padding: 0;
      font-size: 13px;
      letter-spacing: -0.2px;
      &,
      &:disabled {
        opacity: 1;
        background: white;
        border: 2px solid ${THEME_COLOR_BLUE_800};
        cursor: pointer;
        color: ${THEME_COLOR_GRAY};
      }
      &::before {
        content: "← Back";
      }
    }
    & > div.x-wizard__header__navigation-options {
      position: relative;
      top: -125px;
      // left: 1.3em;
      width: 32px;
      height: 32px;
      padding: 0;
      display: none;
      // display: flex;
      // align-items: center;
      // justify-content: center;
      &,
      &:disabled,
      &:hover {
        opacity: 1;
        background: white;
        border: 2px solid ${THEME_COLOR_BLUE_800};
        border-radius: 4px;
        cursor: pointer;
        color: ${THEME_COLOR_GRAY};
      }
      svg {
        height: 18px;
        width: 18px;
        path {
          fill: ${THEME_COLOR_GRAY};
          stroke: ${THEME_COLOR_GRAY};
        }
      }
    }
    & > div.x-wizard__header__navigation-options-dropdown {
      position: absolute;
      top: calc(8px + 32px);
      left: 1.3em;
      z-index: 0;
      padding: 0.5em;
      background: ${THEME_COLOR_BLUE_900};
      border-radius: 4px;
      box-shadow: 0 4px 16px 0 rgba(228,228,230,1);
      button,
      button:disabled,
      button:hover {
        width: 100%;
        padding: 0.5em 1em;
        margin: 0.75em 0;
        justify-content: flex-start;
        opacity: 1;
        background: white;
        border: 2px solid ${THEME_COLOR_BLUE_800};
        border-radius: 4px;
        cursor: pointer;
        color: ${THEME_COLOR_GRAY};
      }
    }
  }
  @media (min-width: calc(45em + 1px)) {
    .x-wizard__body div.x-wizard__header__navigation-options-dropdown .back-button {
      display: none;
    }
  }
  @media (max-width: 45em) {
    .x-wizard__header {
      height: 54px;
      font-size: 11px;
    }
    .x-wizard__body {
      padding: 2em 1em;
    }
    .x-wizard__body button.x-wizard__header-back-button {
      // width: 40px;
      // top: 12px;
      // &::before {
      //   content: "←";
      // }
      // HACK: ON MOBILE, HIDE BACK BUTTON BUT KEEPING IT ON SCREEN FOR BACK TRANSITION HANDLER
      width: 0;
      height: 0;
      top: -1px;
      left: -1px;
      &::before {
        content: "";
      }
    }
    .x-wizard__body div.x-wizard__header__navigation-options {
      top: 12px;
      left: 1.3em; // Replaces position of back button for mobile
      margin: 0;
    }
    .x-wizard__body div.x-wizard__header__navigation-options-dropdown {
      top: calc(12px + 32px);
      left: 1.3em;
      right: 1.3em;
    }
  }
`;

const StyledSpellBookWizardProgressBar = styled.div<{ progress: number; width: number }>`
  left: 0;
  height: 3px;
  width: ${(props) => props.progress * props.width}px;
  background: #17dc83;
`;

const StyledSpellBookWizardSectionBar = styled.div<{ sections: Partial<{ name: string }>[] }>`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  background: #fcfcfc;
  font-size: 12px;
  .x-wizard-section-bar__scroll {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    box-sizing: border-box;
  }
  .x-wizard-section-bar__tag {
    height: 100%;
    width: max-content;
    display: flex;
    align-items: center;
    margin: 6px 6px 0;
    padding: 2px 4px;
    box-sizing: border-box;
    &.highlight {
      color: #17dc83;
      border-bottom: 2px solid #17dc83;
    }
    &:not(.highlight) {
      color: gray;
      border-bottom: 2px solid #ccc;
    }
    &:first-of-type {
      margin: 6px 6px 0 12px;
    }
    &:last-of-type {
      margin: 6px 12px 0 6px;
    }
  }
  ${({ sections }) => {
    if (sections.length > 3 || sections.map((s) => s.name).join("").length > 34) {
      // OPTIMIZE: There might be some weird scenarios where we cause overflow/scrollbars to show up when not needing to
      return css`
        .x-wizard-section-bar__scroll {
          @media (max-width: 45em) {
            display: inline-flex;
          }
        }
      `;
    }
  }}
`;
