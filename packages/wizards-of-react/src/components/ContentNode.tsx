import { cloneDeep, get, intersection, omit, set } from "lodash";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import styled, { css } from "styled-components";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  $TSFixMe,
  applyResourceInputToContext,
  ContentNodeInputType,
  ContentNodeType,
  evalConditionalOptions,
  evalConditionalValue,
  evalForEachItemContentNodes,
  evalForEachItems,
  evalJsonLogic,
  evalSelectOptions,
  isEveryInputValid,
  isJsonLogic,
  resolveAssignId,
  TContentNode,
  validateInputValue,
  validationKeyForNode,
} from "@xstate-wizards/spells";

import { logger } from "../wizardDebugger";
// TODO: make text with auto suggest? the input for states to better handle other countries?
import { COUNTRIES, STATES_US } from "../constants/geo";

// COMPONENTS w/ fallbacks
import { renderWizardML } from "./contentNodes/renderWizardML";
import { wizardTheme } from "../theme";
//TODO: probably extract all of these out
// --- preconfigured advanced content nodes
import { AgeInput } from "./contentNodes/AgeInput";
import { CountdownTimer } from "./contentNodes/CountdownTimer";
import { CurrencyInput } from "./contentNodes/CurrencyInput";
import { SelectDatePicker } from "./contentNodes/SelectDatePicker";
import { SelectWithOther } from "./contentNodes/SelectWithOther";
import { VideoHolder } from "./styled/VideoHolder";
import { Card } from "./contentNodes/Card";
import { ConfirmButton } from "./contentNodes/ConfirmButton";
// --- fallbacks if no serialization provided (mostly for default stylings)
import { A } from "./contentNodes/fallbacks/A";
import { Button, ButtonLink, ButtonCSS } from "./contentNodes/fallbacks/Button";
import { Callout } from "./contentNodes/fallbacks/Callout";
import { H1, H2, H3, H4, H5, H6 } from "./contentNodes/fallbacks/H";
import { HR } from "./contentNodes/fallbacks/HR";
import { IconCheck, IconX } from "./contentNodes/fallbacks/Icons";
import { Input } from "./contentNodes/fallbacks/Input";
import { P } from "./contentNodes/fallbacks/P";
import { Select } from "./contentNodes/fallbacks/Select";
import { Small } from "./contentNodes/fallbacks/Small";
import { Table } from "./contentNodes/fallbacks/Table";
import { Textarea } from "./contentNodes/fallbacks/Textarea";
import { InputPhoneNumber } from "./contentNodes/InputPhoneNumber";

const fallbackComponents = {
  // styled
  A,
  P,
  Button,
  ButtonLink,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  HR,
  Input,
  Select,
  Small,
  Table,
  Textarea,
  // icons
  IconCheck, // TODO: more icons?
  IconX, // TODO: more icons?
  // advanced components
  Callout,
  InputPhoneNumber,
  // TODO: advanced components
  ResourcePanel: styled.div``, // TODO: move into wizard core lib (might want to go off of model loader schemas/configs)
  CollapsiblePanel: styled.div``, // TODO: move into wizard core lib
  CalendarDatePicker: styled.div``, // TODO: move into wizard core lib (maybe not this 1)
  FileUploadButton: styled.input``, // TODO: move into wizard core lib (and maybe not this 1 either)
  // DEPRECATE
  ButtonCSS,
};

declare global {
  interface Window {
    google: any; // TODO: extract google address autocomplete
  }
}

// Take json-logic key/values and eval (ex: if we want to grab an id off content tree)
const transformEventDataWithJsonLogic = (eventData, { context, content }) => {
  const evaluatedEventData = cloneDeep(eventData);
  for (const key in evaluatedEventData) {
    if (evaluatedEventData[key]?.type === "jsonLogic" && isJsonLogic(evaluatedEventData[key]?.jsonLogic)) {
      try {
        const newDataValue = evalJsonLogic(evaluatedEventData[key].jsonLogic, { context, content });
        evaluatedEventData[key] = newDataValue;
      } catch {
        // do nothing if we can't eval, move on
      }
    }
  }
  return evaluatedEventData;
};

/**
 *  <ContentNode />
 *  Component that renders based on the interview config type with lots of extra stuff happening.
 *  This component should not handle anything data wise, it just renders and if its an input passes the updated context to the parent WizardStateViewer
 */
