/**
 * WizardML (Wizard Markup Language)
 * Messily implements a subset of markdown so that we can format raw strings
 * editable by the Upsolve team as HTML with hyperlinks, bold, paragraph
 * splitting, etc.
 */
import React from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations, templateFunctionToValue } from "@xstate-wizards/spells";
import { A as FallbackA } from "../contentNodes/fallbacks/A";

type TWizardMLProps = {
  ctx?: $TSFixMe; // machine context
  text: string;
  serializations: TWizardSerializations;
  contentTree?: $TSFixMe;
};

export function renderWizardML({ ctx, text, serializations, contentTree }: TWizardMLProps): React.ReactNode[] {
  const A = serializations?.components?.A ?? FallbackA;
  // Patterns to replace in text with HTML elements. Each "pattern" in the list
  // should be an object with a regex to match, and a handler to turn the match
  // into an HTML element. The number of capture groups in the regex should match
  // the number of arguments in the handler.
  const PATTERNS = [
    {
      // Bold - **bolded text**
      pattern: "\\*\\*(.+?)\\*\\*",
      handler: (i, text) => <b key={i}>{text}</b>,
    },
    {
      // Underlined - __underlined text__
      pattern: "\\__(.+?)\\__",
      handler: (i, text) => <u key={i}>{text}</u>,
    },
    {
      // Strikethrough - ~~strike throughed text~~
      pattern: "\\~~(.+?)\\~~",
      handler: (i, text) => <del key={i}>{text}</del>,
    },
    {
      // Hyperlink - [Link text](https://upsolve.org){"target":"_blank"}
      // If a relative link, it's internal so use react router dom <Link/>. Attributes obj is optional.
      pattern: "\\[(.+?)\\]\\((.+?)\\)(\\{.+?\\})?",
      handler: (i, text, url, attrsString) => {
        // Cast to JSON obj to keep life simple. Using other markdown syntax needs special parsing (ex: removing quotes). Only handles 1 layer of obj
        let attrs: Record<string, any> = {};
        try {
          attrs = JSON.parse(attrsString);
        } catch (e) {
          // noop
        }
        return (
          <A key={i} href={url} target={attrs.target}>
            {text}
          </A>
        );
      },
    },
    {
      // Javascript Selector Functions - <<<get("states.wizardScore")>>>
      // We could be much more strict with parsing, but assuming atm a single function
      // TODO: We might want to swap this out for JSON logic
      pattern: "<<<(.+?)>>>",
      handler: (i, text, url) =>
        templateFunctionToValue({ ctx, string: text, functions: serializations.functions, contentTree }),
    },
  ];

  const chunks = [];
  const matches = [];

  // For find start and end index of each substring matching the available
  // syntax patterns.
  PATTERNS.forEach(({ pattern, handler }) => {
    const re = new RegExp(pattern, "g");
    let match = re.exec(text);
    while (match !== null) {
      matches.push({
        start: match.index,
        end: re.lastIndex,
        pattern,
        handler,
      });
      match = re.exec(text);
    }
  });

  // Split into chunks based on matching indices and turn appropriate chunks
  // into HTML elements.
  let lastIndex = 0;
  matches
    .sort((a, b) => a.start - b.start)
    .forEach(({ start, end, pattern, handler }, i) => {
      chunks.push((text ?? "").slice(lastIndex, start));
      chunks.push(handler(i, ...(text ?? "").slice(start, end).match(new RegExp(pattern)).slice(1)));
      lastIndex = end;
    });

  // Push remaining text as chunk
  chunks.push((text ?? "").slice(lastIndex));

  return chunks;
}
