import React, { useCallback, useState } from "react";
import { Callout } from "../contentNodes/fallbacks/Callout";
import { IconFlag, IconQuestionMark } from "../contentNodes/fallbacks/Icons";
import { P } from "../contentNodes/fallbacks/P";
import { Small } from "../contentNodes/fallbacks/Small";

// SINGLE WIZARD WRAP — full-featured (header, progress bar, section bar)
// Consumers can hide elements via CSS (e.g. `.xw--header { display: none; }`)
export const WizardWrap = (props) => {
  const {
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
  } = props;

  const shouldOverflow = sections && (sections.length > 3 || sections.map((s) => s.name).join("").length > 34);

  return (
    <div className="xw--wrap">
      {title != null && <div className="xw--header">{title}</div>}
      {progress ? (
        <div
          className="xw--progress-bar"
          style={{ "--xw--progress": `${progress * 100}%` } as React.CSSProperties}
        >
          <span className="xw--progress-counter">{Math.floor(progress * 100)}%</span>
          <span className="xw--progress-flag">
            <IconFlag />
          </span>
        </div>
      ) : null}
      {sections ? (
        <div className="xw--section-bar" data-overflow={shouldOverflow ? "" : undefined}>
          <div className="xw--section-scroll">
            {sections.map((section) => (
              <span
                key={section.trigger}
                className={`xw--section-tag ${section.highlight ? "xw--highlight" : ""}`}
              >
                {section.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {showResourcesUpdatesWarning && <ResourcesUpdatesWarning />}
      <form
        className="xw--body"
        onSubmit={(e) => e.preventDefault()}
        data-wiz-entry-machine-id={dataWizEntryMachineId}
        data-wiz-entry-machine-state={dataWizEntryMachineState}
        data-wiz-machine-id={dataWizMachineId}
        data-wiz-machine-state={dataWizMachineState}
        data-test-id={dataTestId}
      >
        {children}
      </form>
    </div>
  );
};

/** @deprecated Use WizardWrap instead */
export const WizardWrapFullScreen = WizardWrap;

/** @deprecated Use WizardWrap instead. For a minimal wrapper, pass a custom component via serializations.components.WizardWrap */
export const WizardWrapFrame = WizardWrap;

// EXTRA COMPONENTS
const ResourcesUpdatesWarning = () => {
  const [expanded, setExpanded] = useState(false);
  const onMouseLeave = useCallback(() => setExpanded(false), []);
  return (
    <Callout
      className="xw--resources-warning"
      variant="warning"
      onClick={() => setExpanded((e) => !e)}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <Small>
          Your changes have not been submitted yet. Continue forward until you reach the "This is all correct" button to
          save. <IconQuestionMark />
        </Small>
        {expanded && (
          <P>
            If you close, refresh or leave this section, your changes will be lost. To save your changes continue
            forward and click the "This is all correct" button at the end of the section.
          </P>
        )}
      </div>
    </Callout>
  );
};
