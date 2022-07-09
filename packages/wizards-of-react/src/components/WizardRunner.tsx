import { isBefore, subMinutes } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { assign } from "xstate";
import {
  $TSFixMe,
  createLocalId,
  deleteResourceOnContext,
  internalGuards,
  LOCAL_STORAGE_WIZARD_LAST_RELOAD_AT,
  parseDate,
  prepMachineContextWithResources,
  setJsonLogicOperation,
  TWizardSession,
  updateResourceOnContext,
  upsertResourceOnContext,
  wizardModelsFetching,
} from "@xstate-wizards/spells";

import { TWizardRunnerProps } from "../types";
import { logger, useWizardDebugger } from "../wizardDebugger";
import { useWindowFocusEffect } from "../hooks/useWindowFocusEffect";
import { WizardStateMachineManager } from "./WizardStateMachineManager";

const CACHE_SESSION_LAST_PROGRESS_AT: Record<number, number> = {};

export const WizardRunner = ({
  configInitial,
  configExitTo,
  debugConfig,
  models = {},
  navigate,
  navigationUnblockCheck,
  onWizardChange,
  onWizardContextPrep,
  onWizardError,
  onWizardFinal,
  onWizardProgress,
  onMount,
  onUnmount,
  serializations,
  sessionEnabled,
  sessionForceNew,
  sessionRequestCheck,
  sessionRequestStart,
  sessionRequestProgress,
  spellKey,
  spellMap,
  useNavigationBlocker,
}: TWizardRunnerProps) => {
  // SETUP
  const wizardDebugger = useWizardDebugger();
  const [hydratedResources, setHydratedResources] = useState<$TSFixMe>();
  const [sessionHandled, setSessionHandled] = useState(sessionEnabled === true ? false : true); // If no spellKey, skip session init
  const [interviewSession, setInterviewSession] = useState<TWizardSession>(null);
  const [showInterviewInactive, setShowInterviewInactive] = useState(false);
  const [initialMachineContext, setInitialMachineContext] = useState<$TSFixMe>();
  // --- basic checks
  if (spellMap[spellKey] == null) throw new Error(`spellMap missing spell/machine: '${spellKey}'`);
  // --- serializations
  // --- serializations: actions
  // --- serializations: actions - models
  const machineModelNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.values(spellMap)
            .map((spellMap) => Object.keys(spellMap.models))
            .flat()
            .filter((str) => str),
          ...Object.keys(models),
        ])
      ),
    [spellMap]
  );
  for (const modelName of machineModelNames) {
    serializations.actions[`Models.${modelName}.create`] = assign((ctx) =>
      upsertResourceOnContext(ctx, { modelName, id: createLocalId() })
    );
    serializations.actions[`Models.${modelName}.update`] = assign((ctx, ev: $TSFixMe) =>
      updateResourceOnContext(ctx, { modelName, id: ev.data.id, props: ev.data })
    );
    serializations.actions[`Models.${modelName}.delete`] = assign((ctx, ev) =>
      // @ts-expect-error
      deleteResourceOnContext(ctx, { modelName, id: ev?.data?.id })
    );
  }

  // --- serializations: components
  const SessionInactiveOverlay = serializations?.components?.SessionInactiveOverlay;
  // --- serializations: functions
  for (const functionName in serializations?.functions) {
    setJsonLogicOperation(functionName, serializations?.functions[functionName]);
  }
  // --- serializations: guards
  for (const guardName in internalGuards) {
    serializations.guards[guardName] = internalGuards[guardName];
  }

  // ON MOUNT
  useEffect(() => {
    // --- setup debugger
    wizardDebugger.setLogging(debugConfig?.logging);
    wizardDebugger.setSkipSaves(debugConfig?.skipSaves);
    // --- on mount handler
    onMount?.();
    logger.info("onMount");

    // ==========================
    // FETCH MODELS & INIT SESSION
    // ==========================
    if (!hydratedResources || !sessionHandled) {
      const hydrateDataAndSession = async () => {
        // 1) --- Resources/models init
        const resources = await wizardModelsFetching(models, spellMap[spellKey]?.models);
        logger.info("Loaded Resources:", resources);
        // 2) --- Session Init (if we have a machine id)
        if (sessionEnabled && debugConfig?.skipSaves) {
          logger.info("Skipping session check/start");
        } else if (
          sessionEnabled &&
          (!spellKey || !sessionRequestCheck || !sessionRequestProgress || !sessionRequestStart)
        ) {
          logger.error("Session request methods and/or spellKey missing.");
        } else if (sessionEnabled && spellKey) {
          // 2a) --- check for current session (unless force starting)
          let currentSession: TWizardSession;
          if (sessionForceNew !== true) {
            // TODO fix typing...
            logger.info("Session Request: Check");
            currentSession = await sessionRequestCheck?.({
              key: spellKey,
              version: spellMap[spellKey]?.version,
            });
          }
          // 2b) --- start if missing or force starting
          if (sessionForceNew === true) {
            logger.info("Session force started.");
          }
          if (!currentSession || sessionForceNew === true) {
            logger.info("Session Request: Start");
            currentSession = await sessionRequestStart({
              key: spellKey,
              version: spellMap[spellKey]?.version,
            });
          }
          // If the session saved uses a machine version beyond our current one, force a reload of the page to get new code bundle
          if (
            currentSession?.version?.split(".")?.[0] != null &&
            spellMap[spellKey]?.version?.split(".")?.[0] != null &&
            Number(currentSession?.version?.split(".")?.[0]) > Number(spellMap[spellKey]?.version?.split(".")?.[0])
          ) {
            // HACK:  If local machine versions are incorrectly beyond the machine version, a never ending reload cycles starts
            //For now, saving the reload time stamp so we don't keep cycling
            if (
              localStorage.getItem(LOCAL_STORAGE_WIZARD_LAST_RELOAD_AT) == null ||
              isBefore(parseDate(localStorage.getItem(LOCAL_STORAGE_WIZARD_LAST_RELOAD_AT)), subMinutes(new Date(), 5))
            ) {
              localStorage.setItem(LOCAL_STORAGE_WIZARD_LAST_RELOAD_AT, new Date().getTime().toString());
              location.reload();
            }
          }
          setInterviewSession(currentSession);
        }
        setSessionHandled(true);
        logger.info("Session Handled");
        // --- Load models onto state for interview container/machine context
        setHydratedResources(resources);
        logger.info("Resources Hydrated");
      };
      hydrateDataAndSession();
    }
    // ON UNMOUNT
    return () => {
      logger.info("onUnmount");
      // --- used to be used for opening/closing floating help widget
      onUnmount?.();
    };
  }, []);
  // --- when hydrated + session setup, set machine ctx
  useEffect(() => {
    if (hydratedResources && sessionHandled && !initialMachineContext) {
      setInitialMachineContext(
        ((preppedContext) =>
          typeof onWizardContextPrep === "function" ? onWizardContextPrep(preppedContext) : preppedContext)(
          prepMachineContextWithResources(spellMap[spellKey]?.models, hydratedResources)
        )
      );
    }
  }, [onWizardContextPrep, hydratedResources, sessionHandled]);

  // ==========================
  // PROGRESS HANDLING
  // ==========================
  const machineProgressHandler = ({ machine, progressPercentage }) => {
    // --- update interview progress (ignore if done === true, let the other handler do that to ensure onDone runs after progress is saved)
    if (!wizardDebugger.skipSaves && interviewSession?.id) {
      logger.info(`Session Request: Progress (${machine?.value ?? ""})`);
      sessionRequestProgress?.({ interviewSessionId: interviewSession?.id, progressPercentage, machine });
      // --- cache progress at time for inactivity checks
      CACHE_SESSION_LAST_PROGRESS_AT[interviewSession?.id] = new Date().getTime();
    }
    // --- bubble up
    onWizardProgress?.({ machine, progressPercentage });
  };

  // ==========================
  // ACTIVITY
  // ==========================
  // when we mount an WizardRunner with sessions enabled, we check if the
  // session is still active whenever the window is focused and on a regular interval.
  // this forces users to only have ONE active interview session at a time.
  const checkSesssionIsActive = useCallback(async () => {
    // skip if no interview session or already showing inactive screen
    if (!interviewSession || showInterviewInactive) return;
    // get times for active/cached progress
    // const activeInterviewSession = null;
    const activeInterviewSession = await sessionRequestCheck?.({
      key: spellKey,
      version: spellMap[spellKey]?.version,
    });
    const activeProgressAt = parseDate(activeInterviewSession?.progressAt)?.getTime();
    const cachedLastProgressAt = CACHE_SESSION_LAST_PROGRESS_AT[interviewSession.id] || null;
    logger.info(
      `Is Session Inactive?... activeProgressAt: ${activeProgressAt}, cachedLastProgressAt: ${cachedLastProgressAt}`
    );
    // if the interview is no longer active (is ended, possibly due to the start of a different interview)
    // or if the interview session was updated, but does not match the cached timestamp
    // for the current browser session (possibly due to multiple browser tabs of the same session)
    // ... then notify the user that they must exit this current interview
    if (
      !activeInterviewSession ||
      (cachedLastProgressAt && activeProgressAt && activeProgressAt > cachedLastProgressAt)
    ) {
      logger.info(`Inactive Session`);
      setShowInterviewInactive(true);
    }
  }, [interviewSession, showInterviewInactive]);
  // --- on long interval (30sec), check active
  useEffect(() => {
    const checkSesssionIsActiveInterval = setInterval(() => checkSesssionIsActive(), 1000 * 30);
    return () => clearInterval(checkSesssionIsActiveInterval);
  }, [checkSesssionIsActive]);
  // --- on window focus, check active
  useWindowFocusEffect(checkSesssionIsActive, [checkSesssionIsActive]);

  // ==========================
  // RENDER
  // ==========================
  return initialMachineContext !== undefined ? (
    <div style={showInterviewInactive ? { overflow: "hidden", height: "100vh" } : null}>
      <WizardStateMachineManager
        // Machine (from either of 2 methods)
        // ~~~~~~a) a machine already called (allows custom machine ctx, createMachine)~~~~~~ removing to simplify api
        // b) a spellMap + spellKey to grab a createMachine function from
        // @ts-ignore
        machine={spellMap[spellKey]?.createMachine(
          // --- if a on machine context prep function exists, run through that handler (ex: we need this to prep a filer 1 on about you machine)
          initialMachineContext,
          {
            session: interviewSession,
            initial: configInitial,
            spellMap,
            serializations,
            meta: {
              initial: configInitial,
              exitTo: configExitTo,
            },
          }
        )}
        spellMap={spellMap}
        serializations={serializations}
        navigate={navigate}
        navigationUnblockCheck={navigationUnblockCheck}
        onMachineChange={(state) => {
          logger.debug("On Machine: Change", state);
          onWizardChange?.(state);
        }}
        onMachineError={(err) => {
          logger.error("On Machine: Error", err);
          onWizardError?.(err);
        }}
        onMachineFinal={(data) => {
          logger.info("On Machine: Final", data);
          onWizardFinal?.(data);
        }}
        onMachineProgress={machineProgressHandler}
        useNavigationBlocker={useNavigationBlocker}
      />
      {showInterviewInactive && SessionInactiveOverlay != null ? <SessionInactiveOverlay /> : null}
    </div>
  ) : null;
};
