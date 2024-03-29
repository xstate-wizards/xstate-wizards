import { castArray, cloneDeep } from "lodash";
import React, { Fragment } from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { VariableSelector } from "./VariableSelector";

type JsonLogicBuilderProps = {
  contentNodeStack?: $TSFixMe;
  functions: TWizardSerializations["functions"];
  jsonLogic: $TSFixMe;
  onUpdate: (jsonLogic: $TSFixMe) => void;
  models?: $TSFixMe;
  schema: $TSFixMe;
  invokedSchema?: $TSFixMe; // for selecting finalCtx from an invoked machine
  state: $TSFixMe;
  states?: $TSFixMe[]; // for selecting event data properties from other state event triggers
};

// TODO: this is just for the sake of proof-of-concept
export const JsonLogicBuilder: React.FC<JsonLogicBuilderProps> = ({
  contentNodeStack,
  functions,
  jsonLogic,
  onUpdate,
  models,
  schema,
  invokedSchema,
  state,
  states,
}) => {
  const existingOp = Object.keys(jsonLogic ?? {})?.[0];
  const existingArgs = castArray(jsonLogic?.[existingOp] ?? []);
  const onUpdateOp = (op) => {
    // --- special handle w/ var since it can just be a single selection
    if (op === "var") {
      onUpdate({ [op]: [""] });
    } else {
      onUpdate({ [op]: existingArgs });
    }
  };
  const onAddArg = (type) => {
    console.log("onAddArg:", "type");
    const newArgs = cloneDeep(existingArgs);
    if (type === "op") newArgs.push({});
    if (type === "num") newArgs.push(0);
    if (type === "str") newArgs.push("");
    if (type === "bool") newArgs.push(false);
    onUpdate({ [existingOp]: newArgs });
  };
  // TODO: get more complex than popping off last arg
  const onDeleteArg = () => {
    onUpdate({ [existingOp]: existingArgs.slice(0, -1) });
  };
  const onUpdateArg = (argIndex, value) => {
    const newArgs = cloneDeep(existingArgs);
    newArgs[argIndex] = value;
    console.log("onUpdateArg:", cloneDeep(newArgs));
    onUpdate({ [existingOp]: newArgs });
  };

  // RENDER
  return (
    <StyledJsonLogicBuilder>
      {/* OPERATION */}
      <div className="logic__operation">
        <select value={existingOp} onChange={(e) => onUpdateOp(e.target.value)}>
          <option value=""></option>
          {Object.keys(OPERATORS).map((lib) => (
            <optgroup key={lib} label={lib}>
              {OPERATORS[lib].map((op) => (
                <option key={`${lib}-${op}`} value={op}>
                  {op}
                </option>
              ))}
            </optgroup>
          ))}
          {Object.keys(functions ?? {})?.length > 0 && (
            <optgroup label="[Extras] Serialized">
              {Object.keys(functions ?? {}).map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      {/* ARGS */}
      <div className="logic__args">
        {existingArgs.map((arg, argIndex) => (
          <Fragment key={`${argIndex}-${typeof arg}`}>
            {/* --- var --- */}
            {typeof arg === "string" && existingOp === "var" ? (
              <VariableSelector
                contentNodeStack={contentNodeStack}
                onChange={(assign) => onUpdateArg(argIndex, assign)}
                schema={schema}
                invokedSchema={invokedSchema}
                models={models}
                state={state}
                states={states}
                value={arg}
              />
            ) : null}
            {/* --- strings --- */}
            {typeof arg === "string" && existingOp !== "var" ? (
              <input key={argIndex} type="text" value={arg} onChange={(e) => onUpdateArg(argIndex, e.target.value)} />
            ) : null}
            {/* --- numbers --- */}
            {typeof arg === "number" ? (
              <input
                key={argIndex}
                type="number"
                value={arg}
                onChange={(e) => onUpdateArg(argIndex, Number(e.target.value))}
              />
            ) : null}
            {/* --- booleans --- */}
            {typeof arg === "boolean" ? (
              <input
                key={argIndex}
                type="checkbox"
                checked={arg}
                onChange={(e) => onUpdateArg(argIndex, e.target.checked)}
              />
            ) : null}
            {/* --- deeper json-lgoic operations --- */}
            {arg && typeof arg === "object" ? (
              <JsonLogicBuilder
                key={argIndex}
                contentNodeStack={contentNodeStack}
                functions={functions}
                jsonLogic={arg}
                onUpdate={(jsonLogic) => onUpdateArg(argIndex, jsonLogic)}
                models={models}
                schema={schema}
                invokedSchema={invokedSchema}
                state={state}
                states={states}
              />
            ) : null}
          </Fragment>
        ))}
        {/* ADD ARGS -- only allow 1 arg if 'var' or 'return' */}
        <div className="logic__args__actions">
          <small>
            {["var", "return"].includes(existingOp) && existingArgs?.length === 1 ? null : (
              <>
                +<u onClick={() => onAddArg("op")}>Func</u>
                <u onClick={() => onAddArg("num")}>Num</u>
                <u onClick={() => onAddArg("str")}>Str</u>
                <u onClick={() => onAddArg("bool")}>Bool</u>
              </>
            )}
            <u className="del-args" onClick={() => onDeleteArg()}>
              - Arg
            </u>
          </small>
        </div>
      </div>
    </StyledJsonLogicBuilder>
  );
};

const StyledJsonLogicBuilder = styled.div`
  display: flex;
  padding-left: 2px;
  border-left: 2px solid #ccc;
  margin-left: 2px;
  // padding-right: 2px;
  // border-right: 2px solid #ccc;
  // margin-right: 2px;
  input,
  select {
    flex-grow: 1;
    max-width: 100px;
  }
  .logic__args {
    display: flex;
    flex-direction: column;
  }
  .logic__args__actions {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    u {
      margin: 0 2px;
      cursor: pointer;
    }
  }
`;

// json-logic operators
// https://jsonlogic.com/operations.html
const OPERATORS = {
  // --- Accessing Data
  "[JSL] Var": [
    "var",
    // "missing",
    // "missing_some",
  ],
  "[Extras] Var": [
    "return", // Not JSL, added an operation for dumb returns of first arg
  ],
  // --- Logic and Boolean Operations
  "[JSL] Logic": [
    // "==",
    "===",
    // "!=",
    "!==",
    // "!",
    // "!!",
    "and",
    "or",
    "if", // this is being treated by new users as ===
  ],
  // --- Numeric Operations
  "[JSL] Numeric": [
    ">",
    ">=",
    "<",
    "<=",
    "+",
    "-",
    "*",
    "/",
    // "%",
  ],
  // --- String Operations
  "[JSL] String": [
    // "in",
    "cat",
    "substr",
  ],
  // --- Array Operations
  "[JSL] Array": [
    "all",
    "some",
    "none",
    // "reduce",
    "map",
    // "filter", // use lodash.without, you can't select variables other than array items
    "merge",
    // "in",
  ],
  "[lodash]": [
    "lodash.capitalize",
    "lodash.castArray",
    "lodash.concat",
    "lodash.fill",
    "lodash.get",
    "lodash.head",
    "lodash.includes",
    "lodash.isNil",
    "lodash.keys",
    "lodash.orderBy",
    "lodash.range",
    "lodash.rangeRight",
    "lodash.reverse",
    "lodash.round",
    "lodash.size",
    "lodash.toNumber",
    "lodash.toString",
    "lodash.uniq",
    "lodash.values",
    "lodash.without",
    // ???
  ],
  "[Resources]": [
    "createLocalId",
    // "getResources",
  ],
  "[Math]": [
    "Math.ceil",
    "Math.floor",
    "Math.max",
    "Math.min",
    "Math.random",
    // ???
  ],
  "[Date]": [
    "Date.now",
    // ???
  ],
  "[date-fns]": [
    "date-fns.addBusinessDays",
    "date-fns.addDays",
    "date-fns.addMonths",
    "date-fns.addWeeks",
    "date-fns.addYears",
    "date-fns.differenceInCalendarDays",
    "date-fns.getDay",
    "date-fns.getMonth",
    "date-fns.getYear",
    "date-fns.format",
    "date-fns.isAfter",
    "date-fns.isBefore",
    "date-fns.isFuture",
    "date-fns.isPast",
    "date-fns.isWithinInterval",
    "date-fns.parseISO",
    "date-fns.startOfWeek",
    "date-fns.startOfMonth",
    "date-fns.subBusinessDays",
    "date-fns.subDays",
    "date-fns.subMonths",
    "date-fns.subWeeks",
    "date-fns.subYears",
    // ???
  ],
};
