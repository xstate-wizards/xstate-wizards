import { cloneDeep, difference, omit, set, startCase } from "lodash";
import React from "react";
import {
  ContentNodeType,
  ContentNodeInputType,
  SerializedStyledComponentKeys,
  $TSFixMe,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { updateArrayItem, reorderArrayItem, removeArrayItem, REORDER_DIRECTION } from "../../utils";
import { useEditor } from "../../stores/EditorStore";
import { LocalizedInput } from "../inputs/LocalizedInput";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";
import { ContentNodeAdder, isSpecialBackButton } from "./ContentNodeAdder";
import { ContentNodeValidationList } from "./ContentNodeValidationList";
import { ContentNodeAttrsEditor } from "./ContentNodeAttrsEditor";
import { CONTENT_NODE_OPTIONS_TEXT } from "./consts";
import { ContentNodeEventEditor } from "./ContentNodeEventEditor";
import { InputAssign } from "../logic/InputAssign";

type TContentNodeEditorProps = {
  canAssign?: boolean;
  canReorder?: boolean;
  contentNode: $TSFixMe;
  contentNodeIndex: $TSFixMe;
  contentNodeStack?: $TSFixMe;
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
  canAssign = true,
  canReorder = true,
  contentNode,
  contentNodeIndex,
  contentNodeStack,
  models,
  modelsConfigs,
  schema,
  serializations,
  state,
  onUpdate,
  onReorder,
  onDelete,
}) => {
  const editorStore = useEditor();
  const activeLocale = editorStore.activeEditingLocale || "en";

  const contentNodeUpdateHandler = (key, value) => {
    console.debug("ContentNodeEditor.contentNodeUpdateHandler", { key, value });
    const newContentNode = cloneDeep(contentNode);
    set(newContentNode, key, value);
    onUpdate(newContentNode);
  };

  return (
    <div className="xw-sb__content-node-editor">
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
              <LocalizedInput
                activeLocale={activeLocale}
                placeholder="Button Text"
                value={contentNode.text}
                onChange={(text) => contentNodeUpdateHandler("text", text)}
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
                  contentNodeStack={contentNodeStack}
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
                    onChange={(e) =>
                      contentNodeUpdateHandler("event", {
                        type: e.target.value,
                      })
                    }
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
                      contentNodeStack={contentNodeStack}
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
                      <div className="xw-sb__spell-state__content-nodes--nested">
                        {contentNode.options?.[option]?.map((node, nodeIndex) => (
                          <ContentNodeEditor
                            key={`${node.value}-${node.type}-${nodeIndex}`}
                            contentNode={node}
                            contentNodeIndex={nodeIndex}
                            contentNodeStack={[contentNode, ...contentNodeStack]}
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
                          contentNodeUpdateHandler("options", {
                            ...contentNode.options,
                            [newCondition]: [],
                          });
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
                            <tr key={optItem}>
                              <td className="field">
                                <LocalizedInput
                                  activeLocale={activeLocale}
                                  value={opt.text}
                                  placeholder="Item Label"
                                  onChange={(text) => {
                                    const newItems = [...contentNode.items];
                                    newItems[optItem] = { ...newItems[optItem], text };
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
                          contentNodeStack={contentNodeStack}
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
                    <div className="xw-sb__spell-state__content-nodes--nested">
                      {contentNode.content?.map((node, nodeIndex) => (
                        <ContentNodeEditor
                          key={`${node.value}-${node.type}-${nodeIndex}`}
                          contentNode={node}
                          contentNodeIndex={nodeIndex}
                          contentNodeStack={[contentNode, ...contentNodeStack]}
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
            <LocalizedInput
              activeLocale={activeLocale}
              value={contentNode.alt}
              placeholder="Alt-Text"
              onChange={(alt) => contentNodeUpdateHandler("alt", alt)}
            />
          </>
        )}
        {/* --- INPUT --- */}
        {[ContentNodeType.INPUT, ContentNodeType.JSON_ARRAY, ContentNodeType.TEXTAREA].includes(contentNode.type) && (
          <div className="content-node__config__stack">
            <table>
              <tbody>
                <tr>
                  <td className="stack-label">
                    <small>Label: </small>
                  </td>
                  <td>
                    <LocalizedInput
                      activeLocale={activeLocale}
                      value={contentNode.label}
                      onChange={(label) => contentNodeUpdateHandler("label", label)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Byline: </small>
                  </td>
                  <td>
                    <LocalizedInput
                      activeLocale={activeLocale}
                      value={contentNode.labelByLine}
                      placeholder="Optional byline text"
                      onChange={(labelByLine) => contentNodeUpdateHandler("labelByLine", labelByLine)}
                    />
                  </td>
                </tr>
                {![ContentNodeType.JSON_ARRAY, ContentNodeType.TEXTAREA].includes(contentNode.type) && (
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
                        {Object.values(ContentNodeInputType)
                          .filter((type) => !["calendar"].includes(type))
                          .map((type) => (
                            <option key={type} value={type}>
                              {startCase(type)}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                )}
                {![ContentNodeType.JSON_ARRAY].includes(contentNode.type) &&
                  !["age", "date"].includes(contentNode.inputType) && (
                    <tr>
                      <td className="stack-label">
                        <small>Placeholder: </small>
                      </td>
                      <td>
                        <LocalizedInput
                          activeLocale={activeLocale}
                          value={contentNode.placeholder}
                          placeholder="Placeholder text"
                          onChange={(placeholder) => contentNodeUpdateHandler("placeholder", placeholder)}
                        />
                      </td>
                    </tr>
                  )}
                {["date"].includes(contentNode.inputType) && (
                  <>
                    <tr>
                      <td className="stack-label">
                        <small>Start/End Dates: </small>
                      </td>
                      <td>
                        <input
                          type="date"
                          value={contentNode.dateStart}
                          onChange={(e) => contentNodeUpdateHandler("dateStart", e.target.value)}
                        />
                        <input
                          type="date"
                          value={contentNode.dateEnd}
                          onChange={(e) => contentNodeUpdateHandler("dateEnd", e.target.value)}
                        />
                      </td>
                    </tr>
                  </>
                )}
                {[ContentNodeType.JSON_ARRAY].includes(contentNode.type) && (
                  <>
                    <tr>
                      <td className="stack-label">
                        <small>Item Properties: </small>
                      </td>
                      <td>
                        <table className="content-node__config__select-options">
                          <tbody>
                            {Object.keys(contentNode.config?.schema ?? {})?.map((propertyName) => (
                              <tr key={propertyName}>
                                <td className="stack-label" style={{ maxWidth: "80px" }}>
                                  <small>
                                    {propertyName}&ensp;
                                    <button
                                      onClick={() =>
                                        contentNodeUpdateHandler("config", {
                                          ...(contentNode.config ?? {}),
                                          schema: omit(contentNode.config?.schema ?? {}, propertyName),
                                        })
                                      }
                                    >
                                      -
                                    </button>
                                  </small>
                                </td>
                                <td>
                                  {contentNode.config?.schema?.[propertyName] ? (
                                    <ContentNodeEditor
                                      canAssign={false}
                                      canReorder={false}
                                      contentNode={contentNode.config?.schema?.[propertyName]}
                                      contentNodeIndex={contentNodeIndex}
                                      contentNodeStack={[contentNode, ...contentNodeStack]}
                                      models={models}
                                      modelsConfigs={modelsConfigs}
                                      schema={schema}
                                      serializations={serializations}
                                      state={state}
                                      onUpdate={(updatedNode) =>
                                        contentNodeUpdateHandler("config", {
                                          ...(contentNode.config ?? {}),
                                          schema: {
                                            ...(contentNode.config?.schema ?? {}),
                                            [propertyName]: updatedNode,
                                          },
                                        })
                                      }
                                      onReorder={() => null}
                                      onDelete={() =>
                                        contentNodeUpdateHandler("config", {
                                          ...(contentNode.config ?? {}),
                                          schema: {
                                            ...(contentNode.config?.schema ?? {}),
                                            [propertyName]: null,
                                          },
                                        })
                                      }
                                    />
                                  ) : (
                                    <ContentNodeAdder
                                      excludeGroups={["Navigation"]}
                                      includeTypes={[ContentNodeType.INPUT, ContentNodeType.SELECT]}
                                      onAdd={(node) =>
                                        contentNodeUpdateHandler("config", {
                                          ...(contentNode.config ?? {}),
                                          schema: {
                                            ...(contentNode.config?.schema ?? {}),
                                            [propertyName]: node,
                                          },
                                        })
                                      }
                                    />
                                  )}
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td colSpan={2}>
                                <button
                                  onClick={() => {
                                    const newPropertyName = prompt("Property Name");
                                    contentNodeUpdateHandler("config", {
                                      ...(contentNode.config ?? {}),
                                      schema: {
                                        ...(contentNode.config?.schema ?? {}),
                                        [newPropertyName]: null,
                                      },
                                    });
                                  }}
                                >
                                  <small>+ Add Property</small>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td className="stack-label">
                        <small>+ Add ____: </small>
                      </td>
                      <td>
                        <LocalizedInput
                          activeLocale={activeLocale}
                          value={contentNode?.config?.addLabel}
                          placeholder="Add label"
                          onChange={(addLabel) =>
                            contentNodeUpdateHandler("config", {
                              ...(contentNode.config ?? {}),
                              addLabel,
                            })
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="stack-label">
                        <small>Limit: </small>
                      </td>
                      <td style={{ display: "flex" }}>
                        <input
                          type="number"
                          value={contentNode?.config?.limit ?? ""}
                          onChange={(e) =>
                            contentNodeUpdateHandler("config", {
                              ...(contentNode.config ?? {}),
                              limit: Number(e.target.value),
                            })
                          }
                        />
                        <button
                          onClick={(e) =>
                            contentNodeUpdateHandler("config", {
                              ...(contentNode.config ?? {}),
                              limit: null,
                            })
                          }
                        >
                          No&nbsp;Limit
                        </button>
                      </td>
                    </tr>
                  </>
                )}
                {canAssign && (
                  <tr>
                    <td className="stack-label">
                      <small>Assign: </small>
                    </td>
                    <td>
                      <InputAssign
                        contentNodeStack={contentNodeStack}
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
                )}
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
          <div className="xw-sb__spell-state__content-nodes--nested">
            {contentNode.content?.map((node, nodeIndex) => (
              <ContentNodeEditor
                key={`${node.value}-${node.type}-${nodeIndex}`}
                contentNode={node}
                contentNodeIndex={nodeIndex}
                contentNodeStack={[contentNode, ...contentNodeStack]}
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
                    <LocalizedInput
                      activeLocale={activeLocale}
                      value={contentNode.label}
                      onChange={(label) => contentNodeUpdateHandler("label", label)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="stack-label">
                    <small>Byline: </small>
                  </td>
                  <td>
                    <LocalizedInput
                      activeLocale={activeLocale}
                      value={contentNode.labelByLine}
                      placeholder="Optional byline text"
                      onChange={(labelByLine) => contentNodeUpdateHandler("labelByLine", labelByLine)}
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
                            <tr key={optIndex}>
                              <td className="field">
                                <LocalizedInput
                                  activeLocale={activeLocale}
                                  value={opt.text}
                                  placeholder="Option Label"
                                  onChange={(text) => {
                                    const newOpts = [...contentNode.options];
                                    newOpts[optIndex] = { ...newOpts[optIndex], text };
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
                          contentNodeStack={contentNodeStack}
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
                {canAssign && (
                  <tr>
                    <td className="stack-label">
                      <small>Assign: </small>
                    </td>
                    <td>
                      <InputAssign
                        contentNodeStack={contentNodeStack}
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
                )}
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
          <LocalizedInput
            activeLocale={activeLocale}
            value={contentNode.text}
            multiline={[ContentNodeType.P].includes(contentNode.type)}
            rows={3}
            onChange={(text) => contentNodeUpdateHandler("text", text)}
          />
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
        {canReorder && (
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
        )}
        <button onClick={onDelete}>❌</button>
      </div>
    </div>
  );
};