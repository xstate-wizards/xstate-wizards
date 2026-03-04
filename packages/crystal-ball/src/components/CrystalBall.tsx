import { get } from "lodash";
import { Fragment } from "react";
import { emptyMachineContext, TSpellMap } from "@xstate-wizards/spells";
import { contentNodeToOutlineNode } from "./contentNodes/contentNodeToOutlineNode";
import { NodeNotes } from "./contentNodes/NodeNotes";
import { useOutline } from "../data/OutlineStore";

const nodeHighlightsToClassName = (graphJSONId, nodeHighlights): string => {
  return `${nodeHighlights.sourceId === graphJSONId ? "xw-cb--source" : ""} ${
    nodeHighlights.targetIds.some((id) => graphJSONId.includes(id)) ? "xw-cb--edge" : ""
  } ${nodeHighlights.targetIds.some((id) => id === graphJSONId) ? "xw-cb--target" : ""}`.trim();
};

type TCrystalBallProps = {
  spellKey: string;
  spellMap: TSpellMap;
};

// v5: toDirectedGraph removed from @xstate/graph. Walk machine config manually.
function machineConfigToGraph(machine: any) {
  const config = machine.config ?? machine;
  const states = config.states ?? {};
  const machineId = config.id ?? "machine";
  return {
    id: machineId,
    children: Object.entries(states).map(([stateName, stateConfig]: [string, any]) => {
      // Build edges from transitions
      const edges: any[] = [];
      const onConfig = stateConfig.on ?? {};
      for (const [eventName, transition] of Object.entries(onConfig)) {
        const targets = Array.isArray(transition)
          ? transition.map((t: any) => (typeof t === "string" ? t : t.target)).filter(Boolean)
          : [typeof transition === "string" ? transition : (transition as any)?.target].filter(Boolean);
        for (const target of targets) {
          edges.push({
            label: { text: eventName },
            target: { id: `${machineId}.${target}` },
          });
        }
      }
      // Add invoke onDone edges
      const invoke = stateConfig.invoke;
      if (invoke) {
        const invokes = Array.isArray(invoke) ? invoke : [invoke];
        for (const inv of invokes) {
          const onDone = inv.onDone;
          if (onDone) {
            const doneTransitions = Array.isArray(onDone) ? onDone : [onDone];
            for (const dt of doneTransitions) {
              if (dt && (typeof dt === "string" || dt.target)) {
                edges.push({
                  label: { text: `done.invoke.${inv.id ?? ""}` },
                  target: { id: `${machineId}.${typeof dt === "string" ? dt : dt.target}` },
                });
              }
            }
          }
        }
      }
      return {
        id: `${machineId}.${stateName}`,
        stateNode: {
          type: stateConfig.type ?? "default",
          meta: stateConfig.meta ?? {},
        },
        edges,
      };
    }),
  };
}

export const CrystalBall: React.FC<TCrystalBallProps> = ({ spellKey, spellMap }): React.ReactElement => {
  // SETUP
  const outliner = useOutline();
  // --- machine
  const machine = spellMap[spellKey].createMachine(emptyMachineContext, {
    meta: { initial: "", outlineMode: true },
    serializations: { functions: {} },
    spellMap,
  });
  // --- graph/outline (v5: walk machine config instead of @xstate/graph)
  const directedGraph = machineConfigToGraph(machine);

  // RENDER
  return (
    <div className="xw-cb--crystal-ball">
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
              className={`xw-cb--node ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}
            >
              <div className={`xw-cb--node-header ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}>
                {(() => {
                  if (outliner.nodeHighlights.sourceId === graphJSON.id) return "CURRENT";
                  if (outliner.nodeHighlights.targetIds.some((id) => id === graphJSON.id)) return "NEXT";
                  return "STATE";
                })()}{" "}
                -- #{graphJSON.id}
              </div>
              {(typeof meta.content === "function" ? meta.content({ context: { __outline__: true } as any }) : meta.content).map(
                (contentNode, ci) => (
                  <Fragment key={ci}>
                    {contentNodeToOutlineNode({
                      contentNode,
                      contentNodeIndex: ci,
                      // v5: context is a factory function; get initial context
                      context: typeof machine.config?.context === 'function' ? machine.config.context({}) : (machine.config?.context ?? {}),
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
              className={`xw-cb--machine-section ${nodeHighlightsToClassName(graphJSON.id, outliner.nodeHighlights)}`}
            >
              <CrystalBall spellKey={machineId} spellMap={spellMap} />
              <div className="xw-cb--machine-section__done-conditions">
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
    </div>
  );
};
