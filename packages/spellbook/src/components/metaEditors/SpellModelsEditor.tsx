import { chunk, omit } from "lodash";
import React from "react";

export const SpellModelsEditor = ({ models, modelsConfigs, onModelsUpdate }) => {
  return (
    <div className="schema-section">
      <div className="schema-section__keys">
        <small>Models</small>
        <br />
        <small>(context.resources)</small>
      </div>
      <div className="schema-section__models-list">
        {/* TODO: remove models that don't show up on modelsConfigs? */}
        {chunk(Object.keys(modelsConfigs), 4).map((chunk, chunkIndex) => (
          <div key={chunkIndex}>
            {chunk.map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={models[key] != null}
                  onChange={(e) =>
                    onModelsUpdate(
                      e.target.checked
                        ? {
                            ...models,
                            [key]: { loader: {} },
                          }
                        : omit(models, [key])
                    )
                  }
                />{" "}
                {key}
                {/* TODO: loader params */}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
