import React, { useState } from "react";
import styled from "styled-components";
import { $TSFixMe } from "@xstate-wizards/spells";
import { JsonView } from "../logic/JsonView";

export type TPreviewHistoryItem = {
  context: $TSFixMe;
  event: $TSFixMe;
  key: string;
  value: string;
};
export type TPreviewHistoryError = {
  error: $TSFixMe;
};

type TPreviewHistoryItemInspectorProps = { item: TPreviewHistoryItem | TPreviewHistoryError };

export const PreviewHistoryItemInspector: React.FC<TPreviewHistoryItemInspectorProps> = ({ item }) => {
  const [isContextVisible, setIsContextVisible] = useState(false);
  return (
    <StyledPreviewHistoryItemInspector>
      <div className="preview__inspector__key" onClick={() => setIsContextVisible(!isContextVisible)}>
        {(item as TPreviewHistoryError).error != null && (
          <>
            {/* @ts-ignore */}
            <span className="preview__inspector__key__type">❌ Error: {item.error}</span>
          </>
        )}
        {(item as TPreviewHistoryItem).event != null && (
          <span className="preview__inspector__key__type">
            {/* @ts-ignore */}
            💥 {item.event?.type} → {item.value}
          </span>
        )}
        {/* @ts-ignore */}
        <span className="preview__inspector__key__key">{item.key}</span>
      </div>
      {/* @ts-ignore */}
      {isContextVisible && item?.context != null && (
        <div className="preview__inspector__details">
          {/* @ts-ignore */}
          <JsonView json={item.context} />
        </div>
      )}
    </StyledPreviewHistoryItemInspector>
  );
};

const StyledPreviewHistoryItemInspector = styled.div`
  margin-bottom: 0.25em;
  border-radius: 4px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  .preview__inspector__key {
    padding: 0.2em 0.75em;
    width: 100%;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  .preview__inspector__details {
    padding: 0;
  }
  .preview__inspector__key__type {
    font-size: 12px;
    font-weight: 900;
  }
  .preview__inspector__key__key {
    font-size: 10px;
    font-weight: 900;
    color: #aaa;
  }
`;