export const ContentNode: React.FC<TContentNode> = (props) => {
  // ===================
  // SETUP
  // ===================
  const { serializations, node, state, transition, validationMap, setValidationMap } = props;
  const contentTree = node.contentTree ?? props.contentTree; // not sure why we prefer node before props
  // --- Input Prep
  const {
    suggestions,
    setValue: setPlacesAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ requestOptions: {}, debounce: 500 });
  // - Simplify path to value (construct from modify config or use valueKey string)
  const pathToValue = validationKeyForNode(node, {
    ctx: state.context,
    functions: serializations.functions,
    contentTree,
  });
  // - If we want to, we can have a global delay on input/button interactivity to prevent accidental double submissions // Env.isNodeProduction()?
  const [isFresh, setIsFresh] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsFresh(false), 200);
  }, []);
  // - Helper method to dirty all validation fields to trigger err renders
  const setInputsDirty = () => {
    setValidationMap(
      Object.keys(validationMap).reduce(
        (accum, key) => ({
          ...accum,
          [key]: { ...validationMap[key], dirty: true },
        }),
        {}
      )
    );
  };
  // --- Component Prep
  const A = serializations?.components?.A ?? fallbackComponents.A;
  const P = serializations?.components?.P ?? fallbackComponents.P;
  const Button: $TSFixMe = serializations?.components?.Button ?? fallbackComponents.Button;
  const ButtonLink = serializations?.components?.ButtonLink ?? fallbackComponents.ButtonLink;
  const H1 = serializations?.components?.H1 ?? fallbackComponents.H1;
  const H2 = serializations?.components?.H2 ?? fallbackComponents.H2;
  const H3 = serializations?.components?.H3 ?? fallbackComponents.H3;
  const H4 = serializations?.components?.H4 ?? fallbackComponents.H4;
  const H5 = serializations?.components?.H5 ?? fallbackComponents.H5;
  const H6 = serializations?.components?.H6 ?? fallbackComponents.H6;
  const HR = serializations?.components?.HR ?? fallbackComponents.HR;
  const IconCheck = serializations?.components?.IconCheck ?? fallbackComponents.IconCheck;
  const IconX = serializations?.components?.IconX ?? fallbackComponents.IconX;
  const Input: $TSFixMe = serializations?.components?.Input ?? fallbackComponents.Input;
  const Select = serializations?.components?.Select ?? fallbackComponents.Select;
  const Small = serializations?.components?.Small ?? fallbackComponents.Small;
  const Table = serializations?.components?.Table ?? fallbackComponents.Table;
  const Textarea: $TSFixMe = serializations?.components?.Textarea ?? fallbackComponents.Textarea;
  // TODO: weave these components more elegantly into the wizard lib
  // DEPRECATE THIS ButtonCSS. Doing it to get by for checkboxes
  const ButtonCSS = serializations?.components?.ButtonCSS;
  const ResourcePanel: $TSFixMe = serializations?.components?.ResourcePanel ?? fallbackComponents.ResourcePanel;
  const CollapsiblePanel = serializations?.components?.CollapsiblePanel ?? fallbackComponents.CollapsiblePanel;
  const Callout: $TSFixMe = serializations?.components?.Callout ?? fallbackComponents.Callout;
  const CalendarDatePicker = serializations?.components?.CalendarDatePicker ?? fallbackComponents.CalendarDatePicker;
  const FileUploadButton = serializations?.components?.FileUploadButton ?? fallbackComponents.FileUploadButton;
  const InputPhoneNumber = serializations?.components?.InputPhoneNumber ?? fallbackComponents.InputPhoneNumber;

  // ===================
  // TRANSITION RESOURCES UPDATES
  // ===================
  // --- Handler resources, resourcesUpdates value changes
  const transitionResourcesContextWithAssignConfig = (ctx, assignConfig, value?) => {
    const { resources, resourcesUpdates } = applyResourceInputToContext(ctx, assignConfig, value);
    transition({ type: "ASSIGN_CONTEXT", assignConfig, assignValue: value, resources, resourcesUpdates });
    return { resources, resourcesUpdates };
  };
  // --- Handler direct writes to context (helpful for largely machine state/ui conditionals)
  const transitionContextWithAssignConfig = (ctx, assignConfig) => {
    const value = typeof assignConfig.value === "function" ? assignConfig.value(ctx) : assignConfig.value;
    transition({
      type: "ASSIGN_CONTEXT",
      assignConfig,
      assignValue: value,
      ...set(cloneDeep(ctx), assignConfig.path, value),
    });
  };

  // ===================
  // INPUT EVENT HANDLER
  // ===================
  const inputOnChange = (e, overrideNode?) => {
    let value;
    if (
      [
        ContentNodeType.ADDRESS,
        ContentNodeType.BUTTON,
        ContentNodeType.SELECT,
        ContentNodeType.MULTI_SELECT,
        ContentNodeType.RADIO_SELECT,
        ContentNodeType.JSON_ARRAY,
        ContentNodeType.INPUT_CHECKBOX_BUTTON,
        ContentNodeType.RESOURCE_EDITOR,
      ].includes(node.type) ||
      [ContentNodeInputType.AGE].includes(node.inputType)
    ) {
      value = e;
    } else if (node.inputType === ContentNodeInputType.CURRENCY) {
      value = e.target.value.replace(/[^0-9\.\-]+/g, "");
    } else if (node.inputType === ContentNodeInputType.DATE) {
      value = e?.toISOString();
    } else if (node.inputType === ContentNodeInputType.NUMBER) {
      // NOTE: when <select><option value="">Select...</option></select>
      //       is selected, we should treat this as a null value
      value =
        node.type === ContentNodeType.SELECT && e.target.value === ""
          ? null
          : // otherwise, we can safely cast the value to a number
            Number(e.target.value || 0);
    } else if (node.inputType === ContentNodeInputType.INTEGER) {
      value = Math.floor(Number(e.target.value || 0));
      if (isNaN(value)) value = 0;
    } else if (node.inputType === ContentNodeInputType.CHECKBOX) {
      value = e.target.checked;
    } else if (node.inputType === ContentNodeInputType.TEL) {
      value = e; // InputPhoneNumber preps as E164 format
    } else if (node.inputType === ContentNodeInputType.TEXT || node.inputType === ContentNodeInputType.PASSWORD) {
      value = e.target.value;
    } else if (node.assign?.path && typeof node.assign?.value === "function") {
      value = node.assign.value(state.context);
    } else {
      value = e?.target?.value;
    }
    // Log for local dev
    logger.info("inputOnChange", pathToValue, value);
    const runValidation = (value) => {
      logger.debug("runValidation", value);
      // - Child node validations (addresses)
      if (overrideNode && overrideNode.validations) {
        const newValidationInstruction = validateInputValue(
          overrideNode.validations,
          value,
          serializations?.validations
        );
        const newValidationMap = {
          ...validationMap,
          [validationKeyForNode(overrideNode, {
            ctx: state.context,
            functions: serializations.functions,
            contentTree,
          })]: {
            dirty: true,
            validationError: newValidationInstruction,
          },
        };
        logger.debug("runValidation: newValidationMap", newValidationMap);
        setValidationMap(newValidationMap);
        // - Everything else, normal node validations (jsonArray is special because child nodes might have validations)
      } else if (node.validations || node.type === ContentNodeType.JSON_ARRAY) {
        let newValidationInstruction = validateInputValue(node.validations, value, serializations?.validations);
        // - Json-array validations (If the nested editors have validation failures, we need to highlight them)
        if (node.type === ContentNodeType.JSON_ARRAY && newValidationInstruction == null) {
          // For each schema item w/ a validation func, run on each array item
          Object.keys(node?.config?.schema || {})
            .filter((key) => node.config.schema[key].validations != null)
            .forEach((key) => {
              value.forEach((val) => {
                if (newValidationInstruction == null)
                  newValidationInstruction = validateInputValue(
                    node.config.schema[key].validations,
                    val[key],
                    serializations?.validations
                  );
              });
            });
        }
        const newValidationMap = {
          ...validationMap,
          [pathToValue]: { dirty: true, validationError: newValidationInstruction },
        };
        logger.debug("runValidation: newValidationMap", newValidationMap);
        setValidationMap(newValidationMap);
      }
    };
    runValidation(value);
    // ASSIGN
    if (node.assign && typeof node.assign === "object" && !Array.isArray(node.assign)) {
      // --- for resources
      if (node.assign.modelName && node.assign.id) {
        transitionResourcesContextWithAssignConfig(
          state.context,
          {
            ...(overrideNode ? overrideNode.assign : node.assign),
            id: resolveAssignId({
              context: state.context,
              assignIdOrTemplateOrJsonLogic: (overrideNode ? overrideNode.assign : node.assign)?.id,
              functions: serializations.functions,
              contentTree,
            }),
          },
          value
        );
      }
      // --- for state
      if (node.assign.path && node.assign.value !== undefined) {
        transitionContextWithAssignConfig(state.context, node.assign);
      }
      // DEPRECATED: DO NOT USE MULTIPLE ASSIGNMENT CONFIG (use assign function w/ updateResourceOnContext instead)
      // Multiple Assignment config (ex: selecting one value from a drop down, and then clearing another)
    } else if (node.assign && typeof node.assign === "object" && Array.isArray(node.assign)) {
      logger.warning(
        "DEPRECATED: ContentNode assign with array of configs. Use assign with callback function and `updateResourceOnContext` instead."
      );

      let contextAfterAssign = state.context;
      node.assign.forEach((assignConfig) => {
        // --- for resources
        if (assignConfig.modelName && assignConfig.id && assignConfig.path) {
          contextAfterAssign = transitionResourcesContextWithAssignConfig(contextAfterAssign, {
            ...assignConfig,
            id: resolveAssignId({
              context: state.context,
              assignIdOrTemplateOrJsonLogic: assignConfig.id,
              functions: serializations.functions,
              contentTree,
            }),
          });
        }
        // TODO: --- for state
      });
      // Update value w/ assign function
    } else if (typeof node.assign === "function") {
      transition({ type: "ASSIGN_CONTEXT", ...node.assign(state.context, value) });
      // Update value w/ direct assignment using path
    } else if (typeof node.assign === "string") {
      transition({ type: "ASSIGN_CONTEXT", ...set(state.context, node.assign, value) });
      // Allow an input to trigger unique state transitions scenarios (ex: use a dropdown to relate a resource)
    } else if (typeof node.event === "function") {
      node.event({ transition, value });
    } else {
      logger.error("inputOnChange() was triggered but did not affect machine context or trigger an event.");
    }
  };

  // VALIDATE~VALIDATE~VALIDATE~VALIDATE~VALIDATE~VALIDATE~VALIDATE~VALIDATE~VALIDATE
  if (node.type === ContentNodeType.INPUT && !node.inputType) {
    logger.error('Input missing "inputType"');
    return null;
  }
  if (node.type === ContentNodeType.INPUT && node.assign == null && pathToValue == null && node.value === undefined) {
    logger.error('Input missing "assign" object, string, or function. Also missing alternative value.');
    return null;
  }

  // ===================
  // RENDER
  // ===================
  // --- Function = Pass context to the nodes setup (ex: initial machine content setup)
  if (typeof node === "function")
    return (
      <>
        {node(state.context).map((node, nodeIndex) => (
          <ContentNode key={nodeIndex} {...props} node={node} serializations={serializations} />
        ))}
      </>
    );
  // --- Array = Input Row (array is shorthand for node type 'row', which can allow for attrs passing like style)
  if (Array.isArray(node) || node?.type === ContentNodeType.ROW) {
    return (
      <div {...node.attrs} className={`content-node__row ${node?.attrs?.className ?? ""}`}>
        {(Array.isArray(node) ? node : node?.content || []).map((node, nodeIndex) => (
          <ContentNode key={nodeIndex} {...props} node={node} serializations={serializations} />
        ))}
      </div>
    );
  }
  // --- Conditionals = Likely being used for outline scenarios / toggleable interfaces
  if (node.type === ContentNodeType.CONDITIONAL) {
    const conditionalValue = evalConditionalValue(
      node,
      { context: state.context, content: contentTree },
      { validationMap }
    );
    const conditionalOptions = evalConditionalOptions(node);
    return (
      <>
        {(conditionalOptions[conditionalValue] || []).map((node, nodeIndex) => (
          <ContentNode
            key={`${typeof conditionalValue === "string" ? conditionalValue : "option"}-${nodeIndex}`}
            {...props}
            node={node}
            serializations={serializations}
          />
        ))}
      </>
    );
  }
  // --- For Each looping (ex: looping resource editors over an array)
  if (node.type === ContentNodeType.FOR_EACH) {
    const forEachItems = evalForEachItems(node, { context: state.context, content: contentTree });
    return (
      <>
        {forEachItems.map((item, itemIndex, items) =>
          evalForEachItemContentNodes(node, item, itemIndex, items, state.context).map(
            (forEachItemContentNode, forEachItemContentNodeIndex) => {
              return (
                <ContentNode
                  key={`${itemIndex}-${forEachItemContentNodeIndex}-${forEachItemContentNode?.type}`}
                  {...props}
                  node={forEachItemContentNode}
                  contentTree={{ node: { ...item, node: contentTree } }}
                  serializations={serializations}
                />
              );
            }
          )
        )}
      </>
    );
  }
  // --- React Components = If we want to insert a component being used elsewhere without any consideration of machine context but may trigger transition (ex: selecting a filing date)
  if (node.type === ContentNodeType.COMPONENT && node.component != null) {
    // --- if a functional component, render
    if (typeof node.component === "function") {
      return node.component({ transition });
    } else if (typeof node.component === "string" && serializations?.components?.[node.component] != null) {
      // --- if a string, render from serialized obj
      const MachineComponent = serializations.components[node.component];
      return <MachineComponent {...node.attrs} />;
    } else {
      logger.error("ContentNode 'component' is returnin null", node);
    }
    return null;
  }

  // MEDIA
  // MEDIA
  // MEDIA
  // --- Image
  if (node.type === ContentNodeType.IMG) {
    return (
      <StyledImageWrapper {...node.attrs}>
        <img key={node} src={node.src} alt={node.alt || ""} {...node.attrs} />
      </StyledImageWrapper>
    );
  }
  if (node.type === ContentNodeType.ILLUSTRATION) {
    // Cancel out any height/width properties on svg default
    return (
      <StyledIllustrationWrapper {...node.attrs}>
        <node.svg height="100%" width="100%" />
      </StyledIllustrationWrapper>
    );
  }
  // --- Video
  if (node.type === ContentNodeType.VIDEO) {
    return (
      <VideoHolder>
        <ReactPlayer
          width="100%"
          height="100%"
          url={node.url}
          config={{ youtube: { playerVars: { controls: 1, rel: 0 } } }}
        />
      </VideoHolder>
    );
  }

  // LAYOUT
  // LAYOUT
  // LAYOUT
  if (node.type === ContentNodeType.BR) return <br />;
  if (node.type === ContentNodeType.HR) return <HR />;
  // --- Text
  if (node.type === ContentNodeType.TEXT)
    return renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree });
  if (node.type === ContentNodeType.H1)
    return (
      <H1
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H1>
    );
  if (node.type === ContentNodeType.H2)
    return (
      <H2
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H2>
    );
  if (node.type === ContentNodeType.H3)
    return (
      <H3
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H3>
    );
  if (node.type === ContentNodeType.H4)
    return (
      <H4
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H4>
    );
  if (node.type === ContentNodeType.H5)
    return (
      <H5
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H5>
    );
  if (node.type === ContentNodeType.H6)
    return (
      <H6
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </H6>
    );
  if (node.type === ContentNodeType.P)
    return (
      <P
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </P>
    );
  if (node.type === ContentNodeType.SMALL)
    return (
      <Small
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </Small>
    );
  if (node.type === ContentNodeType.LABEL)
    return (
      <Small
        className="content-node__input__label"
        {...node.attrs}
        onClick={() => (typeof node.onClick === "function" ? node.onClick({ transition }) : undefined)}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
        {node.attrs?.required && <span className="content-node__input__required-tick">*</span>}
      </Small>
    );
  // --- Lists
  if ([ContentNodeType.OL, ContentNodeType.UL].includes(node.type)) {
    if (node.items) {
      logger.debug("DEPRECATED: For ol/ul content nodes, use 'content' instead of 'items'");
    }
    return (
      <node.type {...node.attrs}>
        {(node.content ?? node.items ?? []).map((item, itemIndex) => (
          <li key={itemIndex}>
            <ContentNode {...props} node={item} serializations={serializations} />
          </li>
        ))}
      </node.type>
    );
  }
  // --- Tables
  if (node.type === ContentNodeType.TABLE) {
    return (
      <Table size="sm" {...node.attrs}>
        <thead>
          <tr>
            {get(node, "items[0].cells", {}).map((cell, ci) => (
              <th key={ci}>
                <ContentNode node={cell[0]} state={state} transition={transition} serializations={serializations} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {get(node, "items", [])
            .slice(1)
            .map((row, ri) => (
              <tr key={row.id || ri} {...(row.attrs || {})}>
                {(row.cells || []).map((td, tdi) => (
                  <td key={tdi}>
                    {td.map((c, ci) => (
                      <ContentNode
                        key={ci}
                        node={c}
                        state={state}
                        transition={transition}
                        serializations={serializations}
                      />
                    ))}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </Table>
    );
  }
  // --- Call out boxes
  if (node.type === ContentNodeType.CALLOUT) {
    if (node.content) {
      return (
        <Callout {...node.attrs}>
          {(node.content || []).map((node, nodeIndex) => (
            <ContentNode key={nodeIndex} {...props} node={node} serializations={serializations} />
          ))}
        </Callout>
      );
    }
    return (
      <Callout {...node.attrs}>
        {node.fullSize ? (
          renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })
        ) : (
          <Small>{renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}</Small>
        )}
      </Callout>
    );
  }
  // --- Panels
  if (node.type === ContentNodeType.COLLAPSIBLE_PANEL) {
    return (
      <CollapsiblePanel headerTitle={node.headerTitle} headerIconSVG={node.headerIconSVG} {...node.attrs}>
        {(node.content || []).map((node, nodeIndex) => (
          <ContentNode key={nodeIndex} {...props} node={node} serializations={serializations} />
        ))}
      </CollapsiblePanel>
    );
  }
  if (node.type === ContentNodeType.CARD) {
    return (
      <Card {...node.attrs}>
        {(node.content || []).map((node, nodeIndex) => (
          <ContentNode key={nodeIndex} {...props} node={node} serializations={serializations} />
        ))}
      </Card>
    );
  }
  // --- Timers
  if (node.type === ContentNodeType.COUNTDOWN_TIMER) {
    return (
      <StyledCountdownTimerNode>
        <CountdownTimer timer={node.config.timer} serializations={serializations} />
      </StyledCountdownTimerNode>
    );
  }

  // RESOURCES
  // RESOURCES
  // RESOURCES
  if (node.type === ContentNodeType.RESOURCES_LIST) {
    if ((node?.items || []).length === 0) {
      // TODO: Maybe make the description a bit more descriptive?
      // <Small>No {startCase(node.resourceType).toLowerCase()}s listed.</Small>
      return (
        <StyledResourcesList className="empty">
          <Small>None listed.</Small>
        </StyledResourcesList>
      );
    }
    return (
      <StyledResourcesList>
        {(node?.items || []).map((resource, resourceIndex) => (
          <ResourcePanel
            key={`${node.resourceType}-${resourceIndex}`}
            resourceType={node.resourceType}
            resourceStyle={node.resourceStyle || null}
            resource={resource}
            validate={typeof node.validate === "function" ? () => node.validate({ resource }) : null}
            onClick={typeof node.onClick === "function" ? () => node.onClick({ resource, transition }) : null}
            onDelete={typeof node.onDelete === "function" ? () => node.onDelete({ resource, transition }) : null}
            onSelect={typeof node.onSelect === "function" ? () => node.onSelect({ resource, transition }) : null}
            selected={typeof node.selected === "function" ? node.selected({ resource, transition }) : null}
          />
        ))}
      </StyledResourcesList>
    );
  }

  // INPUTS
  // INPUTS
  // INPUTS
  if (
    [
      ContentNodeType.INPUT,
      ContentNodeType.SELECT,
      ContentNodeType.TEXTAREA,
      ContentNodeType.INPUT_CHECKBOX_BUTTON,
      ContentNodeType.MULTI_SELECT,
      ContentNodeType.RADIO_SELECT,
      ContentNodeType.JSON_ARRAY,
      ContentNodeType.FILE_UPLOAD,
    ].includes(node.type)
  ) {
    const inputValue =
      typeof node?.assign?.transformValue?.from === "function"
        ? node?.assign?.transformValue?.from(get(state.context, pathToValue))
        : get(state.context, pathToValue);
    const inputDisabled = typeof node.disabled === "function" ? node.disabled(state.context) : false;
    // - Get Disabled State
    const showInputAsInvalid =
      validationMap[pathToValue]?.dirty === true && validationMap[pathToValue]?.validationError;
    // - Get Validation State
    // - Input
    if (node.type === ContentNodeType.INPUT) {
      let innerInput;
      if (node.inputType === ContentNodeInputType.AGE) {
        innerInput = (
          <AgeInput
            data-test-label={node.label}
            size={node.attrs?.size}
            disabled={inputDisabled}
            value={inputValue != null ? inputValue : ""}
            isValid={!showInputAsInvalid}
            onChange={(e) => {
              inputOnChange(e);
              // On change so far is just for the address
              if (typeof node._onChange === "function") node._onChange(e);
            }}
            serializations={serializations}
          />
        );
      } else if (node.inputType === ContentNodeInputType.CHECKBOX) {
        innerInput = (
          <Input
            {...node.attrs}
            data-test-label={node.label}
            size="lg"
            type={node.inputType}
            disabled={inputDisabled}
            checked={inputValue || false}
            isValid={!showInputAsInvalid}
            onChange={(e) => {
              inputOnChange(e);
              // On change so far is just for the address
              if (typeof node._onChange === "function") node._onChange(e);
            }}
          />
        );
      } else if (node.inputType === ContentNodeInputType.CURRENCY) {
        innerInput = (
          <CurrencyInput
            data-test-label={node.label}
            size={node.attrs?.size}
            disabled={inputDisabled}
            value={inputValue != null ? inputValue : ""}
            isValid={!showInputAsInvalid}
            onChange={(e) => {
              inputOnChange(e);
              // On change so far is just for the address
              if (typeof node._onChange === "function") node._onChange(e);
            }}
            serializations={serializations}
          />
        );
      } else if (node.inputType === ContentNodeInputType.DATE) {
        innerInput = (
          <SelectDatePicker
            data-test-label={node.label}
            disabled={inputDisabled}
            size={node.attrs?.size}
            value={inputValue}
            onChange={(date) => {
              inputOnChange(date);
              if (typeof node._onChange === "function") node._onChange(date);
            }}
            serializations={serializations}
            dateStart={node.dateStart}
            dateEnd={node.dateEnd}
            dateDisabled={node.dateDisabled}
          />
        );
      } else if (node.inputType === ContentNodeInputType.TEL) {
        innerInput = (
          <InputPhoneNumber
            data-test-label={node.label}
            //@ts-ignore
            disabled={inputDisabled}
            size={node.attrs?.size}
            value={inputValue}
            isValid={!showInputAsInvalid}
            onChange={(phoneNumber) => {
              inputOnChange(phoneNumber);
              if (typeof node._onChange === "function") node._onChange(phoneNumber);
            }}
          />
        );
      } else {
        innerInput = (
          <Input
            data-test-label={node.label}
            size={node.attrs?.size || "sm"}
            type={node.inputType === ContentNodeInputType.INTEGER ? "number" : node.inputType}
            inputMode={node.inputMode}
            disabled={inputDisabled}
            placeholder={node.placeholder}
            autocomplete={node.inputType === ContentNodeInputType.PASSWORD ? false : undefined}
            value={node.value || (inputValue ?? "")}
            isValid={!showInputAsInvalid}
            onChange={(e) => {
              inputOnChange(e);
              // On change so far is just for the address
              if (typeof node._onChange === "function") node._onChange(e);
            }}
          />
        );
      }
      // Render input with label and/or validation warnings
      return (
        <div
          style={node.divProps?.style || {}}
          className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""} ${node.inputType ?? ""}`}
        >
          {!node.label && innerInput}
          {node.label && node.inputType !== ContentNodeInputType.CHECKBOX && innerInput && (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
              {innerInput}
            </label>
          )}
          {node.label && node.inputType === ContentNodeInputType.CHECKBOX && innerInput && (
            <label style={{ display: "flex", alignItems: "center" }}>
              {innerInput}
              <Small className="content-node__input__label checkbox">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
            </label>
          )}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - Select
    if (node.type === ContentNodeType.SELECT) {
      const SelectComponent = node.attrs?.canInputOther ? SelectWithOther : Select;
      const nodeAttrs = omit(node.attrs || {}, ["canInputOther"]);
      const selectOptions = evalSelectOptions(node.options, { content: contentTree, context: state.context });
      const SelectJSX = (
        <SelectComponent
          data-test-label={node.label}
          value={inputValue != null ? inputValue : ""} // Do a != null check because $0 are falsey and lead to a '' input
          disabled={inputDisabled}
          isValid={!showInputAsInvalid}
          onChange={(e) => {
            const targetValue = e.target.value;
            // If option was num/bool cast it back, otherwise return string/else
            if (
              selectOptions.find(
                ({ value }) => typeof value === "number" && value === Number(targetValue) && !isNaN(Number(targetValue))
              ) ||
              node.inputType === ContentNodeInputType.NUMBER
            ) {
              inputOnChange(Number(targetValue));
            } else if (
              selectOptions.find(({ value }) => typeof value === "boolean" && ["true", "false"].includes(targetValue))
            ) {
              inputOnChange(Boolean(targetValue));
            } else {
              inputOnChange(targetValue);
            }
            // On change so far is just needed interally for the address states selection
            if (typeof node._onChange === "function") node._onChange(e);
          }}
          type={node.inputType}
          {...omit(nodeAttrs, "canInputOther")}
          serializations={serializations}
        >
          <option value="">{nodeAttrs?.defaultOptionText ?? "--- Select ---"}</option>
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </SelectComponent>
      );
      return (
        <div className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""}`} {...nodeAttrs}>
          {node.label ? (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
              {SelectJSX}
            </label>
          ) : (
            SelectJSX
          )}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - Textarea
    if (node.type === ContentNodeType.TEXTAREA) {
      const TextareaJSX = (
        <Textarea
          data-test-label={node.label}
          size="sm"
          type={node.inputType}
          disabled={inputDisabled}
          value={inputValue || ""}
          isValid={!showInputAsInvalid}
          onChange={(e) => {
            inputOnChange(e);
            // On change so far is just for the address
            if (typeof node._onChange === "function") node._onChange(e);
          }}
          rows={node?.attrs?.rows || 10}
        />
      );
      return (
        <div className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""}`}>
          {node.label ? (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
              {TextareaJSX}
            </label>
          ) : (
            TextareaJSX
          )}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - Checkbox Button
    if (node.type === ContentNodeType.INPUT_CHECKBOX_BUTTON) {
      const inputCheckboxValue = typeof node.selected === "boolean" ? node.selected : inputValue;
      const InputCheckboxJSX = (
        <StyledCheckboxButton
          ButtonCSS={ButtonCSS} // DEPRECATE
          data-test-label={node.text}
          inverted={!inputCheckboxValue}
          onClick={() => inputOnChange(!inputCheckboxValue)}
          {...node.attrs}
        >
          <div className="checkbox">{inputCheckboxValue ? <IconCheck /> : <div className="box" />}</div>
          <div className="label">{node.text}</div>
        </StyledCheckboxButton>
      );
      return (
        <div className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""}`}>
          {InputCheckboxJSX}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - Multi-Select
    if (node.type === ContentNodeType.MULTI_SELECT) {
      const SelectComponent = node.attrs?.canInputOther ? SelectWithOther : Select;
      const selectOptions = evalSelectOptions(node.options, { content: contentTree, context: state.context });
      const selections = inputValue || [];
      const nodeAttrs = omit(node.attrs || {}, ["canInputOther"]);
      return (
        <div className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""}`}>
          {node.label && (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
            </label>
          )}
          {node.inputType === "list" ? (
            <div>
              <SelectComponent
                data-test-label={node.label}
                value={inputValue != null ? inputValue : ""} // Do a != null check because $0 are falsey and lead to a '' input
                disabled={inputDisabled}
                isValid={!showInputAsInvalid}
                onChange={(e) => {
                  const targetValue = e.target.value;
                  // --- CAST
                  // If option was num/bool cast it back, otherwise return string/else
                  let castValue;
                  if (
                    selectOptions.find(
                      ({ value }) =>
                        typeof value === "number" && value === Number(targetValue) && !isNaN(Number(targetValue))
                    ) ||
                    node.inputType === ContentNodeInputType.NUMBER
                  ) {
                    castValue = Number(targetValue);
                  } else if (
                    selectOptions.find(
                      ({ value }) => typeof value === "boolean" && ["true", "false"].includes(targetValue)
                    )
                  ) {
                    castValue = Boolean(targetValue);
                  } else {
                    castValue = targetValue;
                  }
                  // --- SET
                  inputOnChange(Array.from(new Set(selections.concat(castValue))));
                  // --- CLEAR SELECT
                  e.target.value = "";
                }}
                type={node.inputType}
                {...omit(nodeAttrs, "canInputOther")}
                serializations={serializations}
              >
                <option value="">{nodeAttrs?.defaultOptionText ?? "--- Select ---"}</option>
                {selectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.text}
                  </option>
                ))}
              </SelectComponent>
              <StyledMultiSelectButtonList>
                {selections.map((value) => (
                  <Button
                    key={value}
                    {...nodeAttrs}
                    type="button"
                    style={{ display: "flex", justifyContent: "space-between" }}
                    onClick={() => inputOnChange(selections.filter((v) => v !== value))}
                  >
                    {selectOptions?.find((o) => o.value === value)?.text ?? "N/A"}{" "}
                    <span>
                      <IconX />
                    </span>
                  </Button>
                ))}
              </StyledMultiSelectButtonList>
            </div>
          ) : (
            <>
              {selectOptions.map((option) => (
                <div key={option?.value} className="content-node__input">
                  <StyledCheckboxButton
                    ButtonCSS={ButtonCSS} // DEPRECATE
                    data-test-label={node.label}
                    data-test-option={option.text}
                    inverted={!selections.includes(option?.value)}
                    onClick={() =>
                      selections.includes(option?.value)
                        ? inputOnChange(selections.filter((v) => v !== option?.value))
                        : inputOnChange(selections.concat(option?.value))
                    }
                    {...node.attrs}
                  >
                    <div className="checkbox">
                      {selections.includes(option?.value) ? <IconCheck /> : <div className="box" />}
                    </div>
                    <div className="label">{option.text}</div>
                  </StyledCheckboxButton>
                </div>
              ))}
              {node?.attrs?.canSelectNone === true && (
                <div className="content-node__input">
                  <StyledCheckboxButton
                    ButtonCSS={ButtonCSS} // DEPRECATE
                    data-test-label={node.label}
                    data-test-option="None of the above"
                    inverted={!(selections.length > 0 && selections.filter((str) => str).length === 0)}
                    onClick={() => {
                      // HACK: If we set an empty array with > 0 length, 'required' validations pass
                      const emptyArrayWithLength = [];
                      emptyArrayWithLength.length = 1;
                      inputOnChange(emptyArrayWithLength);
                    }}
                    {...node.attrs}
                  >
                    <div className="checkbox">
                      {selections.length > 0 && selections.filter((str) => str).length === 0 ? (
                        <IconCheck />
                      ) : (
                        <div className="box" />
                      )}
                    </div>
                    <div className="label">None of the above</div>
                  </StyledCheckboxButton>
                </div>
              )}
            </>
          )}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - Radio Select
    if (node.type === ContentNodeType.RADIO_SELECT) {
      const selection = node.selected || inputValue;
      return (
        <div className={`content-node__input ${showInputAsInvalid ? "validation-error" : ""}`}>
          {node.label && (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
            </label>
          )}
          {evalSelectOptions(node.options, { content: contentTree, context: state.context }).map((option) => {
            const optionDisabled = typeof option.disabled === "function" ? option.disabled() : false;
            return (
              <div key={option?.value} className="content-node__input">
                <StyledCheckboxButton
                  ButtonCSS={ButtonCSS} // DEPRECATE
                  data-test-label={node.label}
                  data-test-option={option.text}
                  inverted={selection !== option?.value}
                  disabled={inputDisabled || optionDisabled}
                  onClick={() => {
                    if (!inputDisabled && !optionDisabled && selection !== option?.value) inputOnChange(option?.value);
                  }}
                  {...node.attrs}
                >
                  <div className="checkbox">
                    {selection === option?.value ? <IconCheck /> : <div className="box radio" />}
                  </div>
                  <div className="label">
                    {renderWizardML({ ctx: state.context, text: option.text, serializations, contentTree })}
                  </div>
                </StyledCheckboxButton>
              </div>
            );
          })}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message">
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // - JSON Array
    // TODO: Allow a table vs tile panel layout style
    if (node.type === ContentNodeType.JSON_ARRAY) {
      // TODO: need to add testing support for this manually
      const jsonArrayValue = inputValue || [];
      return (
        <div
          className={`content-node__input json-array ${node.attrs?.size || ""} ${
            showInputAsInvalid ? "validation-error" : ""
          }`}
        >
          {node.label && (
            <label>
              <Small className="content-node__input__label">
                {node.label}
                {(node.validations || []).includes("required") ? (
                  <span className="content-node__input__required-tick">*</span>
                ) : (
                  ""
                )}
              </Small>
            </label>
          )}
          {jsonArrayValue.map((json, jsonI, jsonArr) => (
            <div className="json-panel" key={jsonI}>
              <div className={`json-panel__inputs ${Object.keys(node.config.schema).length <= 3 ? "row" : ""}`}>
                {Object.keys(node.config.schema).map((key) => (
                  <label key={key} className={node.config.schema[key].type} style={{ marginBottom: "10px", flex: 1 }}>
                    <Small className="content-node__input__label">{node.config.schema[key].label}</Small>
                    {(() => {
                      if (node.config.schema[key].type === ContentNodeType.SELECT) {
                        return (
                          <Select
                            size={node.attrs?.size || "sm"}
                            value={json[key]}
                            onChange={(e) =>
                              inputOnChange(set(cloneDeep(jsonArrayValue), `[${jsonI}].${key}`, e.target.value))
                            }
                          >
                            <option value="">--- Select ---</option>
                            {node.config.schema[key].options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.text}
                              </option>
                            ))}
                          </Select>
                        );
                      }
                      if (node.config.schema[key].inputType === ContentNodeInputType.CURRENCY) {
                        return (
                          <CurrencyInput
                            size={node.attrs?.size || "sm"}
                            value={json[key] || 0}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9\.\-]+/g, "");
                              inputOnChange(set(cloneDeep(jsonArrayValue), `[${jsonI}].${key}`, Number(value)));
                            }}
                          />
                        );
                      }
                      return (
                        <Input
                          size={node.attrs?.size || "sm"}
                          type={node.config.schema[key].type}
                          value={json[key] || ""}
                          checked={json[key] || ""}
                          placeholder={node.config.schema[key].placeholder || ""}
                          onChange={(e) =>
                            inputOnChange(
                              set(
                                cloneDeep(jsonArrayValue),
                                `[${jsonI}].${key}`,
                                node.config.schema[key].inputType === ContentNodeInputType.CHECKBOX
                                  ? e.target.checked
                                  : e.target.value
                              )
                            )
                          }
                        />
                      );
                    })()}
                  </label>
                ))}
                <Button
                  style={{ marginBottom: "10px", flex: 0 }}
                  type="button"
                  size="xs"
                  buttonType="warning"
                  inverted
                  onClick={() => inputOnChange([...jsonArrayValue.slice(0, jsonI), ...jsonArrayValue.slice(jsonI + 1)])}
                >
                  X
                </Button>
              </div>
            </div>
          ))}
          {(!node?.config?.limit || jsonArrayValue.length < node?.config?.limit) && (
            <div className="json-array-add">
              <Button
                type="button"
                size="sm"
                buttonType="default"
                inverted
                onClick={() => inputOnChange(jsonArrayValue.concat({}))}
              >
                {`+ Add ${node?.config?.addLabel || ""}`.trim()}
              </Button>
            </div>
          )}
          {showInputAsInvalid && (
            <Small className="content-node__input__validation-message" style={{ textAlign: "center" }}>
              {validationMap[pathToValue]?.validationError}
            </Small>
          )}
        </div>
      );
    }
    // --- File Uploading
    if (node.type === ContentNodeType.FILE_UPLOAD) {
      return (
        <>
          <FileUploadButton
            size={node.attrs?.size || "sm"}
            disabled={inputDisabled}
            onUploadAll={(files) => node.onUpload({ files, transition })}
            {...node.attrs}
          >
            {node.text || "Upload / Take Picture"}
          </FileUploadButton>
          <Callout styleType="warning" style={{ textAlign: "center" }}>
            <Small>If you have issues uploading files, please try a different a browser.</Small>
          </Callout>
        </>
      );
    }
  }

  // ADDRESS
  // ADDRESS
  // ADDRESS
  // Essentially a parent of regular inputs. We take a config and extend it for each child input field
  // We control the assignments at a parent level so we can run autocomplete (the only reason we have a _onChange for input changes)
  if (node.type === ContentNodeType.ADDRESS) {
    const extendAddressChildNode = (
      p,
      overrides: {
        childKey: string;
        inputType?: string;
        nodeType?: string;
        label?: string;
        options?: {}[];
        onChangeHandler?: Function;
        validations?: string[];
        attrs?: Record<string, any>;
      }
    ) => ({
      ...p,
      node: {
        ...p.node,
        assign: {
          ...p.node.assign,
          path: p.node.assign.path ? `${p.node.assign.path}.${overrides.childKey}` : overrides.childKey,
        },
        label: overrides.label,
        type: overrides.nodeType ?? ContentNodeType.INPUT,
        options: overrides.options ?? p.node.options,
        inputType: overrides.inputType ?? ContentNodeInputType.TEXT,
        validations: overrides.validations ?? p.node.validations ?? [], // if address is required, don't require street2
        attrs: overrides.attrs ?? { size: "sm" },
        // No input anywhere in the application should be using this.
        // If access is needed in machines to event, they should access via event({ transition, value }) that runs on inputs
        _onChange: overrides.onChangeHandler,
      },
    });
    return (
      <>
        {node.config?.attention?.enabled === true && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "attention",
              label: node.config?.attention?.label || "Attention",
              onChangeHandler: (e) => setPlacesAutocompleteValue(e.target.value),
              validations: node.config?.attention?.validations ?? [],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
        {node.config?.street1?.enabled !== false && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "street1",
              label: node.config?.street1?.label ?? "Street 1",
              onChangeHandler: (e) => setPlacesAutocompleteValue(e.target.value),
              validations: node.config?.street1?.validations ?? ["required"],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
        {suggestions && suggestions.status === "OK" && suggestions.data.length > 0 && (
          <StyledAddressSuggestionsBox>
            <div id="address-suggestions__throw-away-map" />
            {suggestions.data.slice(0, 3).map((d) => (
              <div
                key={d.reference}
                className="address-suggestions__place"
                onClick={() => {
                  // CORS blocks details request. So we have to do it through this map/service method
                  // google is loaded onto the window by a script tag in index.hbs
                  // @ts-ignore
                  const map = new google.maps.Map(document.getElementById("address-suggestions__throw-away-map"));
                  // @ts-ignore
                  const service = new google.maps.places.PlacesService(map);
                  service.getDetails({ placeId: d.place_id, fields: ["address_components"] }, (place, status) => {
                    if (status === "OK" && place && place.address_components) {
                      const streetNumberComponent =
                        get(
                          place.address_components.find((ac) => (ac.types || []).some((t) => t === "street_number")),
                          "long_name"
                        ) || "";
                      const streetRouteComponent =
                        get(
                          place.address_components.find((ac) => (ac.types || []).some((t) => t === "route")),
                          "long_name"
                        ) || "";
                      const cityComponent =
                        get(
                          place.address_components.find((ac) => (ac.types || []).some((t) => t === "locality")),
                          "long_name"
                        ) || "";
                      const boroughComponent =
                        get(
                          place.address_components.find((ac) =>
                            (ac.types || []).some((t) => t === "sublocality_level_1")
                          ),
                          "long_name"
                        ) || "";
                      const countyComponent =
                        get(
                          place.address_components.find((ac) =>
                            (ac.types || []).some((t) => t === "administrative_area_level_2")
                          ),
                          "long_name"
                        ) || "";
                      const stateComponent =
                        get(
                          place.address_components.find((ac) =>
                            (ac.types || []).some((t) => t === "administrative_area_level_1")
                          ),
                          "short_name"
                        ) || "";
                      const zipcodeComponent =
                        get(
                          place.address_components.find((ac) => (ac.types || []).some((t) => t === "postal_code")),
                          "short_name"
                        ) || "";
                      const countryComponent =
                        get(
                          place.address_components.find((ac) => (ac.types || []).some((t) => t === "country")),
                          "short_name"
                        ) || "";
                      inputOnChange(
                        [streetNumberComponent, streetRouteComponent].join(" ").trim(),
                        extendAddressChildNode(props, { childKey: "street1" }).node
                      );
                      inputOnChange("", extendAddressChildNode(props, { childKey: "street2", validations: [] }).node);
                      inputOnChange(
                        cityComponent || boroughComponent,
                        extendAddressChildNode(props, { childKey: "city" }).node
                      );
                      inputOnChange(
                        countyComponent,
                        extendAddressChildNode(props, { childKey: "county", validations: [] }).node
                      );
                      inputOnChange(stateComponent, extendAddressChildNode(props, { childKey: "state" }).node);
                      inputOnChange(zipcodeComponent, extendAddressChildNode(props, { childKey: "zipcode" }).node);
                      inputOnChange(countryComponent, extendAddressChildNode(props, { childKey: "country" }).node);
                      // TODO: Save country
                      // When input changes run, an old validationMap is persisted through on each run. We have to manually reset the map afterwards
                      const addressKeys = ["street1", "street2", "city", "county", "state", "zipcode", "country"];
                      if (node.config) {
                        const newChildValidations = {};
                        intersection(addressKeys, Object.keys(node.config)).forEach((key) => {
                          // TODO: We should actually just run a real validation check on these keys rather than just setting it to null
                          newChildValidations[
                            validationKeyForNode(node, {
                              ctx: state.context,
                              functions: serializations.functions,
                              contentTree,
                            }).concat(`.${key}`)
                          ] = null;
                        });
                        setValidationMap({ ...validationMap, ...newChildValidations });
                      }
                      clearSuggestions();
                    }
                  });
                }}
              >
                {d.description}
              </div>
            ))}
            <div className="address-suggestions__close" onClick={() => clearSuggestions()}>
              Close Suggestions
            </div>
          </StyledAddressSuggestionsBox>
        )}
        {node.config?.street2?.enabled !== false && (
          <div className="content-node__row">
            {node.config?.unit?.enabled === true && (
              <ContentNode
                {...extendAddressChildNode(props, {
                  childKey: "unit",
                  label: node.config?.unit?.label ?? "Unit",
                  nodeType: node.config?.unit?.nodeType ?? "select",
                  options: node.config?.unit?.options,
                  validations: node.config?.unit?.validations ?? [],
                })}
                validationMap={validationMap}
                serializations={serializations}
              />
            )}
            <ContentNode
              {...extendAddressChildNode(props, {
                childKey: "street2",
                label: node.config?.street2?.label ?? "Street 2",
                validations: node.config?.street2?.validations ?? [],
              })}
              validationMap={validationMap}
              serializations={serializations}
            />
          </div>
        )}
        {node.config?.notStable?.enabled === true && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "notStable",
              inputType: "checkbox",
              label: "I am experiencing homelessness and where I sleep varies",
              onChangeHandler: (e) => {
                // if we're changing the homelessness value, rmv any existing validation err
                if (e.target.checked) {
                  inputOnChange(null, extendAddressChildNode(props, { childKey: "street1" }).node);
                  setValidationMap({
                    ...validationMap,
                    [validationKeyForNode(node, {
                      ctx: state.context,
                      functions: serializations.functions,
                      contentTree,
                    }).concat(`.street1`)]: null,
                  });
                }
              },
              validations: [],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
        {node.config?.city?.enabled !== false && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "city",
              label: node.config?.city?.label ?? "City",
              validations: node.config?.city?.validations ?? ["required"],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
        {node.config?.county?.enabled === true && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "county",
              label: node.config?.county?.label ?? "County",
              validations: node.config?.county?.validations ?? [],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
        <div className="content-node__row">
          {node.config?.state?.enabled !== false && (
            <ContentNode
              {...extendAddressChildNode(props, {
                childKey: "state",
                label: node.config?.state?.label ?? "State",
                nodeType: node.config?.state?.nodeType ?? "select",
                options:
                  node.config?.state?.options || Object.keys(STATES_US).map((s) => ({ value: s, text: STATES_US[s] })),
                validations: node.config?.state?.validations ?? ["required"],
              })}
              validationMap={validationMap}
              serializations={serializations}
            />
          )}
          {node.config?.zipcode?.enabled !== false && (
            <ContentNode
              {...extendAddressChildNode(props, {
                childKey: "zipcode",
                label: node.config?.zipcode?.label ?? "Zipcode",
                validations: node.config?.zipcode?.validations ?? ["required"],
              })}
              validationMap={validationMap}
              serializations={serializations}
            />
          )}
        </div>
        {node.config?.country?.enabled === true && (
          <ContentNode
            {...extendAddressChildNode(props, {
              childKey: "country",
              label: node.config?.country?.label ?? "Country",
              nodeType: "select",
              options: Object.keys(COUNTRIES).map((c) => ({ value: c, text: COUNTRIES[c] })),
              validations: node.config?.country?.validations ?? [],
            })}
            validationMap={validationMap}
            serializations={serializations}
          />
        )}
      </>
    );
  }
  // RESOURCE EDITOR
  // RESOURCE EDITOR
  // RESOURCE EDITOR
  if (node.type === ContentNodeType.RESOURCE_EDITOR) {
    // Map resourceEditor configs to assignment objs, but skip elements that don't have configs (ex: buttons triggering events)
    // Handle inline rows here because it's hard to adjust assign configs through nested props
    return (
      <>
        {node.content.map((resourceNode, resourceNodeIndex) => {
          return Array.isArray(resourceNode) || resourceNode?.type === ContentNodeType.ROW ? (
            <div className="content-node__row" key={resourceNodeIndex}>
              {(Array.isArray(resourceNode) ? resourceNode : resourceNode?.content || []).map(
                (rowResourceNode, rowResourceNodeIndex) => (
                  <ContentNode
                    key={`${resourceNodeIndex}-${rowResourceNodeIndex}`}
                    {...props}
                    node={{
                      ...rowResourceNode,
                      assign:
                        rowResourceNode.assign != null
                          ? {
                              ...rowResourceNode.assign,
                              modelName: node.config.modelName,
                              id: resolveAssignId({
                                context: state.context,
                                assignIdOrTemplateOrJsonLogic: node.config.resourceId,
                                functions: serializations.functions,
                                contentTree,
                              }),
                            }
                          : undefined,
                    }}
                    contentTree={contentTree}
                    serializations={serializations}
                  />
                )
              )}
            </div>
          ) : (
            <ContentNode
              key={resourceNodeIndex}
              {...props}
              node={{
                ...resourceNode,
                assign:
                  resourceNode.assign != null
                    ? {
                        ...resourceNode.assign,
                        modelName: node.config.modelName,
                        id: resolveAssignId({
                          context: state.context,
                          assignIdOrTemplateOrJsonLogic: node.config.resourceId,
                          functions: serializations.functions,
                          contentTree,
                        }),
                      }
                    : undefined,
              }}
              contentTree={contentTree}
              serializations={serializations}
            />
          );
        })}
      </>
    );
  }

  // LINKS
  // LINKS
  // LINKS
  if (node.type === ContentNodeType.A) {
    return node.href?.includes("https://") ? (
      <A href={node.href} target="_blank" {...node.attrs}>
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </A>
    ) : (
      <A
        to={node.href}
        {...node.attrs}
        onClick={() => {
          if (node?.onClick) node?.onClick();
        }}
      >
        {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
      </A>
    );
  }
  if (node.type === ContentNodeType.BUTTON_LINK) {
    // if a button link has an event payload, fire it off (ex: may want to mark off an article "read")
    const onButtonLinkClick = () => {
      logger.info("onButtonLinkClick:", { event: node.event });
      if (typeof node.event === "string") {
        transition({ type: node.event, history: state.history });
      } else if (node.event && typeof node.event === "object" && node.event.type) {
        transition({
          type: node.event.type,
          data: transformEventDataWithJsonLogic(node.event.data, { context: state.context, content: contentTree }),
          history: state.history,
        });
      }
    };

    return (node.href || "")[0] !== "/" || node?.attrs?.target === "_blank" ? (
      <ButtonLink
        className="button-link"
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onButtonLinkClick}
        {...node.attrs}
      >
        <b>{renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}</b>
      </ButtonLink>
    ) : (
      <A
        className="button-link"
        to={node.href}
        {...node.attrs}
        onClick={() => {
          onButtonLinkClick();
          if (node?.onClick) node?.onClick();
        }}
      >
        <Button {...node.attrs}>
          {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
        </Button>
      </A>
    );
  }

  // BUTTONS
  // BUTTONS
  // BUTTONS
  if ([ContentNodeType.BUTTON, ContentNodeType.BUTTON_CONFIRM].includes(node.type)) {
    // Disable if...
    const buttonDisabledByHandler = typeof node.disabled === "function" && node.disabled(state.context);
    const buttonDisabledByFreshDelay = node.disabledByFreshDelay && isFresh;
    const buttonDisabledByInvalidation =
      node.buttonType === "submit" &&
      Object.values(validationMap).some((validationObject: $TSFixMe) => validationObject?.validationError != null);
    const buttonIsDisabled = buttonDisabledByFreshDelay || buttonDisabledByHandler || buttonDisabledByInvalidation;
    const onButtonClick = (e) => {
      // Prevent native form submission attempts (form disconnection warnings)
      if (e?.preventDefault) e.preventDefault();
      // Guard from transitions if inputs failing validation
      const canTransition = node.buttonType === "submit" ? !isFresh && isEveryInputValid(validationMap) : true;
      logger.info("onButtonClick:", {
        event: node.event,
        assign: node.assign,
        onClick: node.onClick,
        validationMap: cloneDeep(validationMap),
        canTransition,
      });
      // Run a function passed to us, but provide an assign/transition in case our content nodes want to do fancy things
      if (typeof node.onClick === "function") {
        node.onClick({
          assign: (newCtx) => transition({ type: "ASSIGN_CONTEXT", ...newCtx }),
          setInputsDirty,
          transition: () => {
            if (canTransition) {
              transition({ type: node.event, history: state.history });
            } else {
              setInputsDirty();
            }
          },
        });
        // Update a context value or trigger a transition event
      } else {
        // --- Assign context (aka update resources/resources updates)
        if (node.assign) {
          if (typeof node.assign === "function") {
            transition({ type: "ASSIGN_CONTEXT", ...node.assign(state.context) });
          } else if (node.assign?.path && node?.assign?.value !== undefined) {
            inputOnChange(node?.assign?.value);
          }
          // --- Transition event by name. NO assignemnt in the process
        } else if (typeof node.event === "string") {
          if (canTransition) {
            transition({ type: node.event, history: state.history });
          } else {
            logger.debug("Did not transition, setting inputs dirty", { validationMap });
            setInputsDirty();
          }
          // --- Transition event with object (incase we want to provide extra event values AND/OR conditionals and assignments if failing)
        } else if (node.event && typeof node.event === "object" && node.event.type) {
          if (canTransition) {
            transition({
              type: node.event.type,
              data: transformEventDataWithJsonLogic(node.event.data, { context: state.context, content: contentTree }),
              history: state.history,
            });
          } else {
            logger.debug("Did not transition, setting inputs dirty", { validationMap });
            setInputsDirty();
          }
          // --- Invalid Transition. Every transition needs a "type"
        } else {
          logger.error('State transition attempted without event "type".');
        }
      }
    };

    let btn;
    if (node.type === ContentNodeType.BUTTON) {
      btn = (
        <Button
          type={node.buttonType === "submit" ? "submit" : "button"} // https://dzello.com/blog/2017/02/19/demystifying-enter-key-submission-for-react-forms/
          disabled={buttonIsDisabled}
          onClick={onButtonClick}
          {...node.attrs}
        >
          {renderWizardML({ ctx: state.context, text: node.text, serializations, contentTree })}
        </Button>
      );
    }
    if (node.type === ContentNodeType.BUTTON_CONFIRM) {
      btn = (
        <ConfirmButton
          disabled={buttonIsDisabled}
          onConfirm={onButtonClick}
          messagePrompts={node.text}
          {...node.attrs}
          serializations={serializations}
        />
      );
    }
    // For inline buttons, we want to wrap them in a div so they don't auto-expand fully and push to button
    if (node?.attrs?.inline) {
      return (
        <StyledInlineButtonWrapper>
          <div>{btn}</div>
        </StyledInlineButtonWrapper>
      );
    }
    // For buttons that shouldn't auto-expand, but should also be centered in their own line
    if (node?.attrs?.centered) {
      return <div style={{ margin: "1em auto", display: "flex", justifyContent: "center" }}>{btn}</div>;
    }
    return btn;
  }

  // NOT HANDLED/MISTAKES
  // NOT HANDLED/MISTAKES
  // NOT HANDLED/MISTAKES
  logger.error(`Unhandled ContentNode type: "${node.type}"`, node);
  return null;
};

const StyledInlineButtonWrapper = styled.div`
  display: flex;
  margin: 0 0 0.6em 0.2em;
  & > div {
    align-self: flex-end;
  }
  @media (max-width: ${defaultTheme.breakpoints[500]}) {
    margin: 0.6em 0;
  }
`;

const StyledCheckboxButton = styled.div<{ ButtonCSS: $TSFixMe; disabled?: boolean }>`
  ${({ ButtonCSS }) => ButtonCSS}
  text-align: center;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  & > div.checkbox {
    margin-right: 6px;
    width: 28px;
    .box {
      height: 18px;
      width: 18px;
      border-radius: 4px;
      border: 1px solid ${defaultTheme.colors.brand[500]};
      &.radio {
        border-radius: 9px;
      }
    }
  }
  & > div.label {
    width: 100%;
    text-align: left;
  }
  ${(props) => {
    if (props.disabled) {
      return css`
        opacity: 0.5;
      `;
    }
  }}
`;

const StyledImageWrapper = styled.div<{ shadow?: boolean }>`
  max-width: 100%;
  padding: 1em;
  img {
    max-width: 100%;
    ${(props) => {
      if (props.shadow) return `box-shadow: ${defaultTheme.effects.shadow[350]}`;
    }}
  }
`;

const StyledIllustrationWrapper = styled.div`
  overflow: hidden;
  text-align: center;
  margin: 0 auto;
  margin-bottom: 0 !important;
  // Idk, might get rid of the centering
  display: flex;
  align-items: center;
  svg {
    height: 100%;
    margin: 0 auto;
    min-height: ${(props) => props.style?.maxHeight || "320px"};
    max-height: ${(props) => props.style?.maxWidth || "320px"};
  }
`;

const StyledAddressSuggestionsBox = styled.div`
  margin-top: -0.25em;
  margin-bottom: 0.5em;
  padding: 0.25em 0;
  background: ${defaultTheme.colors.brand[900]};
  width: 100%;
  border-radius: 0 0 24px 24px;
  // For some reason, the autocomplete library requires a map be mounted/rendered. This throw away div is for that
  #address-suggestions__throw-away-map {
    display: none;
    height: 0;
    max-height: 0;
    width: 0;
    max-width: 0;
  }
  label {
    font-size: 10px;
    font-weight: 500;
  }
  .address-suggestions__place,
  .address-suggestions__close {
    border-radius: 4px;
    margin: 0.25em 1.25em 0.5em;
    padding: 0.25em 0.5em;
    font-size: 12px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
    }
  }
  .address-suggestions__place {
    background: ${defaultTheme.colors.brand[900]};
    border: 1px solid ${defaultTheme.colors.brand[800]};
    border-bottom: 2px solid ${defaultTheme.colors.brand[700]};
    color: ${defaultTheme.colors.brand[500]};
  }
  .address-suggestions__close {
    text-align: center;
    text-decoration: underline;
    color: ${defaultTheme.colors.brand[500]};
  }
`;

const StyledResourcesList = styled.div`
  &.empty {
    background: ${defaultTheme.colors.white[900]};
    border: 2px dashed ${defaultTheme.colors.brand[800]};
    border-radius: 6px;
    padding: 1em;
    margin: 0.5em 0;
    text-align: center;
    small {
      color: ${defaultTheme.colors.brand[600]};
    }
  }
`;

const StyledCountdownTimerNode = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.4em !important;
  margin-bottom: 0.4em !important;
`;

const StyledMultiSelectButtonList = styled.div`
  button {
    margin-top: 3px;
    margin-bottom: 3px;
  }
`;
