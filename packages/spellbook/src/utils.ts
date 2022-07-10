import { cloneDeep } from "lodash";

export enum REORDER_DIRECTION {
  UP = "up",
  DOWN = "down",
}

export const castStatesToList = (states) =>
  Array.isArray(states)
    ? states
    : Object.keys(states).map((stateName) => ({
        stateName,
        state: states[stateName],
      }));

export const castStatesToMap = (states) =>
  Array.isArray(states)
    ? states.reduce(
        (obj, { state, stateName }) => ({
          ...obj,
          [stateName]: state,
        }),
        {}
      )
    : states;

export const reorderArrayItem = (arrayToReOrder: any[], indexOfItem: number, direction: REORDER_DIRECTION) => {
  return arrayToReOrder.reduce((arr, c, ci) => {
    // skip if at current node's index
    if (ci === indexOfItem) return arr;
    // if we're at the node after this, append it
    if (direction === REORDER_DIRECTION.UP && ci === indexOfItem - 1) {
      return arr.concat(arrayToReOrder[indexOfItem]).concat(c);
    }
    // if we're at the node before this, preppend it
    if (direction === REORDER_DIRECTION.DOWN && ci === indexOfItem + 1) {
      return arr.concat(c).concat(arrayToReOrder[indexOfItem]);
    }
    // otherwise return arr w/ node
    return arr.concat(c);
  }, []);
};

export const removeArrayItem = (arrayToUpdate: any[], indexOfItem: number) =>
  arrayToUpdate.filter((item, itemIndex) => itemIndex !== indexOfItem);

export const updateArrayItem = (arrayToUpdate: any[], item: any, indexOfItem: number) => {
  const newArr = cloneDeep(arrayToUpdate);
  newArr[indexOfItem] = item;
  return newArr;
};

export enum SPELLBOOK_SEARCH_PARAMS {
  PREVIEW = "preview",
  SPELL_KEY = "spellKey",
  SPELL_VERSION = "spellVersion",
}

export const searchParamSet = (key: SPELLBOOK_SEARCH_PARAMS, value: string | undefined): URL => {
  // construct url + params
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  // set params on window
  const newRelativePathQuery = window.location.pathname + "?" + url.searchParams.toString();
  history.pushState(null, "", newRelativePathQuery);
  // return url structure
  return url;
};

export const searchParamGet = (key: SPELLBOOK_SEARCH_PARAMS): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};

export const getPreviewUrl = ({ key, version }) => {
  const url = new URL(window.location.href);
  url.searchParams.set(SPELLBOOK_SEARCH_PARAMS.PREVIEW, "true");
  url.searchParams.set(SPELLBOOK_SEARCH_PARAMS.SPELL_KEY, key);
  url.searchParams.set(SPELLBOOK_SEARCH_PARAMS.SPELL_VERSION, version);
  return url.href;
};
