import React, { useCallback, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { wizardTheme } from "../../theme";
import { Callout } from "../contentNodes/fallbacks/Callout";
import { IconFlag, IconQuestionMark } from "../contentNodes/fallbacks/Icons";
import { P } from "../contentNodes/fallbacks/P";
import { Small } from "../contentNodes/fallbacks/Small";
import { Z_DROPDOWN_MENU, Z_STICKY_SCROLL_BANNER } from "../styled/zIndexes";

// WRAPS
// --- FULL SCREEN
export const WizardWrapFullScreen = ({
  children,
  title,
  progress,
  sections,
  showResourcesUpdatesWarning,
  "data-wiz-entry-machine-id": dataWizEntryMachineId,
  "data-wiz-entry-machine-state": dataWizEntryMachineState,
  "data-wiz-machine-id": dataWizMachineId,
  "data-wiz-machine-state": dataWizMachineState,
  "data-test-id": dataTestId,
}) => {
  return (
    <StyledWizardWrapFullScreen>
      <div className="x-wizard__header">{title}</div>
      {progress ? (
        <StyledWizardWrapProgressBar progress={progress}>
          <span className="x-wizard-progress-bar__counter">{Math.floor(progress * 100)}%</span>
          <span className="x-wizard-progress-bar__flag">
            <IconFlag />
          </span>
        </StyledWizardWrapProgressBar>
      ) : null}
      {sections ? (
        <StyledWizardWrapSectionBar sections={sections}>
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
        </StyledWizardWrapSectionBar>
      ) : null}
      {showResourcesUpdatesWarning && <ResourcesUpdatesWarning />}
      <form
        className="x-wizard__body"
        onSubmit={(e) => e.preventDefault()}
        data-wiz-entry-machine-id={dataWizEntryMachineId}
        data-wiz-entry-machine-state={dataWizEntryMachineState}
        data-wiz-machine-id={dataWizMachineId}
        data-wiz-machine-state={dataWizMachineState}
        data-test-id={dataTestId}
      >
        {children}
      </form>
    </StyledWizardWrapFullScreen>
  );
};
// --- BOUND BOX
export const WizardWrapFrame = ({
  children,
  "data-entry-machine-id": dataWizEntryMachineId,
  "data-entry-machine-state": dataWizEntryMachineState,
  "data-machine-id": dataWizMachineId,
  "data-machine-state": dataWizMachineState,
  "data-test-id": dataTestId,
}) => (
  <StyledWizardWrapFrame
    onSubmit={(e) => e.preventDefault()}
    data-wiz-entry-machine-id={dataWizEntryMachineId}
    data-wiz-entry-machine-state={dataWizEntryMachineState}
    data-wiz-machine-id={dataWizMachineId}
    data-wiz-machine-state={dataWizMachineState}
    data-test-id={dataTestId}
  >
    {children}
  </StyledWizardWrapFrame>
);

// EXTRA COMPONENTS
const ResourcesUpdatesWarning = () => {
  const [expanded, setExpanded] = useState(false);
  const onMouseLeave = useCallback(() => setExpanded(false), []);
  return (
    <StyledResourcesUpdatesWarningCallout
      // @ts-ignore
      styleType="warning"
      onClick={() => setExpanded((e) => !e)}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <Small>
          Your changes have not been submitted yet. Continue forward until you reach the “This is all correct” button to
          save. <IconQuestionMark />
        </Small>
        {expanded && (
          <P>
            If you close, refresh or leave this section, your changes will be lost. To save your changes continue
            forward and click the “This is all correct” button at the end of the section.
          </P>
        )}
      </div>
    </StyledResourcesUpdatesWarningCallout>
  );
};

// STYLINGS
const StyledResourcesUpdatesWarningCallout = styled(Callout)`
  text-align: center;
  position: sticky;
  top: 0;
  z-index: ${Z_STICKY_SCROLL_BANNER};

  & > div {
    width: 450px;
    max-width: 100%;
    margin: 0 auto;
    padding: 4px 16px;

    p {
      background: #fff;
      border-radius: 4px;
      margin: 8px auto;
      padding: 4px 16px;
    }
  }
`;

const SharedGlobalWizardWrapCSS = css`
  // ALL SUB-ELEMENTS
  color: ${wizardTheme.colors.gray[500]};
  font-size: 1em;
  line-height: 150%;
  font-family: sans-serif;
  * {
    box-sizing: border-box;
  }

  // ETC
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
  ul {
    list-style-type: none;
  }
  ul,
  ol {
    padding: 0;
  }
  a {
    color: ${wizardTheme.colors.blue[500]};
    text-decoration: none;
  }
  &,
  button,
  input,
  select,
  textarea {
    font-family: sans-serif;
  }
`;

const SharedContentNodeCSS = css`
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
    @media (max-width: ${wizardTheme.breakpoints[500]}) {
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
    color: ${wizardTheme.colors.red[500]};
  }
  .content-node__input__label {
    font-weight: 700;
    font-size: 15px;
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
      font-family: sans-serif;
    }
    input[type="date"]:not(:disabled) {
      background: white;
    }
    &.validation-error {
      .content-node__input__validation-message {
        color: ${wizardTheme.colors.red[500]};
      }
    }
    & > label,
    .content-node__input__label {
      font-weight: 700;
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
    .content-node__input__label-byline {
      font-size: 13px;
      margin-top: 0.25em;
      margin-bottom: 0.25em;
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
        border: 1px solid ${wizardTheme.colors.white[500]};
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
            @media (max-width: ${wizardTheme.breakpoints[500]}) {
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

const StyledWizardWrapFrame = styled.form`
  ${SharedGlobalWizardWrapCSS}
  ${SharedContentNodeCSS}
  button.x-wizard__header-back-button {
    display: none;
  }
  div.x-wizard__header__navigation-options {
    display: none;
  }
`;

const StyledWizardWrapFullScreen = styled.div`
  ${SharedGlobalWizardWrapCSS}
  .x-wizard__header {
    // DEPRECATED: We don't need to absolute position bc we removed wrappers
    // position: absolute;
    // left: 0;
    height: 46px;
    width: 100vw;
    padding: 0.6em 0.25em 0.4em;
    text-align: center;
    background: ${wizardTheme.colors.blue[900]};
    font-size: 13px;
    font-weight: 900;
    color: ${wizardTheme.colors.gray[500]};
    display: flex;
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
    ${SharedContentNodeCSS}
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
      @media (max-width: ${wizardTheme.breakpoints[500]}) {
        text-align: left;
      }
    }
    & > button.x-wizard__header-back-button {
      position: absolute;
      top: 8px;
      left: calc(1.5em + 32px + 8px);
      width: 88px;
      height: 32px;
      max-height: 32px;
      margin: 0;
      padding: 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.2px;
      &,
      &:disabled {
        opacity: 1;
        background: white;
        border: 2px solid ${wizardTheme.colors.blue[800]};
        cursor: pointer;
        color: ${wizardTheme.colors.gray[500]};
      }
    }
    & > div.x-wizard__header__navigation-options {
      position: absolute;
      top: 8px;
      left: 1.3em;
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      &,
      &:disabled,
      &:hover {
        opacity: 1;
        background: white;
        border: 2px solid ${wizardTheme.colors.blue[800]};
        border-radius: 4px;
        cursor: pointer;
        color: ${wizardTheme.colors.gray[500]};
      }
      svg {
        height: 18px;
        width: 18px;
        path {
          fill: ${wizardTheme.colors.gray[500]};
          stroke: ${wizardTheme.colors.gray[500]};
        }
      }
    }
    & > div.x-wizard__header__navigation-options-dropdown {
      position: absolute;
      top: calc(8px + 32px);
      left: 1.3em;
      z-index: ${Z_DROPDOWN_MENU};
      padding: 0.5em;
      background: ${wizardTheme.colors.blue[900]};
      border-radius: 4px;
      box-shadow: ${wizardTheme.effects.shadow[350]};
      button,
      button:disabled,
      button:hover {
        width: 100%;
        padding: 0.5em 1em;
        margin: 0.75em 0;
        opacity: 1;
        background: white;
        border: 2px solid ${wizardTheme.colors.blue[800]};
        border-radius: 4px;
        cursor: pointer;
        color: ${wizardTheme.colors.gray[500]};
        font-weight: 700;
      }
    }
  }
  @media (min-width: calc(${wizardTheme.breakpoints[500]} + 1px)) {
    .x-wizard__body div.x-wizard__header__navigation-options-dropdown .back-button {
      display: none;
    }
  }
  @media (max-width: ${wizardTheme.breakpoints[500]}) {
    .x-wizard__header {
      height: 54px;
      font-size: 11px;
    }
    .x-wizard__body {
      padding: 2em 1em;
    }
    .x-wizard__body button.x-wizard__header-back-button {
      // HACK: ON MOBILE, HIDE BACK BUTTON BUT KEEPING IT ON SCREEN FOR BACK TRANSITION HANDLER
      // (a different back button is used instead that's inside the dropdown mobile controls)
      display: none;
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

const StyledWizardWrapProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  top: 46px;
  left: 0;
  height: 3px;
  width: 100vw;
  background: ${wizardTheme.colors.green[900]};
  @media (max-width: ${wizardTheme.breakpoints[500]}) {
    top: 54px;
  }
  .x-wizard-progress-bar__counter {
    position: absolute;
    top: -33px;
    right: 2.75em;
    background: ${wizardTheme.colors.green[500]};
    color: white;
    border-radius: 12px;
    padding: 0 16px;
    font-weight: 900;
    font-size: 16px;
    @media (max-width: ${wizardTheme.breakpoints[500]}) {
      top: -38px;
      font-size: 12px;
      right: 1.5em;
    }
  }
  .x-wizard-progress-bar__flag {
    position: absolute;
    top: -30px;
    right: 0.5em;
    svg {
      height: 32px;
      width: 32px;
      path {
        fill: ${wizardTheme.colors.green[100]};
      }
    }
    @media (max-width: ${wizardTheme.breakpoints[500]}) {
      display: none;
    }
  }
  ${(props) => {
    if (props.progress != null) {
      return css`
        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 3px;
          border-radius: 0 4px 4px 0;
          width: ${props.progress * 100}vw;
          background: ${wizardTheme.colors.green[500]};
        }
      `;
    }
  }}
`;

const StyledWizardWrapSectionBar = styled.div<{ sections: { name: string }[] }>`
  width: 100%;
  max-width: 100vw;
  overflow-x: auto;
  background: ${wizardTheme.colors.white[800]};
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
    font-weight: 600;
    &.highlight {
      color: ${wizardTheme.colors.green[300]};
      border-bottom: 2px solid ${wizardTheme.colors.green[300]};
    }
    &:not(.highlight) {
      color: ${wizardTheme.colors.gray[900]};
      border-bottom: 2px solid ${wizardTheme.colors.white[300]};
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
          @media (max-width: ${wizardTheme.breakpoints[500]}) {
            display: inline-flex;
          }
        }
      `;
    }
  }}
`;
