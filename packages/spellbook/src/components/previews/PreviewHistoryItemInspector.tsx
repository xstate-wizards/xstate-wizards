import React, { useState } from "react";

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
    <div className="xw-sb__preview-history-item">
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
    </div>
  );
};
