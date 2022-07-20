import { cloneDeep, difference, omit, startCase } from "lodash";
import React from "react";
import styled from "styled-components";
import {
  ContentNodeType,
  ContentNodeInputType,
  SerializedStyledComponentKeys,
  $TSFixMe,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { updateArrayItem, reorderArrayItem, removeArrayItem, REORDER_DIRECTION } from "../../utils";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";
import { ContentNodeAdder, isSpecialBackButton } from "./ContentNodeAdder";
import { ContentNodeValidationList } from "./ContentNodeValidationList";
import { ContentNodeAttrsEditor } from "./ContentNodeAttrsEditor";
import { CONTENT_NODE_OPTIONS_TEXT } from "./consts";
import { ContentNodeEventEditor } from "./ContentNodeEventEditor";
import { InputAssign } from "../logic/InputAssign";

type TContentNodeEditorProps = {
  contentNode: $TSFixMe;
  contentNodeIndex: $TSFixMe;
  contentTree?: $TSFixMe;
  models: $TSFixMe;
  modelsConfigs: $TSFixMe;
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  state: $TSFixMe;
  onUpdate: $TSFixMe;
  onReorder: $TSFixMe;
  onDelete: $TSFixMe;
};

export const ContentNodeEditor: React.FC<TContentNodeEditorProps> = ({
  contentNode,
  contentNodeIndex,
  contentTree,
  models,
  modelsConfigs,
  schema,
  serializations,
  state,
  onUpdate,
  onReorder,
  onDelete,
}) => {
  const contentNodeUpdateHandler = (key, value) => {
    const newContentNode = cloneDeep(contentNode);
    newContentNode[key] = value;
    onUpdate(newContentNode);
  };

  return (
    <StyledContentNodeEditor>
      {/* TYPE */}
      <div className="content-node__type">
        {/* For text options, let a person change the sizing/category. Everything else is set bc of incompatible options/config */}
        {CONTENT_NODE_OPTIONS_TEXT.includes(contentNode.type) ? (
          <select value={contentNode.type} onChange={(e) => contentNodeUpdateHandler("type", e.target.value)}>
            {CONTENT_NODE_OPTIONS_TEXT.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        ) : (
          <input
            defaultValue={contentNode.type}
            disabled
            // ???
          />
        )}
      </div>

      {/* CONFIGURATION */}
      <div className="content-node__config">
        {/* --- BUTTON --- */}
        {[ContentNodeType.BUTTON, ContentNodeType.BUTTON_LINK].includes(contentNode.type) &&
          !isSpecialBackButton(contentNode) && (
            <>
              <input
                type="text"
                placeholder="Button Text"
                value={contentNode.text}
                onChange={(e) => contentNodeUpdateHandler("text", e.target.value)}
              />
              {[ContentNodeType.BUTTON_LINK].includes(contentNode.type) ? (
                <input
                  type="url"
                  value={contentNode.href}
                  placeholder="URL (ex: https://.....)"
                  onChange={(e) => contentNodeUpdateHandler("href", e.target.value)}
                />
              ) : (
                <select
                  value={contentNode.buttonType}
                  onChange={(e) => contentNodeUpdateHandler("buttonType", e.target.value)}
                  style={{ display: "flex", maxWidth: "120px" }}
                >
                  <option value="">Basic Button</option>
                  <option value="submit">Submit Button (Reqs Validation)</option>
                </select>
              )}
              {contentNode.event?.type != null ? (
                <ContentNodeEventEditor
                  contentTree={contentTree}
                  event={contentNode.event}
                  models={models}
                  schema={schema}
                  serializations={serializations}
                  state={state}
                  onChange={(event) => contentNodeUpdateHandler("event", event)}
                />
              ) : (
                <label className="content-node__config__event-trigger">
                  <small>💥 Event:</small>
                  <select
                    value={contentNode.event?.type}
                    onChange={(e) => contentNodeUpdateHandler("event", { type: e.target.value })}
                    style={{ display: "flex", maxWidth: "120px" }}
                  >
                    <option value=""></option>
                    {Object.keys(state.on).map((on) => (
                      <option key={on} value={on}>
                        {on}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
        {/* --- BUTTON: BACK --- */}
        {[ContentNodeType.BUTTON].includes(contentNode.type) && isSpecialBackButton(contentNode) && (
          <>
            <input value="Back" disabled />
            <button disabled>💥 Event: {contentNode.event}</button>
          </>
        )}
        {/* --- COMPONENT --- */}
        {[ContentNodeType.COMPONENT].includes(contentNode.type) && (
          <select value={contentNode.component} onChange={(e) => contentNodeUpdateHandler("component", e.target.value)}>
            <option value=""></option>
            {difference(Object.keys(serializations.components ?? {}), Object.values(SerializedStyledComponentKeys)).map(
              (on) => (
                <option key={on} value={on}>
                  {on}
                </option>
              )
            )}
          </select>
        )}
        {/* --- CONDITIONAL --- */}
        {[ContentNodeType.CONDITIONAL].includes(contentNode.type) && (
          <div className="content-node__config__stack">
            <table>
              <tbody>
                <tr>
                  <td className="stack-label">
                    <small>Conditional: </small>
                  </td>
                  <td>
                    <JsonLogicBuilder
                      contentTree={contentTree}
                      functions={serializations?.functions ?? {}}
                      jsonLogic={contentNode.conditional}
                      onUpdate={(jsonLogic) => contentNodeUpdateHandler("conditional", jsonLogic)}
                      models={models}
                      schema={schema}
                      state={state}
                    />
                  </td>
                  <td></td>
                </tr>
                {Object.keys(contentNode.options ?? {}).map((option) => (
                  <tr key={option}>
                    <td className="stack-label">
                      <small>{option}</small>
                    </td>
                    <td>
                      <div className="spell-state__content-nodes--nested">
                        {contentNode.options?.[option]?.map((node, nodeIndex) => (
                          <ContentNodeEditor
                            key={`${node.value}-${node.type}-${nodeIndex}`}
                            contentNode={node}
                            contentNodeIndex={nodeIndex}
                            contentTree={{ node: { ...contentTree } }}
                            models={models}
                            modelsConfigs={modelsConfigs}
                            schema={schema}
                            serializations={serializations}
                            state={state}
                            onUpdate={(updatedNode) =>
                              contentNodeUpdateHandler("options", {
                                ...contentNode.options,
                                [option]: updateArrayItem(contentNode.options[option], updatedNode, nodeIndex),
                              })
                            }
                            onReorder={(direction) =>
                              contentNodeUpdateHandler("options", {
                                ...contentNode.options,
                                [option]: reorderArrayItem(contentNode.options[option], nodeIndex, direction),
                              })
                            }
                            onDelete={() =>
                              contentNodeUpdateHandler("options", {
                                ...contentNode.options,
                                [option]: removeArrayItem(contentNode.options[option], nodeIndex),
                              })
                            }
                          />
                        ))}
                        <ContentNodeAdder
                          excludeGroups={["Navigation"]}
                          onAdd={(node) =>
                            contentNodeUpdateHandler("options", {
                              ...contentNode.options,
                              [option]: contentNode?.options[option].concat(node),
                            })
                          }
                        />
                      </div>
                    </td>
                    <td>
                      <button onClick={() => contentNodeUpdateHandler("options", omit(contentNode.options, [option]))}>
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="stack-label">
                    <button
                      onClick={() => {
                        const newCondition = prompt("Condition value:");
                        if (newCondition)
                          contentNodeUpdateHandler("options", { ...contentNode.options, [newCondition]: [] });
                      }}
                    >
                      + Option
                    </button>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* --- FOR EACH --- */}
        {[ContentNodeType.FOR_EACH].includes(contentNode.type) && (
          <div className="content-node__config__stack">
            <table>
              <tbody>
                <tr>
                  <td className="stack-label">
                    <small>Options: </small>
                    <div className="stack-label__actions">
                      <small onClick={() => contentNodeUpdateHandler("items", [])}>
                        <u>+ Values</u>
                      </small>
                      <small onClick={() => contentNodeUpdateHandler("items", {})}>
                        <u>+ Logic</u>
                      </small>
                    </div>
                  </td>
                  <td>
                    {/* IF VALUES ARR */}
                    {Array.isArray(contentNode.items) && (
                      <table className="content-node__config__select-options">
                        <tbody>
                          <tr>
                            <td className="field"></td>
                            <td className="field"></td>
                            <td>
                              <button onClick={() => contentNodeUpdateHandler("items", contentNode.items.concat({}))}>
                                +
                              </button>
                            </td>
                          </tr>
                          {contentNode.items.map((opt, optItem) => (
                            <tr>
                              <td className="field">
                                <input
                                  value={opt.text}
                                  placeholder="Item Label"
                                  onChange={(e) => {
                                    const newItems = contentNode.items;
                                    newItems[optItem].text = e.target.value;
                                    contentNodeUpdateHandler("items", newItems);
                                  }}
                                />
                              </td>
                              <td className="field">
                                <input
                                  value={opt.value}
                                  placeholder="Item Value"
                                  onChange={(e) => {
                                    const newItems = contentNode.items;
                                    newItems[optItem].value = e.target.value;
                                    contentNodeUpdateHandler("items", newItems);
                                  }}
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    contentNodeUpdateHandler("items", removeArrayItem(contentNode.items, optItem))
                                  }
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {/* IF OBJ */}
                    {contentNode.items &&
                      typeof contentNode.items === "object" &&
                      !Array.isArray(contentNode.items) && (
                        <JsonLogicBuilder
                          contentTree={contentTree}
                          functions={serializations?.functions ?? {}}
                          jsonLogic={contentNode.items}
                          onUpdate={(jsonLogic) => contentNodeUpdateHandler("items", jsonLogic)}
                          models={models}
                          schema={schema}
                          state={state}
                        />
                      )}
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Content: </small>
                  </td>
                  <td>
                    <div className="spell-state__content-nodes--nested">
                      {contentNode.content?.map((node, nodeIndex) => (
                        <ContentNodeEditor
                          key={`${node.value}-${node.type}-${nodeIndex}`}
                          contentNode={node}
                          contentNodeIndex={nodeIndex}
                          contentTree={{ node: { ...contentTree } }}
                          models={models}
                          modelsConfigs={modelsConfigs}
                          schema={schema}
                          serializations={serializations}
                          state={state}
                          onUpdate={(updatedNode) =>
                            contentNodeUpdateHandler(
                              "content",
                              updateArrayItem(contentNode.content, updatedNode, nodeIndex)
                            )
                          }
                          onReorder={(direction) => {
                            contentNodeUpdateHandler(
                              "content",
                              reorderArrayItem(contentNode.content, nodeIndex, direction)
                            );
                          }}
                          onDelete={() => {
                            contentNodeUpdateHandler("content", removeArrayItem(contentNode.content, nodeIndex));
                          }}
                        />
                      ))}
                      <ContentNodeAdder
                        excludeGroups={["Navigation"]}
                        onAdd={(node) => contentNodeUpdateHandler("content", (contentNode?.content ?? []).concat(node))}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* --- IMG --- */}
        {[ContentNodeType.IMG].includes(contentNode.type) && (
          <>
            <input
              type="url"
              value={contentNode.src}
              placeholder="https://...."
              onChange={(e) => contentNodeUpdateHandler("src", e.target.value)}
            />
            <input
              type="text"
              value={contentNode.alt}
              placeholder="Alt-Text"
              onChange={(e) => contentNodeUpdateHandler("alt", e.target.value)}
            />
          </>
        )}
        {/* --- INPUT --- */}
        {[ContentNodeType.INPUT].includes(contentNode.type) && (
          <div className="content-node__config__stack">
            <table>
              <tbody>
                <tr>
                  <td className="stack-label">
                    <small>Label: </small>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={contentNode.label}
                      onChange={(e) => contentNodeUpdateHandler("label", e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Input Type: </small>
                  </td>
                  <td>
                    <select
                      value={contentNode.inputType}
                      onChange={(e) => contentNodeUpdateHandler("inputType", e.target.value)}
                    >
                      <option value=""></option>
                      {Object.values(ContentNodeInputType).map((type) => (
                        <option key={type} value={type}>
                          {startCase(type)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Placeholder: </small>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={contentNode.placeholder}
                      onChange={(e) => contentNodeUpdateHandler("placeholder", e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Assign: </small>
                  </td>
                  <td>
                    <InputAssign
                      contentTree={contentTree}
                      functions={serializations?.functions ?? {}}
                      models={models}
                      modelsConfigs={modelsConfigs}
                      onChange={(assign) => contentNodeUpdateHandler("assign", assign)}
                      schema={schema}
                      state={state}
                      value={contentNode.assign}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Validations:</small>
                  </td>
                  <td>
                    <ContentNodeValidationList
                      value={contentNode.validations}
                      onChange={(validations) => contentNodeUpdateHandler("validations", validations)}
                      validations={serializations.validations}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* --- CALLOUT/ROW --- */}
        {[ContentNodeType.CALLOUT, ContentNodeType.ROW, ContentNodeType.OL, ContentNodeType.UL].includes(
          contentNode.type
        ) && (
          <div className="spell-state__content-nodes--nested">
            {contentNode.content?.map((node, nodeIndex) => (
              <ContentNodeEditor
                key={`${node.value}-${node.type}-${nodeIndex}`}
                contentNode={node}
                contentNodeIndex={nodeIndex}
                contentTree={{ node: { ...contentTree } }}
                models={models}
                modelsConfigs={modelsConfigs}
                schema={schema}
                serializations={serializations}
                state={state}
                onUpdate={(updatedNode) =>
                  contentNodeUpdateHandler("content", updateArrayItem(contentNode.content, updatedNode, nodeIndex))
                }
                onReorder={(direction) => {
                  contentNodeUpdateHandler("content", reorderArrayItem(contentNode.content, nodeIndex, direction));
                }}
                onDelete={() => {
                  contentNodeUpdateHandler("content", removeArrayItem(contentNode.content, nodeIndex));
                }}
              />
            ))}
            <ContentNodeAdder
              excludeGroups={["Navigation"]}
              onAdd={(node) => contentNodeUpdateHandler("content", (contentNode?.content ?? []).concat(node))}
            />
          </div>
        )}
        {/* --- SELECT --- */}
        {[ContentNodeType.SELECT, ContentNodeType.MULTI_SELECT, ContentNodeType.RADIO_SELECT].includes(
          contentNode.type
        ) && (
          <div className="content-node__config__stack">
            <table>
              <tbody>
                <tr>
                  <td className="stack-label">
                    <small>Label: </small>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={contentNode.label}
                      onChange={(e) => contentNodeUpdateHandler("label", e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Options: </small>
                    <div className="stack-label__actions">
                      <small onClick={() => contentNodeUpdateHandler("options", [])}>
                        <u>+ Values</u>
                      </small>
                      <small onClick={() => contentNodeUpdateHandler("options", {})}>
                        <u>+ Logic</u>
                      </small>
                    </div>
                  </td>
                  <td>
                    {/* IF VALUES ARR */}
                    {Array.isArray(contentNode.options) && (
                      <table className="content-node__config__select-options">
                        <tbody>
                          <tr>
                            <td className="select-options__header">
                              <small>
                                <b>Option Label</b>
                              </small>
                            </td>
                            <td className="select-options__header">
                              <small>
                                <b>Option Value</b>
                              </small>
                            </td>
                            <td>
                              <button
                                onClick={() => contentNodeUpdateHandler("options", contentNode.options.concat({}))}
                              >
                                +
                              </button>
                            </td>
                          </tr>
                          {contentNode.options.map((opt, optIndex) => (
                            <tr>
                              <td className="field">
                                <input
                                  value={opt.text}
                                  placeholder="Option Label"
                                  onChange={(e) => {
                                    const newOpts = contentNode.options;
                                    newOpts[optIndex].text = e.target.value;
                                    contentNodeUpdateHandler("options", newOpts);
                                  }}
                                />
                              </td>
                              <td className="field">
                                {typeof opt.value === "boolean" && (
                                  <input
                                    type="checkbox"
                                    checked={opt.value}
                                    onChange={(e) => {
                                      const newOpts = contentNode.options;
                                      newOpts[optIndex].value = Boolean(e.target.checked);
                                      contentNodeUpdateHandler("options", newOpts);
                                    }}
                                  />
                                )}
                                {typeof opt.value === "number" && (
                                  <input
                                    type="number"
                                    value={opt.value}
                                    onChange={(e) => {
                                      const newOpts = contentNode.options;
                                      newOpts[optIndex].value = Number(e.target.value);
                                      contentNodeUpdateHandler("options", newOpts);
                                    }}
                                  />
                                )}
                                {typeof opt.value === "string" && (
                                  <input
                                    type="text"
                                    value={opt.value}
                                    placeholder="Option Value"
                                    onChange={(e) => {
                                      const newOpts = contentNode.options;
                                      newOpts[optIndex].value = e.target.value;
                                      contentNodeUpdateHandler("options", newOpts);
                                    }}
                                  />
                                )}
                                {opt.value == null && (
                                  <div>
                                    <small
                                      onClick={() => {
                                        const newOpts = contentNode.options;
                                        newOpts[optIndex].value = "";
                                        contentNodeUpdateHandler("options", newOpts);
                                      }}
                                    >
                                      + Str
                                    </small>
                                    <small
                                      onClick={() => {
                                        const newOpts = contentNode.options;
                                        newOpts[optIndex].value = 0;
                                        contentNodeUpdateHandler("options", newOpts);
                                      }}
                                    >
                                      + Num
                                    </small>
                                    <small
                                      onClick={() => {
                                        const newOpts = contentNode.options;
                                        newOpts[optIndex].value = false;
                                        contentNodeUpdateHandler("options", newOpts);
                                      }}
                                    >
                                      + Bool
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    contentNodeUpdateHandler("options", removeArrayItem(contentNode.options, optIndex))
                                  }
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {/* IF OBJ */}
                    {contentNode.options &&
                      typeof contentNode.options === "object" &&
                      !Array.isArray(contentNode.options) && (
                        <JsonLogicBuilder
                          contentTree={contentTree}
                          functions={serializations?.functions ?? {}}
                          jsonLogic={contentNode.options}
                          onUpdate={(jsonLogic) => contentNodeUpdateHandler("options", jsonLogic)}
                          models={models}
                          schema={schema}
                          state={state}
                        />
                      )}
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Assign: </small>
                  </td>
                  <td>
                    <InputAssign
                      contentTree={contentTree}
                      functions={serializations?.functions ?? {}}
                      models={models}
                      modelsConfigs={modelsConfigs}
                      onChange={(assign) => contentNodeUpdateHandler("assign", assign)}
                      schema={schema}
                      state={state}
                      value={contentNode.assign}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Validations:</small>
                  </td>
                  <td>
                    <ContentNodeValidationList
                      value={contentNode.validations}
                      onChange={(validations) => contentNodeUpdateHandler("validations", validations)}
                      validations={serializations.validations}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* --- TEXT --- */}
        {CONTENT_NODE_OPTIONS_TEXT.includes(contentNode.type) && (
          <>
            {/* If a paragraph tag, use a textarea since there will prob be more writing */}
            {[ContentNodeType.P, ContentNodeType.TEXTAREA].includes(contentNode.type) ? (
              <textarea
                value={contentNode.text}
                rows={3}
                onChange={(e) => contentNodeUpdateHandler("text", e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={contentNode.text}
                onChange={(e) => contentNodeUpdateHandler("text", e.target.value)}
              />
            )}
          </>
        )}
        {/* --- VIDEO --- */}
        {[ContentNodeType.VIDEO].includes(contentNode.type) && (
          <>
            <input
              type="url"
              value={contentNode.url}
              placeholder="https://...."
              onChange={(e) => contentNodeUpdateHandler("url", e.target.value)}
            />
          </>
        )}
      </div>

      {/* ATTRS */}
      <ContentNodeAttrsEditor
        attrs={contentNode.attrs}
        type={contentNode.type}
        onUpdate={(attrs) => contentNodeUpdateHandler("attrs", attrs)}
      />

      {/* REORDERING */}
      <div className="content-node__reorder-handle">
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "30px" }}>
          <button
            disabled={contentNodeIndex === 0}
            onClick={() => onReorder(REORDER_DIRECTION.UP)}
            style={{ maxHeight: "13px" }}
          >
            ⬆︎
          </button>
          <button
            disabled={contentNodeIndex === state.content.length - 1}
            onClick={() => onReorder(REORDER_DIRECTION.DOWN)}
            style={{ maxHeight: "13px" }}
          >
            ⬇︎
          </button>
        </div>
        <button onClick={onDelete}>❌</button>
      </div>
    </StyledContentNodeEditor>
  );
};

const StyledContentNodeEditor = styled.div`
  display: flex;
  width: 100%;
  .content-node__type {
    max-width: 80px;
    width: 100%;
    display: flex;
    input,
    select {
      flex-grow: 1;
      width: 100%;
    }
  }
  .content-node__config {
    width: 100%;
    display: flex;
    justify-content: space-between;
    input,
    textarea {
      flex-grow: 1;
    }
  }
  .content-node__config__stack {
    display: flex;
    width: 100%;
    table {
      flex-grow: 1;
    }
    td {
      border: 1px solid #ccc;
      width: 100%;
      input,
      select {
        width: 100%;
      }
      &.stack-label {
        max-width: 220px;
        width: 15%;
        font-size: 12px;
        .stack-label__actions {
          small {
            margin-right: 4px;
            font-size: 10px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .content-node__config__event-trigger {
    display: flex;
    & > small {
      margin: 0 4px;
    }
  }
  .content-node__reorder-handle {
    display: flex;
    button {
      font-size: 7px;
    }
  }
  .content-node__config__select-options {
    width: 100%;
    .field {
      // flex-grow: 1;
      width: 48%;
      max-width: 48%;
      min-width: 48%;
    }
    .select-options__header {
      width: 48%;
      max-width: 48%;
      min-width: 48%;
      font-size: 13px;
      small {
        margin-left: 4px;
      }
    }
    small {
      font-size: 10px;
      margin-right: 6px;
    }
  }
`;
