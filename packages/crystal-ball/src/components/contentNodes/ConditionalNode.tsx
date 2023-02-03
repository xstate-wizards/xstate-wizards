import React, { useState, Fragment } from "react";
import { OutlineCondVisibility } from "../../data/OutlineStore";
import { contentNodeToOutlineNode } from "./contentNodeToOutlineNode";

export const ConditionalNode = ({ contentNode, ctx = {}, graphJSON, initConditionalVisibility, outliner }) => {
  // Allow parent viewer to set a default hide/show option to condense interviews for easier skimming
  const [show, setShow] = useState(
    contentNode.options ? OutlineCondVisibility.hide : initConditionalVisibility || OutlineCondVisibility.all
  );

  // RENDER
  return (
    <div className="conditional">
      <div className="conditional__description">
        <span>CONDITIONAL UI: {contentNode.description}</span>
        <span className="conditional__description__toggles">
          {contentNode.options ? (
            <select onChange={(ev) => setShow(ev.target.value)} value={show}>
              <option value="all">All</option>
              <option value="hide">Hide</option>
              <option disabled>---</option>
              {Object.keys(contentNode.options).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          ) : (
            <>
              <button className={show === "all" ? "active" : ""} onClick={() => setShow(OutlineCondVisibility.all)}>
                All
              </button>
              <button className={show === "hide" ? "active" : ""} onClick={() => setShow(OutlineCondVisibility.hide)}>
                Hide
              </button>
            </>
          )}
        </span>
      </div>
      {contentNode.hasOwnProperty("true") && ["all", "true"].includes(show) && (
        <div className="conditional__section">
          <div className="conditional__section__title">TRUE →</div>
          <div className="conditional__section__nodes">
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
        <div className="conditional__section">
          <div className="conditional__section__title">FALSE →</div>
          <div className="conditional__section__nodes">
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
            <div key={`${key}-${index}`} className="conditional__section">
              <div className="conditional__section__title">{key} →</div>
              <div className="conditional__section__nodes">
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
