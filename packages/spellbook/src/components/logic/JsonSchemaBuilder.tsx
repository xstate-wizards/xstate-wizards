import { intersection, omit } from "lodash";
import React, { Fragment } from "react";
import styled from "styled-components";
import { $TSFixMe } from "@xstate-wizards/spells";

type TJsonSchemaBuilderProps = {
  schema: $TSFixMe; // import { JSONSchema7 } from "json-schema";
  onUpdate: $TSFixMe;
};

export const JsonSchemaBuilder: React.FC<TJsonSchemaBuilderProps> = ({ schema, onUpdate }) => {
  const onUpdateHandler = (key: string, value: any) => {
    onUpdate({
      type: "object",
      properties:
        value === undefined
          ? omit(schema.properties, [key])
          : {
              ...(schema.properties ?? {}),
              [key]: value,
            },
    });
  };

  // RENDER
  return (
    <StyledJsonSchemaBuilder>
      {Object.keys(schema?.properties ?? {})
        .sort()
        .map((property) => (
          <>
            <div key={`${property}--prop`} className="json-schema__property">
              <div className="json-schema__property__key">
                <small>{property}</small>
              </div>
              <div className="json-schema__property__config">
                <div className="json-schema__property__config__delete">
                  <button onClick={() => onUpdateHandler(property, undefined)}>❌</button>
                </div>
                <div className="json-schema__property__config__type">
                  <label>
                    <input
                      type="radio"
                      name={property}
                      checked={schema?.properties[property]?.type?.includes("string")}
                      onChange={() => {
                        onUpdateHandler(property, {
                          type: ["string", "null"],
                          default: null,
                          properties: undefined,
                        });
                      }}
                    />{" "}
                    String
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={property}
                      checked={schema?.properties[property]?.type?.includes("number")}
                      onChange={() => {
                        onUpdateHandler(property, {
                          type: ["number", "null"],
                          default: null,
                          properties: undefined,
                        });
                      }}
                    />{" "}
                    Number
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={property}
                      checked={schema?.properties[property]?.type?.includes("boolean")}
                      onChange={() => {
                        onUpdateHandler(property, {
                          type: ["boolean", "null"],
                          default: null,
                        });
                      }}
                    />{" "}
                    Boolean
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={property}
                      checked={schema?.properties[property]?.type?.includes("array")}
                      onChange={() => {
                        onUpdateHandler(property, {
                          type: ["array", "null"],
                          items: {},
                          default: [],
                        });
                      }}
                    />{" "}
                    Array
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={property}
                      checked={schema?.properties[property]?.type?.includes("object")}
                      onChange={() => {
                        onUpdateHandler(property, {
                          type: ["object", "null"],
                          properties: {},
                          default: {},
                        });
                      }}
                    />{" "}
                    Object
                  </label>
                </div>
                {intersection(["array", "object"], schema?.properties[property]?.type).length === 0 && (
                  <div className="json-schema__property__config__default">
                    <label>
                      Default Value:
                      {schema?.properties[property]?.type?.includes("boolean") ? (
                        <input
                          type="checkbox"
                          checked={schema?.properties[property]?.default ?? false}
                          onChange={(e) => {
                            onUpdateHandler(property, {
                              ...schema?.properties[property],
                              default: e.target.checked,
                            });
                          }}
                        />
                      ) : (
                        <input
                          type={schema?.properties[property]?.type?.includes("number") ? "number" : "text"}
                          value={schema?.properties[property]?.default ?? ""}
                          onChange={(e) => {
                            onUpdateHandler(property, {
                              ...schema?.properties[property],
                              default: schema?.properties[property]?.type?.includes("number")
                                ? Number(e.target.value)
                                : e.target.value,
                            });
                          }}
                        />
                      )}
                    </label>
                    {schema?.properties[property]?.type?.includes("null") && (
                      <label>
                        Default to Null:
                        <input
                          type="checkbox"
                          checked={schema?.properties[property]?.default === null}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onUpdateHandler(property, {
                                ...schema?.properties[property],
                                default: null,
                              });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
            {schema?.properties[property]?.type?.includes("object") && (
              <div key={`${property}--builder`} className="json-schema__object-properties-editor">
                <JsonSchemaBuilder
                  schema={schema?.properties[property]}
                  onUpdate={({ properties }) => {
                    onUpdateHandler(property, {
                      type: ["object", "null"],
                      properties,
                      default: {},
                    });
                  }}
                />
              </div>
            )}
          </>
        ))}
      <div>
        <div className="json-schema__property__key add-property">
          <small
            onClick={() => {
              const property = prompt("Property Name: ");
              if (property) onUpdateHandler(property, {});
            }}
          >
            + var
          </small>
        </div>
      </div>
    </StyledJsonSchemaBuilder>
  );
};

const StyledJsonSchemaBuilder = styled.div`
  .json-schema__property {
    display: flex;
    margin-bottom: 8px;
    padding: 0 8px;
    border-left: 2px solid #ccc;
  }
  .json-schema__property__key {
    display: flex;
    min-width: 150px;
    max-width: 150px;
    overflow: hidden;
    font-weight: 900;
    &.add-property:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .json-schema__property__config {
    display: flex;
  }
  .json-schema__property__config__type {
    margin-right: 24px;
  }
  .json-schema__property__config__default {
    font-style: italic;
    input {
      margin-left: 8px;
    }
  }
  .json-schema__object-properties-editor {
    margin-left: 64px;
    margin-bottom: 18px;
    border-bottom: 2px dashed #eee;
  }
  .json-schema__property__config__delete {
    margin-right: 24px;
  }
`;
