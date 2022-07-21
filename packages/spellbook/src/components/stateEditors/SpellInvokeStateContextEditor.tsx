import { castArray, get, isEmpty, omit, set, unset } from "lodash";
import React, { useMemo } from "react";
import styled from "styled-components";
import {
  $TSFixMe,
  isJsonLogic,
  TPrepparedSpellMapping,
  TSpellInstructions,
  TWizardSerializations,
} from "@xstate-wizards/spells";
import { JsonLogicBuilder } from "../logic/JsonLogicBuilder";

type TSpellInvokeStateContextEditorProps = {
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  spells: {
    [id: number]: TSpellInstructions;
  };
  spellsStatic: {
    [key: string]: TSpellInstructions | TPrepparedSpellMapping;
  };
  state: $TSFixMe;
  states: $TSFixMe;
  onUpdate: (data: any) => void;
};

//recursively traverse the schema definition of an invoked machine to see nested object paths it defines
//E.g.
// schema: {
//   type: "object",
//   properties: {
//     topLevelProperty: { type: "string" },
//     nestedObject: {
//       type: "object",
//       properties: { nestedProperty: { type: "string" } },
//     },
//   },
// }
// => ["topLevelProperty", "nestedObject.nestedProperty"]
//
const getSchemaProperties = (obj) => {
  const isObject = (val) => castArray(val.type).includes("object");

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b);

  const paths = (obj = {}, head = "") => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      const fullPath = addDelimiter(head, key);
      return isObject(value) ? product.concat(paths(value?.["properties"], fullPath)) : product.concat(fullPath);
    }, []);
  };

  return paths(obj?.["properties"]);
};

//recursively traverse the context defined on current machine that we're passing to the invoked machine and get all paths, ignoring json logic
// E.g. {"key1":"testValue", "key2":{"id": {"var":["event.data.caseId"]} }} => ["key1", "key2.id"]
const getContextObjectPaths = (obj) => {
  const isObject = (val) => val && typeof val === "object" && !Array.isArray(val);

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b);

  const paths = (obj = {}, head = "") => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      const fullPath = addDelimiter(head, key);
      return isObject(value) && !isJsonLogic(value) && !isEmpty(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath);
    }, []);
  };

  return paths(obj);
};

export const SpellInvokeStateContextEditor: React.FC<TSpellInvokeStateContextEditorProps> = ({
  onUpdate,
  serializations,
  spells,
  spellsStatic,
  state,
  states,
  schema,
}) => {
  // OPTIMIZE this look up feels super inefficient
  const propsOfInvokedSpell = useMemo(() => {
    const spell =
      spellsStatic?.[state.key] ?? Object.values(spells ?? {}).find((s) => s.isActive && s.key === state.key);
    return getSchemaProperties(spell?.schema);
  }, [spells, state.key]);

  const contextObjectPaths = getContextObjectPaths(state.context);

  // RENDER
  return (
    <StyledSpellInvokeStateContextEditor>
      <div className="context-editor__key">
        <small>Send Context: </small>
        <button onClick={() => onUpdate({ context: { ...state.context, "": {} } })}>+</button>
      </div>
      <div className="context-editor__value">
        {contextObjectPaths.sort().map((contextObjectPath) => (
          <div key={contextObjectPath} className="context-key">
            <div className="context-key__name">
              <div>
                <select
                  value={contextObjectPath}
                  onChange={(e) => {
                    // change the key for given context object path
                    const valueAtOldKey = get(state.context, contextObjectPath);
                    const newContext = { ...state.context };
                    unset(newContext, contextObjectPath);
                    const contextWithNewKey = set(newContext, e.target.value, valueAtOldKey);
                    return onUpdate({
                      context: contextWithNewKey,
                    });
                  }}
                >
                  <option value="">---</option>
                  {propsOfInvokedSpell.map((key) => (
                    <option key={key} value={key} disabled={Object.keys(state.context ?? {}).includes(key)}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="context-key__editor">
              <JsonLogicBuilder
                functions={serializations?.functions ?? {}}
                jsonLogic={get(state.context, contextObjectPath)}
                onUpdate={(jsonLogic) => {
                  const contextWithNewKey = set({ ...state.context }, contextObjectPath, jsonLogic);
                  onUpdate({ context: contextWithNewKey });
                }}
                schema={schema}
                state={state}
                states={states}
              />
            </div>
            <div>
              <button
                onClick={() => {
                  const newContext = { ...state.context };
                  unset(newContext, contextObjectPath);
                  return onUpdate({ context: newContext });
                }}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </StyledSpellInvokeStateContextEditor>
  );
};

const StyledSpellInvokeStateContextEditor = styled.div`
  display: flex;
  padding: 0.5em 1em 0;
  .context-editor__key {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    button {
      max-width: 18px;
    }
  }
  .context-editor__value {
    width: 100%;
  }

  .context-key {
    display: flex;
    padding-bottom: 0.2em;
    border-bottom: 1px solid #bbb;
    margin-bottom: 0.2em;
    .context-key__name {
      font-size: 13px;
      padding-top: 0.2em;
      min-width: 40px;
      select {
        max-width: 100%;
        width: 100%;
      }
    }
    .context-key__editor {
      display: flex;
      width: 100%;
    }
  }
`;
