import { get, isEqual } from "lodash";
import React, { Fragment } from "react";
import ReactPlayer from "react-player";
import { ContentNodeType, evalForEachItems, evalSelectOptions } from "@xstate-wizards/spells";
import { renderWizardML } from "@xstate-wizards/wizards-of-react";
import { ConditionalNode } from "./ConditionalNode";

type TContentNodeToOutlineNodeParams = {
  contentNode: any;
  contentNodeIndex: any;
  context: any;
  graphJSON: any;
  outliner: any; // TODO
};

// These params are a mess. clean up for another day
export const contentNodeToOutlineNode = ({
  contentNode,
  contentNodeIndex: ci,
  context: ctx = {},
  graphJSON,
  outliner,
}: TContentNodeToOutlineNodeParams) => {
  // --- Component
  if (contentNode.type === ContentNodeType.COMPONENT) {
    return contentNode.alt || typeof contentNode.component === "string" ? (
      <div className="outline__component-place-holder">{contentNode.alt ?? contentNode.component}</div>
    ) : (
      contentNode.component({ transition: () => null })
    );
  }
  // --- Arrays/Rows
  if (Array.isArray(contentNode) || contentNode?.type === ContentNodeType.ROW) {
    return (
      <Fragment key={`${ci}-${contentNode?.type}`}>
        {(Array.isArray(contentNode) ? contentNode : contentNode.content || []).map((newNode, nci) => (
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
      </Fragment>
    );
  }
  // --- Conditionals
  if (contentNode.type === ContentNodeType.CONDITIONAL) {
    return (
      <ConditionalNode
        key={`${ci}-${contentNode?.description}`}
        contentNode={contentNode}
        graphJSON={graphJSON}
        initConditionalVisibility={outliner.initConditionalVisibility}
        outliner={outliner}
      />
    );
  }

  // --- For Each Loops
  if (contentNode.type === ContentNodeType.FOR_EACH) {
    console.warn(
      "you must assume that items in the content function in forEach content: (ctx,items)=>{} may be undefined, so they can be rendered in outline mode. you can check for outlinemode using ctx.__outline__, using the contenxt outside the foreach"
    );
    const forEachItems = evalForEachItems(contentNode, { context: ctx });
    return (
      <div className="conditional">
        <div className="conditional__description">
          <span>Can rendering multiple of...</span>
        </div>
        <div className="conditional__section">
          {forEachItems.map((node) =>
            contentNodeToOutlineNode({ contentNode: node, contentNodeIndex: ci, context: ctx, graphJSON, outliner })
          )}
        </div>
      </div>
    );
  }
  // --- Text
  if (
    [
      ContentNodeType.P,
      ContentNodeType.H1,
      ContentNodeType.H2,
      ContentNodeType.H3,
      ContentNodeType.H4,
      ContentNodeType.H5,
      ContentNodeType.H6,
      ContentNodeType.SMALL,
      ContentNodeType.TEXT,
      ContentNodeType.CALLOUT,
    ].includes(contentNode.type)
  ) {
    return [
      ContentNodeType.H1,
      ContentNodeType.H2,
      ContentNodeType.H3,
      ContentNodeType.H4,
      ContentNodeType.H5,
      ContentNodeType.H6,
    ].includes(contentNode.type) ? (
      <h3 key={ci}>
        {renderWizardML({ ctx, text: contentNode.text || "", serializations: { functions: {} }, contentTree: {} })}
      </h3>
    ) : (
      <p>{renderWizardML({ ctx, text: contentNode.text || "", serializations: { functions: {} }, contentTree: {} })}</p>
    );
  }
  if (contentNode.type === ContentNodeType.A) {
    return (
      <p>
        <u title={contentNode.href}>{contentNode.text}</u>
      </p>
    );
  }
  // --- List
  if ([ContentNodeType.UL, ContentNodeType.OL].includes(contentNode.type)) {
    return (
      <ul key={ci}>
        {contentNode.items.length === 0 ? (
          <li>[List of items...]</li>
        ) : (
          contentNode.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              {item.text
                ? item.text
                : contentNodeToOutlineNode({
                    contentNode: item,
                    contentNodeIndex: itemIndex,
                    context: ctx,
                    graphJSON,
                    outliner,
                  })}
            </li>
          ))
        )}
      </ul>
    );
  }
  // --- Media
  if (contentNode.type === ContentNodeType.ILLUSTRATION) {
    // TODO: Handle rendering SVGs in a concise way
    return (
      <div className="outline__media-place-holder">
        {contentNode.alt ? `${contentNode.alt} (SVG)` : "SVG Missing Alt Text"}
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.IMG) {
    // TODO: Handle rendering imgs in a concise way
    return (
      <div className="outline__media-place-holder">
        {contentNode.alt ? `${contentNode.alt} (IMG)` : "IMG Missing Alt Text"}
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.VIDEO) {
    return (
      <div style={{ margin: "0 auto", width: "320px" }}>
        <ReactPlayer
          width="100%"
          height="100%"
          url={contentNode.url}
          config={{ youtube: { playerVars: { controls: 1, rel: 0 } } }}
        />
      </div>
    );
  }
  // --- Layout
  if ([ContentNodeType.HR, ContentNodeType.BR].includes(contentNode.type)) return null; // i dont think we should br, else outlines will get longer
  // --- Table
  if (contentNode.type === ContentNodeType.TABLE) {
    return (
      <table>
        <thead>
          <tr>
            {get(contentNode, "items[0].cells", {}).map((cell, ci) => (
              <th key={ci}>
                {contentNodeToOutlineNode({
                  contentNode: cell,
                  contentNodeIndex: ci,
                  context: ctx,
                  graphJSON,
                  outliner,
                })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {get(contentNode, "items", [])
            .slice(1)
            .map((row, ri) => (
              <tr key={row.id}>
                {(row.cells || []).map((td, tdi) => (
                  <td key={tdi}>
                    {td.map((c, ci) =>
                      contentNodeToOutlineNode({
                        contentNode: c,
                        contentNodeIndex: ci,
                        context: ctx,
                        graphJSON,
                        outliner,
                      })
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
  // --- Callouts
  // --- Cards
  if (contentNode.type === ContentNodeType.CARD) {
    return (
      <>
        {contentNode.content.map((newNode, nci) => (
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
      </>
    );
  }
  // --- Collapsible Panels
  if (contentNode.type === ContentNodeType.COLLAPSIBLE_PANEL) {
    return (
      <>
        <h3>{contentNode.title}</h3>
        {contentNode.content.map((newNode, nci) => (
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
      </>
    );
  }
  // --- Resources
  if (contentNode.type === ContentNodeType.RESOURCE_EDITOR) {
    return (
      <div className="outline__component">
        {contentNode.content.map((newNode, nci) => (
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
    );
  }
  if (contentNode.type === ContentNodeType.RESOURCES_LIST) {
    return <div className="outline__component-place-holder">Resources List: {contentNode.resourceType}</div>;
  }
  // --- Buttons
  if (contentNode.type === ContentNodeType.BUTTON_LINK) {
    return (
      <div key={ci}>
        <button disabled title={contentNode.href}>
          {contentNode.text} [⬈]
        </button>
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.BUTTON) {
    return (
      <div
        key={ci}
        className={get(contentNode, "attrs.className") === "x-wizard__header-back-button" ? "back-button" : ""}
      >
        <button
          className={get(contentNode, "attrs.className") === "x-wizard__header-back-button" ? "back-button" : ""}
          disabled={!contentNode.event}
          onClick={() => {
            if (graphJSON && contentNode.event) {
              outliner.setNodeHighlights({
                sourceId: graphJSON.id,
                targetIds: graphJSON.edges
                  .filter((e) => (contentNode.event.type ? contentNode.event.type : contentNode.event) === e.label.text)
                  .map((e) => get(e, "target.id")),
              });
            }
          }}
        >
          {contentNode.text} {!contentNode.event ? "(No Transition)" : ""}
        </button>
      </div>
    );
  }
  // --- Inputs
  if (contentNode.type === ContentNodeType.INPUT) {
    return (
      <div className="input" key={ci}>
        {contentNode.label && (
          <label>
            {contentNode.label ? contentNode.label : ""}
            {contentNode.validations && contentNode.validations.includes("required") ? (
              <>
                <span className="required-star">*</span>
              </>
            ) : (
              ""
            )}
          </label>
        )}
        <input type={contentNode.inputType} disabled />
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.TEXTAREA) {
    return (
      <div className="input" key={ci}>
        {contentNode.label && (
          <label>
            {contentNode.label ? contentNode.label : ""}
            {contentNode.validations && contentNode.validations.includes("required") ? (
              <>
                <span className="required-star">*</span>
              </>
            ) : (
              ""
            )}
          </label>
        )}
        <br />
        <textarea disabled />
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.SELECT) {
    const selectOptions = evalSelectOptions(contentNode.options, { content: contentNode.contentTree, context: ctx });
    return (
      <div className="input" key={ci}>
        {contentNode.label && <label>{contentNode.label ? <>{contentNode.label}</> : ""}</label>}
        <select>
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.INPUT_CHECKBOX_BUTTON) {
    return (
      <div className="input">
        <button key={ci} type={contentNode.inputType} disabled style={{ textAlign: "left", width: "100%" }}>
          ☑︎ {contentNode.text}
        </button>
      </div>
    );
  }
  if ([ContentNodeType.MULTI_SELECT, ContentNodeType.RADIO_SELECT].includes(contentNode.type)) {
    return (
      <div className="input">
        {contentNode.options.map((option) => (
          <div key={option.text}>
            <input type={contentNode.type === "radioSelect" ? "radio" : "checkbox"} />
            {option.text}
          </div>
        ))}
      </div>
    );
  }
  if (contentNode.type === ContentNodeType.ADDRESS) {
    return (
      <>
        {contentNode.config?.street1?.enabled && (
          <div className="input">
            <label>Street 1</label>
            <input type="text" disabled />
          </div>
        )}
        {contentNode.config?.street2?.enabled && (
          <div className="input">
            <label>Street 2</label>
            <input type="text" disabled />
          </div>
        )}
        {contentNode.config?.notStable?.enabled === true && (
          <div className="input">
            <label>I am experiencing homelessness</label>
            <input type="checkbox" disabled />
          </div>
        )}
        {contentNode.config?.county?.enabled === true && (
          <div className="input">
            <label>County</label>
            <input type="text" disabled />
          </div>
        )}
        {contentNode.config?.city?.enabled && (
          <div className="input">
            <label>City</label>
            <input type="text" disabled />
          </div>
        )}
        {contentNode.config?.state?.enabled && (
          <div className="input">
            <label>State</label>
            <select disabled />
          </div>
        )}
        {contentNode.config?.country?.enabled === true && (
          <div className="input">
            <label>Country</label>
            <select disabled />
          </div>
        )}
      </>
    );
  }
  // --- Function
  // If this function is generated w/ context info, try to render both failure/pass states
  if (typeof contentNode === "function") {
    try {
      const nodesIfTrue = contentNode({ __outline__: true, ...ctx });
      const nodesIfFalse = contentNode({ __outline__: false, ...ctx });
      // Functions are sometimes just using context to change copy. Don't double render if same in either state
      const nodesAreSame = isEqual(JSON.stringify(nodesIfTrue), JSON.stringify(nodesIfFalse));
      const nodesBothHaveLength = nodesIfTrue.length > 0 && nodesIfFalse.length > 0;
      return (
        <div key={ci} className="conditional-ui">
          {nodesAreSame && nodesBothHaveLength ? (
            <div>
              {contentNode({ __outline__: true, ...ctx }).length &&
                contentNode({ __outline__: true, ...ctx }).map((newNode, nci) =>
                  contentNodeToOutlineNode({
                    contentNode: newNode,
                    contentNodeIndex: nci,
                    context: ctx,
                    graphJSON,
                    outliner,
                  })
                )}
            </div>
          ) : (
            <>
              {contentNode({ __outline__: true, ...ctx }).length > 0 && (
                <div className="conditional-segment">
                  {contentNode({ __outline__: true, ...ctx }).map((newNode, nci) => (
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
              )}
              {contentNode({ __outline__: false, ...ctx }).legnth > 0 && (
                <div className="conditional-segment">
                  {contentNode({ __outline__: false, ...ctx }).map((newNode, nci) => (
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
              )}
            </>
          )}
        </div>
      );
    } catch (e) {
      // This is bound to be buggy af
      console.error(`Outline Rendering Error: ${e.message}`, e);
      return (
        <div key={ci}>
          <small>
            {" "}
            {"<<"}Error rendering this node{">>"}
          </small>
        </div>
      );
    }
  }
};
