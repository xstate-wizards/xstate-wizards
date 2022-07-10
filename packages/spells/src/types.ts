import { JSONSchema7 } from "json-schema";
import React from "react";

export type $TSFixMe = any;

export type TCreateMachineContext = {
  resources: Record<string, Record<string, any>[]>;
  resourcesUpdates: {
    [modelName: string]: {
      create: {}[];
      update: {}[];
      delete: {}[];
      relate: {}[];
      unrelate: {}[];
    };
  }; // TODO: Make specific
  states?: Record<string, any>; // A mapping of state specific values we want to save (ex: confirmation checkbox booleans)
  valid?: boolean; // DEPRECATE: Should be stored on ctx.states
};

export type TWizardSession = {
  id: number;
  machineId: string;
  machineState: string;
  machineContext: TCreateMachineContext;
  machineVersion: string;
  startedAt: string | null; // TODO: should be "Date"; ??? (not sure why this is a todo)
  progressAt: string | null; // TODO: should be "Date"; ??? (not sure why this is a todo)
  endedAt: string | null; // TODO: should be "Date"; ??? (not sure why this is a todo)
  createdAt: string | null; // TODO: should be "Date"; ??? (not sure why this is a todo)
  updatedAt: string | null; // TODO: should be "Date"; ??? (not sure why this is a todo)
} & {
  // Vendor specific (ex: upsolve selects/filters also consider a caseId and userId)
  [extraProp: string]: any;
};

export type TTestNodeHandlerProps = {
  tapYesButton: () => Promise<void>;
  tapNoButton: () => Promise<void>;
  tapContinueButton: () => Promise<void>;
  tapButton: (text?: string | RegExp) => Promise<void>;
  tapInput: (label?: string | RegExp, option?: string) => Promise<void>;
  tapSelectInput: (label: string | RegExp, value: string) => Promise<void>;
  tapSelectDateInput: (label: string | RegExp, date: Date) => Promise<void>;
  typeInput: (label: string, text: string | RegExp) => Promise<void>;
  waitForTimeout: (ms: number) => Promise<void>;
};

export type TGeneralStateNodeProps = {
  always?: Record<string, any>;
  content: (TContentDefinition | Function | (TContentDefinition | Function)[])[] | Function;
  entry?: any; // Allow machines to entry states that can be setup based on the machine factory function context (ex: missing context data can trigger BACK event immediately)
  invoke?: Record<string, any> | Function;
  nodeType?: string; // Default to ID_GENERAL
  notes?: TNote[]; // DEPRECATE
  on: Record<string, any>;
  progress?: number;
  showValidateErrorsAtEntry?: boolean; // DEPRECATE: I think?
  test?: (utils: TTestNodeHandlerProps) => Promise<void>;
};

type TContentTableDefinition = {
  id?: number | string;
  items: { cells: any[] }[]; // TODO: make more specific
};

// TODO: Update content definition for all new node types
export type TContentDefinition = {
  type?: string;
  text?: string;
  component?: React.FunctionComponent; // if comp, render
  label?: string; // wrappers for inputs
  inputType?: string; // for inputs - number, text
  valueKey?: string;
  validations?: string[];
  onClick?: Function; // standard onClick override
  event?: string | Record<string, any>; // machine transition config
  assign?: Function; // context assignment handling
  attrs?: Record<string, any>; // Pass values like data-ids, style, disabled checking fn, other attributes
  disabled?: Function; // can't destructure like other attributes
  selected?: Function; // mostly for inputCheckboxButton so we can invert/change color when selected
  items?: (TContentDefinition | TContentTableDefinition)[];
};

export type TNote = {
  date: string;
  text: string;
};

export type TCreateUpdateDeleteResourceConfig = {
  modelName: string;
  id: string | number;
  props?: Record<string, any>;
};

export type TCreateUpdateDeleteResourceOptions = {
  outlineMode?: boolean;
};

export type TUnrelateManyConfig = {
  modelName: string;
  id?: string | number; // The root resource we're unrelating from
  relation: string; // The relation path we're filtering on and sending to backend
  relatedId?: string | number; // (Optional) Param to selectively filter what we're unrelating for
};

export type TRelateManyConfig = {
  modelName: string;
  id: string | number; // The root resource we're unrelating from
  relation: string; // The relation path we're filtering on and sending to backend
  relatedId: string | number; // (Optional) Param to selectively filter what we're unrelating for
  extras?: Record<string, any>; // Values for the junction table
};

