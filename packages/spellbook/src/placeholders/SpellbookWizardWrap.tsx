import React, { useRef } from "react";
import { $TSFixMe } from "@xstate-wizards/spells";

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
  // --- section bar overflow detection
  const sectionBarOverflow =
    sections &&
    (sections.length > 3 || sections.map((s) => s.name).join("").length > 34);
  // RENDER
  return (
    <div className="xw-sb__wizard-wrap" ref={wrapRef}>
      <div className="x-wizard__header">{title}</div>
      {progress && wrapRef != null ? (
        <div
          className="xw-sb__progress-bar"
          style={{ width: `${progress * ((wrapRef as $TSFixMe)?.current?.scrollWidth ?? 0)}px` }}
        />
      ) : null}
      {sections ? (
        <div className={`xw-sb__section-bar${sectionBarOverflow ? " xw-sb__section-bar--overflow" : ""}`}>
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
        </div>
      ) : null}
      {/* {/* {showResourcesUpdatesWarning && <ResourcesUpdatesWarning />} */}
      <form className="x-wizard__body" onSubmit={(e) => e.preventDefault()} data-test-id={dataTestId}>
        {children}
      </form>
    </div>
  );
};
