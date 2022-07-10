import { prettyPrintJson } from "pretty-print-json";
import React from "react";
import styled from "styled-components";

export const JsonView = ({ json }) => {
  const ctxHtml = prettyPrintJson.toHtml(json, { indent: 2, linkUrls: false, lineNumbers: true });
  return (
    <StyledJsonView>
      <output className="json-container" dangerouslySetInnerHTML={{ __html: ctxHtml }} />
    </StyledJsonView>
  );
};

const StyledJsonView = styled.div`
  /* Layout */
  .json-container {
    font-family: menlo, consolas, monospace;
    font-style: normal;
    font-weight: bold;
    line-height: 1.4em;
    font-size: 0.6rem;
    transition: background-color 400ms;
  }
  a.json-link {
    text-decoration: none;
    border-bottom: 1px solid;
    outline: none;
  }
  a.json-link:hover {
    background-color: transparent;
    outline: none;
  }
  ol.json-lines {
    white-space: normal;
    padding-inline-start: 0;
    margin: 0px;
  }
  ol.json-lines > li {
    white-space: pre;
    text-indent: 0.7em;
    line-height: 1.5em;
    padding: 0px;
  }
  ol.json-lines > li::marker {
    font-family: system-ui, sans-serif;
    font-weight: normal;
  }
  .json-key,
  .json-string,
  .json-number,
  .json-boolean,
  .json-null,
  .json-mark,
  a.json-link,
  ol.json-lines > li {
    transition: all 400ms;
  }

  /* Colors */
  .json-container {
    background-color: white;
  }
  .json-key {
    color: gray;
  }
  .json-string {
    color: #7d40db;
  }
  .json-number {
    color: #ff0076;
  }
  .json-boolean {
    color: #5971ff;
  }
  .json-null {
    color: #a2a2a2;
  }
  .json-mark {
    color: black;
  }
  a.json-link {
    color: blue;
  }
  a.json-link:visited {
    color: blue;
  }
  a.json-link:hover {
    color: blue;
  }
  a.json-link:active {
    color: blue;
  }
  ol.json-lines > li::marker {
    color: transparent;
  }
  ol.json-lines > li:nth-child(odd) {
    background-color: #e9e9e9;
  }
  ol.json-lines > li:nth-child(even) {
    background-color: whitesmoke;
  }
  ol.json-lines > li:hover {
    background-color: #ffffff;
  }
`;
