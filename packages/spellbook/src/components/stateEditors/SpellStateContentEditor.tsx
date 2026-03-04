import { cloneDeep } from "lodash";
import React from "react";

import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { reorderArrayItem, removeArrayItem } from "../../utils";
import {
  ContentNodeAdder,
  isSpecialBackButtonIncluded,
  sortBackButtonToTop,
} from "../contentNodes/ContentNodeAdder";
import { ContentNodeEditor } from "../contentNodes/ContentNodeEditor";

type TSpellStateContentEditorProps = {
  models: $TSFixMe;
  modelsConfigs: $TSFixMe;
  onUpdate: (data: any) => void;
  schema: $TSFixMe;
  serializations: TWizardSerializations;
  state: $TSFixMe;
  stateName: string;
};

export const SpellStateContentEditor: React.FC<TSpellStateContentEditorProps> = ({
  models,
  modelsConfigs,
  onUpdate,
  schema,
  serializations,
  state,
  stateName,
}) => {
  // RENDER
  return (
    <div className="xw-sb__state-content">
      {state.content?.length === 0 && (
        <div className="xw-sb__spell-state__content-nodes--none">
          <i>No Content Added Yet</i>
        </div>
      )}
      <div className="xw-sb__spell-state__content-nodes">
        {sortBackButtonToTop(state.content).map((contentNode, contentNodeIndex) => (
          <ContentNodeEditor
            key={`${stateName}-${contentNode.type}-${contentNodeIndex}`}
            contentNode={contentNode}
            contentNodeIndex={contentNodeIndex}
            contentNodeStack={[]}
            models={models}
            modelsConfigs={modelsConfigs}
            schema={schema}
            serializations={serializations}
            state={state}
            onUpdate={(node) => {
              console.debug("ContentNodeEditor.onUpdate", {
                key: `${stateName}-${contentNode.type}-${contentNodeIndex}`,
                node,
                state,
              });
              const newStateContent = cloneDeep(state.content);
              newStateContent[contentNodeIndex] = node;
              onUpdate({ content: newStateContent });
            }}
            onReorder={(direction) => {
              onUpdate({
                content: reorderArrayItem(state.content, contentNodeIndex, direction),
              });
            }}
            onDelete={() => {
              onUpdate({
                content: removeArrayItem(state.content, contentNodeIndex),
              });
            }}
          />
        ))}
      </div>
      <ContentNodeAdder
        includeBackButton={isSpecialBackButtonIncluded(state.content)}
        onAdd={(node) => onUpdate({ content: state.content.concat(node) })}
      />
    </div>
  );
};