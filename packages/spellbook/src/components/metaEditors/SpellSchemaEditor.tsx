import { omit } from "lodash";
import React from "react";
import { JsonSchemaBuilder } from "../logic/JsonSchemaBuilder";

export const SpellSchemaEditor = ({ schema, onUpdate }) => {
  // RENDER
  return (
    <div className="schema-section">
      <div>
        <div className="schema-section">
          <div className="schema-section__keys">
            <small className="custom-property">
              Schema/Vars
              <br />
              (context.___)
            </small>
          </div>
          <div className="schema-section__states-editor">
            <JsonSchemaBuilder schema={schema} onUpdate={(schema) => onUpdate(schema)} />
          </div>
        </div>
      </div>
    </div>
  );
};
