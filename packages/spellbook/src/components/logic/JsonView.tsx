import { prettyPrintJson } from "pretty-print-json";
import React from "react";

export const JsonView = ({ json }) => {
  const ctxHtml = prettyPrintJson.toHtml(json, { indent: 2, linkUrls: false, lineNumbers: true });
  return (
    <div className="xw-sb__json-view">
      <output className="json-container" dangerouslySetInnerHTML={{ __html: ctxHtml }} />
    </div>
  );
};