// TODO: Figure out how to type the returned Machine
// TODO: Figure out how to reconcile extended configs specific for machines and TCreateMachineContext
export type TCreateMachine = {
  (
    context: TCreateMachineContext | any,
    options?: {
      initial?: string;
      spellMap: TSpellMap;
      serializations: TWizardSerializations;
      meta?: TSpellConfig;
      session?: TWizardSession;
    }
  ): any;
};
// Models config on wizard/spells
export type TSpellModelOptions = {
  loader: {
    [key: string]: any;
    // TODO: remove, these are upsolve specific. this should just be an agnostic config obj
    includeGuardRails?: boolean;
    withGraph?: string;
  };
};
export type TSpellModelOptionsMap = {
  [modelName: string]: TSpellModelOptions;
};
// Models for wizard
export type TWizardModel = {
  modelName: string;
  schema: JSONSchema7;
  // TODO: i need to fix this type for upsolveWizardModelsMapRunner
  loader: (params: Record<string, $TSFixMe>) => Promise<$TSFixMe[]>;
};
export type TWizardModelsMap = {
  [key: string]: TWizardModel;
};

export type TInputValidations = (string | Function)[];
export type TInterviewValidation = (value, validations, param?: any) => string | null | undefined;
export type TValidationMap = {
  [validationKey: string]: TInterviewValidation;
};

export type TWizardSerializations = {
  // --- serialized actions that need to be code
  actions?: Record<string, $TSFixMe>;
  // --- serialized components that can be referenced in content
  components?: {
    A?: React.FunctionComponent;
    SessionInactiveOverlay?: React.FunctionComponent;
    WizardWrap?: React.FunctionComponent;
    [key: string]: React.FunctionComponent;
  };
  // --- functions for serializing variables in content/conditionals/etc
  functions: Record<string, Function>;
  // --- serialized guards that need to be code
  guards?: Record<string, $TSFixMe>;
  // --- states of machine that need to be custom code
  states?: {
    [stateName: string]: any;
  };
  // --- validation functions for inputs
  validations?: TValidationMap;
};

export type TContentNodeValidationMap = {
  [valuePath: string]: {
    dirty: boolean;
    validationError: string | null;
  };
};

export type TContentNode = {
  node: $TSFixMe;
  state: $TSFixMe;
  transition: $TSFixMe;
  serializations?: TWizardSerializations;
  contentTree?: $TSFixMe; // comes from content nodes passing through data
  // DONT PASS validationMap RECURSIVELY?
  validationMap?: TContentNodeValidationMap; // deprecate?
  setValidationMap?: $TSFixMe; // deprecate?
};

export type TSpellConfig = {
  allowStartOver?: boolean; // For triggering START_OVER transition event
  autofillBackTargets?: boolean;
  autofillSubmitTargets?: boolean;
  exitTo?: string; // Path to direct user to when they want to exit a flow (doesn't progress/end state, just navigates away)
  initial: string; // state that machine should start on
  outlineMode?: boolean; // DEPRECATE? Boolean that passes through from DirectedGraphAsOutline.tsx
  sectionsBar?: {
    name: string;
    trigger: string;
    highlight?: boolean;
  }[];
  session?: Record<string, any>; // holds machine id, state value, version, etc. (ex: questionnaire machines)
  title?: string; // Just the machine label prop, (prev: label)
};

export type TSpellUserHistoryRecord = {
  id?: string | number;
  name?: string;
  email?: string;
  at?: string | Date; // could be a stringified date
};

export type TSpellEditor = {
  directory?: string[];
  publishedBy?: TSpellUserHistoryRecord;
  versionForked?: string; // so we can show if version changes occurred between a prior published version and this one
  note?: string;
  states?: {
    // --- for state specific meta info
    [stateName: string]: {
      // isDeleted?: boolean; // could be helpful but could just determine by check for key's existance in states obj
      note?: string;
      updatesBy?: TSpellUserHistoryRecord[];
    };
  };
};

type TTempState = { [stateName: string]: { [stateProps: string]: TGeneralStateNodeProps } };

export type TSpellInstructions = {
  key: string; // should correspond to spell/machine map
  version: string; // only necessary on questionnaire machines, but putting it everywhere
  isActive?: boolean; // isActive tells us which of a key we should use when we have multiple versions
  config: TSpellConfig; // | ((ctx: $TSFixMe) => TSpellConfig);
  models: TSpellModelOptionsMap;
  schema: JSONSchema7;
  states: TTempState;
  editor: TSpellEditor;
  // database related
  id?: string | number;
  createdAt?: string; // may exist from database?
};

export type TPrepparedSpellMapping = {
  key: string;
  version: string;
  config: TSpellConfig;
  models: TSpellModelOptionsMap;
  schema: JSONSchema7;
  createMachine: TCreateMachine;
};
export type TSpellMap = {
  [spellKey: string]: TPrepparedSpellMapping;
};
