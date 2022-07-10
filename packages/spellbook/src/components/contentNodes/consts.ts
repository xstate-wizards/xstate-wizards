import { ContentNodeType } from "@xstate-wizards/spells";

export const CONTENT_NODE_OPTIONS = {
  Navigation: [
    // TODO: BACK?
  ],
  Logic: [ContentNodeType.CONDITIONAL, ContentNodeType.FOR_EACH],
  Text: [
    ContentNodeType.H1,
    ContentNodeType.H2,
    ContentNodeType.H3,
    ContentNodeType.H4,
    ContentNodeType.H5,
    ContentNodeType.H6,
    ContentNodeType.P,
    ContentNodeType.SMALL,
    ContentNodeType.TEXT,
  ],
  Inputs: [
    ContentNodeType.BUTTON,
    // ContentNodeType.BUTTON_CONFIRM,
    ContentNodeType.BUTTON_LINK,
    ContentNodeType.INPUT,
    ContentNodeType.INPUT_CHECKBOX_BUTTON,
    ContentNodeType.MULTI_SELECT,
    ContentNodeType.RADIO_SELECT,
    ContentNodeType.SELECT,
    ContentNodeType.TEXTAREA,
  ],
  Layout: [
    ContentNodeType.BR,
    ContentNodeType.CALLOUT,
    ContentNodeType.HR,
    ContentNodeType.ROW,
    // ContentNodeType.OL,
    // ContentNodeType.UL,
  ],
  Media: [ContentNodeType.IMG, ContentNodeType.VIDEO],
  Custom: [ContentNodeType.COMPONENT],
};

export const CONTENT_NODE_OPTIONS_TEXT = [
  ContentNodeType.H1,
  ContentNodeType.H2,
  ContentNodeType.H3,
  ContentNodeType.H4,
  ContentNodeType.H5,
  ContentNodeType.H6,
  ContentNodeType.P,
  ContentNodeType.SMALL,
  ContentNodeType.TEXT,
];

// ATTRS
const canInputOtherProp = { key: "canInputOther", type: "boolean" };
const colorProp = { key: "color", type: "text" };
const invertedProp = { key: "inverted", type: "boolean" };
const sizeProp = { key: "size", type: "text" };
const textAlignProp = { key: "textAlign", type: "text" };
const variantProp = { key: "variant", type: "text" };

export const contentTypeAttrs = {
  [ContentNodeType.BUTTON]: [invertedProp, sizeProp, variantProp],
  [ContentNodeType.BUTTON_LINK]: [invertedProp, sizeProp, variantProp],
  [ContentNodeType.CALLOUT]: [variantProp],
  [ContentNodeType.INPUT]: [sizeProp],
  [ContentNodeType.SELECT]: [canInputOtherProp, sizeProp],
};
CONTENT_NODE_OPTIONS_TEXT.forEach((key) => {
  contentTypeAttrs[key] = [colorProp, textAlignProp];
});
