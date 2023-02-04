import { get } from "lodash";
import { Fragment } from "react";
import styled from "styled-components";
import { toDirectedGraph } from "@xstate/graph";
import { emptyMachineContext, TSpellMap } from "@xstate-wizards/spells";
import { wizardTheme } from "@xstate-wizards/wizards-of-react";
import { contentNodeToOutlineNode } from "./contentNodes/contentNodeToOutlineNode";
import { NodeNotes } from "./contentNodes/NodeNotes";
import { useOutline } from "../data/OutlineStore";
import { SharedCrystalBallCSS } from "./styled/SharedCrystalBallCSS.css";

const nodeHighlightsToClassName = (graphJSONId, nodeHighlights): string => {
  return `${nodeHighlights.sourceId === graphJSONId ? "source" : ""} ${
    nodeHighlights.targetIds.some((id) => graphJSONId.includes(id)) ? "edge" : ""
  } ${nodeHighlights.targetIds.some((id) => id === graphJSONId) ? "target" : ""}`.trim();
};

type TCrystalBallProps = {
  spellKey: string;
  spellMap: TSpellMap;
};

export const CrystalBall: React.FC<TCrystalBallProps> = ({ spellKey, spellMap }): React.ReactElement => {
  // SETUP
  const outliner = useOutline();
  // --- machine
  const machine = spellMap[spellKey].createMachine(emptyMachineContext, {
    meta: { initial: "", outlineMode: true },
    serializations: { functions: {} },
    spellMap,
  });
  // --- graph/outline
  const directedGraph = toDirectedGraph(machine);

  // RENDER
  return (
    <StyledCrystalBall>
      {directedGraph.children.map((graphJSON, childIndex) => {
        const nodeType = get(graphJSON.stateNode, "meta.nodeType");
        const meta = get(graphJSON.stateNode, "meta", {});
        // - Final states ignored?
        if (graphJSON.stateNode.type === "final") {
          return null;
        }
        // - Content node rendering
        // TODO: when meta.content is a function, we can only pass in outline true, not either boolean
        if (meta && meta.content) {
          return (
            <div
              key={`${childIndex}-${graphJSON.id}`}
              id={graphJSON.id}
              className={`node ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}
            >
              <div className={`node-header ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}>
                {(() => {
                  if (outliner.nodeHighlights.sourceId === graphJSON.id) return "CURRENT";
                  if (outliner.nodeHighlights.targetIds.some((id) => id === graphJSON.id)) return "NEXT";
                  return "STATE";
                })()}{" "}
                -- #{graphJSON.id}
              </div>
              {(typeof meta.content === "function" ? meta.content({ __outline__: true }) : meta.content).map(
                (contentNode, ci) => (
                  <Fragment key={ci}>
                    {contentNodeToOutlineNode({
                      contentNode,
                      contentNodeIndex: ci,
                      context: machine.context,
                      graphJSON,
                      outliner,
                    })}
                  </Fragment>
                )
              )}
              <NodeNotes notes={meta.notes} />
            </div>
          );
        }
        // - Nested machine (we're not dealing with the potential of a 3rd+ machine layer right now...)
        const machineId = Object.keys(spellMap).find((key) => key === nodeType);
        if (spellMap[machineId]) {
          return (
            <div
              key={`${childIndex}-${graphJSON.id}`}
              id={graphJSON.id}
              className={`machine-section ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}
            >
              <CrystalBall spellKey={machineId} spellMap={spellMap} />
              <div className="machine-section__done-conditions">
                {graphJSON.edges
                  .filter((e) => e.label.text.includes("done"))
                  .map((edge, edgeIndex) => (
                    <button
                      key={(edgeIndex ?? 0) + 1}
                      onClick={() =>
                        outliner.setNodeHighlights({ sourceId: graphJSON.id, targetIds: [edge.target.id] })
                      }
                    >
                      Done Condition #{edgeIndex + 1}
                    </button>
                  ))}
              </div>
            </div>
          );
        }
        // no content no nested machine
        return null;
      })}
    </StyledCrystalBall>
  );
};

const StyledCrystalBall = styled.div`
  ${SharedCrystalBallCSS}
  background: ${wizardTheme.colors.white[600]};
  font-size: 12px;
  text-align: left;
  padding: 2em 0;
  div {
    border: 2px solid transparent;
    &.node {
      background: white;
      border-radius: 12px;
      border: 2px solid ${wizardTheme.colors.white[600]};
      margin-bottom: 0.75em;
      & > .node-header {
        padding: 0.5em 1em;
        margin-bottom: 0.25em;
        border-radius: 8px;
        background: ${wizardTheme.colors.white[300]};
        font-size: 10px;
        font-weight: 500;
        color: ${wizardTheme.colors.gray[900]};
      }
      & > *:not(.node-header) {
        padding: 0.1em 1em;
      }
    }
    &.source {
      border: 2px solid #3c5dff;
      & > .node-header {
        background: ${wizardTheme.colors.blue[500]};
        color: white;
      }
    }
    &.edge {
      border: 2px solid yellow;
    }
    &.target {
      border: 2px solid #17dc83;
      & > .node-header {
        background: ${wizardTheme.colors.green[500]};
        color: white;
      }
    }
    p,
    ul,
    ol {
      margin: 0;
    }
    p {
      font-size: 12px;
      line-height: 150%;
    }
    ul {
      list-style: disc;
      margin-left: 16px;
    }
    .input {
      label {
        min-width: 180px;
        display: inline-flex;
      }
      textarea {
        width: 100%;
      }
    }
    .required-star {
      color: ${wizardTheme.colors.red[500]}
      font-size: 14px;
      margin-left: 2px;
    }
    div.back-button {
      position: relative;
      margin-left: -88px;
      margin-bottom: -20px;
      top: -20px;
      // &::before {
      //   content: "←Back";
      // }
    }
    .conditional {
      padding: 0 !important;
      background: ${wizardTheme.colors.white[800]}
      border-radius: 4px;
      .conditional__description {
        font-size: 10px;
        font-weight: 900;
        background: ${wizardTheme.colors.white[500]};
        color: ${wizardTheme.colors.gray[900]};
        padding: 2px 6px 0;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .conditional__description__toggles {
          button {
            margin-right: 4px;
            font-size: 9px;
            opacity: 0.5;
            &.active {
              opacity: 1;
            }
          }
        }
      }
      .conditional__section {
        border: 2px solid ${wizardTheme.colors.white[500]};
      }
      .conditional__section__title {
        font-size: 10px;
        font-weight: 900;
        padding: 0 6px;
        background: ${wizardTheme.colors.white[500]};
        color: ${wizardTheme.colors.gray[900]};
        display: flex;
        align-items: center;
        height: 20px;
      }
      .conditional__section__nodes {
        background: white;
        padding: 4px;
        & > .conditional {
          margin: 0 !important;
        }
      }
    }
    & > .conditional {
      margin: 0 1em !important;
    }
  }
  div.conditional-ui {
    margin: 0;
    & > div {
      padding: 0;
      &.conditional-segment {
        background: #fafafa;
        padding: 0.25em 1em !important;
      }
    }
  }
  div.machine-section {
    margin-left: auto;
    margin-top: 0.5em;
    width: 90%;
    background: transparent;
    padding: 0 !important;
    border-radius: 8px;
    & > div:not(.node-header) {
      width: 100%;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .machine-section__done-conditions {
      padding: 0.5em 1.25em;
    }
  }
  div.final {
    border-radius: 24px;
    text-align: left;
    &.cancel.target {
      background: ${wizardTheme.colors.red[300]};
      color: white;
      border: 2px solid ${wizardTheme.colors.red[300]};
    }
    &.save.target {
      background: ${wizardTheme.colors.green[300]};
      color: white;
      border: 2px solid ${wizardTheme.colors.green[300]};
    }
  }
  div.node-header {
    border: none;
    margin: 0;
    padding: 0 0.25em;
  }
  // Copying from ButtonCSS
  .outline__button {
    border-radius: 4px;
    font-weight: 500;
    font-size: 11px;
    padding: 0.4em 1em;
    background: transparent;
    outline: none;
    border: 1px solid ${wizardTheme.colors.gray[900]};
    color: ${wizardTheme.colors.gray[500]}
  }
  div.outline__component {
    border: 2px solid ${wizardTheme.colors.white[700]};
    border-radius: 4px;
    margin: 0.25em;
    padding: 0.25em;
  }
  div.outline__component-place-holder,
  div.outline__media-place-holder {
    background: ${wizardTheme.colors.blue[900]};
    border: 2px solid ${wizardTheme.colors.blue[800]};
    color: ${wizardTheme.colors.blue[600]};
    border-radius: 4px;
    margin: 0.5em;
    padding: 1em;
    text-align: center;
    font-weight: 900;
  }
  div.outline__component-place-holder {
    &::before {
      content: "Component Placeholder: ";
    }
  }
  div.outline__media-place-holder {
    background: ${wizardTheme.colors.white[800]}
    border: 2px solid ${wizardTheme.colors.white[700]};
    color: ${wizardTheme.colors.gray[900]};
    &::before {
      content: "Media Placeholder: ";
    }
  }
`;
