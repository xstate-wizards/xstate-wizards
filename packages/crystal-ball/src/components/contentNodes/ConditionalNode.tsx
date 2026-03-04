import React, { useState, useEffect, Fragment } from "react";
import { OutlineCondVisibility, useOutline } from "../../data/OutlineStore";
import { contentNodeToOutlineNode } from "./contentNodeToOutlineNode";

export const ConditionalNode = ({ contentNode, ctx = {}, graphJSON, outliner }) => {
  const { initConditionalVisibility } = useOutline();
  const [show, setShow] = useState<string>(initConditionalVisibility || OutlineCondVisibility.all);
  const [localOverride, setLocalOverride] = useState(false);

  // Sync with global toggle unless user has manually overridden this node
  useEffect(() => {
    if (!localOverride) {
      setShow(initConditionalVisibility || OutlineCondVisibility.all);
    }
  }, [initConditionalVisibility]);

  const handleLocalToggle = (value: string) => {
    setLocalOverride(true);
    setShow(value);
  };

  // RENDER
  return (
    <div className="xw-cb__conditional">
      <div className="xw-cb__conditional__description">
        <span>CONDITIONAL UI: {contentNode.description}</span>
        <span className="xw-cb__conditional__description__toggles">
          {contentNode.options ? (
            <select onChange={(ev) => handleLocalToggle(ev.target.value)} value={show}>
              <option value="all">All</option>
              <option value="hide">Hide</option>
              <option disabled>---</option>
              {Object.keys(contentNode.options).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          ) : (
            <>
              <button className={show === "all" ? "active" : ""} onClick={() => handleLocalToggle(OutlineCondVisibility.all)}>
                All
              </button>
              <button className={show === "hide" ? "active" : ""} onClick={() => handleLocalToggle(OutlineCondVisibility.hide)}>
                Hide
              </button>
            </>
          )}
        </span>
      </div>
      {contentNode.hasOwnProperty("true") && ["all", "true"].includes(show) && (
        <div className="xw-cb__conditional__section">
          <div className="xw-cb__conditional__section__title">TRUE →</div>
          <div className="xw-cb__conditional__section__nodes">
            {(contentNode.true || []).map((newNode, nci) => (
              <Fragment key={nci}>
                {contentNodeToOutlineNode({
                  contentNode: newNode,
                  contentNodeIndex: nci,
                  context: ctx,
                  graphJSON,
                  outliner,
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
      {contentNode.hasOwnProperty("false") && ["all", "false"].includes(show) && (
        <div className="xw-cb__conditional__section">
          <div className="xw-cb__conditional__section__title">FALSE →</div>
          <div className="xw-cb__conditional__section__nodes">
            {(contentNode.false || []).map((newNode, nci) => (
              <Fragment key={nci}>
                {contentNodeToOutlineNode({
                  contentNode: newNode,
                  contentNodeIndex: nci,
                  context: ctx,
                  graphJSON,
                  outliner,
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
      {contentNode.hasOwnProperty("options") &&
        Object.entries(contentNode.options)
          .filter(([key]) => show === "all" || show === key)
          .map(([key, optionNode], index) => (
            <div key={`${key}-${index}`} className="xw-cb__conditional__section">
              <div className="xw-cb__conditional__section__title">{key} →</div>
              <div className="xw-cb__conditional__section__nodes">
                {/* @ts-ignore */}
                {(optionNode || []).map((newNode, nci) => (
                  <Fragment key={nci}>
                    {contentNodeToOutlineNode({
                      contentNode: newNode,
                      contentNodeIndex: nci,
                      context: ctx,
                      graphJSON,
                      outliner,
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
};
