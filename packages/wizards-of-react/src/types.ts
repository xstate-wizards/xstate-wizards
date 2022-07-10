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
  navigationUnblockCheck?: ({ location: Location }) => boolean;
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
  onWizardContextPrep?: (preppedContext: Record<string, any>) => Record<string, any>;
  onWizardChange?: (state: $TSFixMe) => void;
  onWizardError?: $TSFixMe;
  onWizardFinal?: ({ finalEvent, machine }: $TSFixMe) => void; // finalEvent is just machine.event. legacy
  onWizardProgress?: ({ progressPercentage: number, machine: $TSFixMe }) => void; // TODO: should find the right way to type xstate machine state
  onMount?: () => void;
  onUnmount?: () => void;
  useNavigationBlocker?: $TSFixMe; // useBlock
};

export type TWizardStateMachineManagerProps = {
  machine: $TSFixMe; // TODO: MachineConfig<InterviewContext, InterviewStates, InterviewEvent>??? https://github.com/davidkpiano/xstate/discussions/1719
  spellMap?: TSpellMap;
  serializations?: TWizardSerializations;
  navigate: TWizardNavigate;
  navigationUnblockCheck?: ({ location: Location }) => boolean;
  onMachineChange?: TWizardRunnerProps["onWizardChange"];
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
