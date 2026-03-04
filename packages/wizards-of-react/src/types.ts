import { $TSFixMe, TSpellMap, TWizardModelsMap, TWizardSerializations, TWizardSession } from "@xstate-wizards/spells";

export type TWizardNavigate = (path: string, navigateOptions: $TSFixMe) => void;

export type TWizardRunnerProps = {
  configExitTo?: string;
  configInitial?: string;
  debugConfig?: {
    logging: boolean;
    skipSaves?: boolean;
  };
  models?: TWizardModelsMap;
  navigate: TWizardNavigate;
  navigationUnblockCheck?: (args: { location: Location }) => boolean;
  serializations?: TWizardSerializations;
  spellKey?: string;
  spellMap: TSpellMap;
  sessionEnabled?: boolean;
  sessionForceNew?: boolean;
  sessionRequestCheck?: (args: { key: string; version?: string }) => TWizardSession | null;
  sessionRequestStart?: (args: { key: string; version?: string }) => TWizardSession;
  sessionRequestProgress?: (args: {
    interviewSessionId: number | string;
    machine?: $TSFixMe;
    progressPercentage?: number;
  }) => void;
  locale?: string; // e.g. "en", "es" — for resolving inline i18n translations
  onWizardContextPrep?: (preppedContext: Record<string, any>) => Record<string, any>;
  onWizardChange?: (state: $TSFixMe) => void;
  onWizardError?: $TSFixMe;
  onWizardFinal?: (args: { finalEvent: any; machine: any }) => void; // finalEvent is just machine.event. legacy
  onWizardProgress?: (args: { progressPercentage: number; machine: any }) => void;
  onMount?: () => void;
  onUnmount?: () => void;
  useNavigationBlocker?: $TSFixMe; // useBlock
};

export type TWizardStateMachineManagerProps = {
  machine: $TSFixMe;
  spellMap?: TSpellMap;
  serializations?: TWizardSerializations;
  navigate: TWizardNavigate;
  navigationUnblockCheck?: (args: { location: Location }) => boolean;
  onMachineChange?: TWizardRunnerProps["onWizardChange"];
  onMachineError?: (err: any) => void;
  onMachineFinal?: TWizardRunnerProps["onWizardFinal"];
  onMachineProgress?: TWizardRunnerProps["onWizardProgress"];
  useNavigationBlocker?: $TSFixMe;
};

export type TWizardStateViewerProps = {
  machineMeta: any;
  meta: any;
  state: any;
  transition: any;
  serializations?: TWizardSerializations;
  navigate: TWizardNavigate;
};
