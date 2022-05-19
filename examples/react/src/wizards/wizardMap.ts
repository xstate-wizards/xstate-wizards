export const ID_EXAMPLE_INTERVIEW = "exampleInterview";
export const ID_EXAMPLE_SCREENER = "exampleScreener";
export const ID_EXAMPLE_SPAWNED_MACHINE = "exampleSpawnedMachine";

// HACK: deal with circular dependency issue more elegantly/behind the scenes
export const getWizardMap = async () => {
  return {
    [ID_EXAMPLE_INTERVIEW]: await import("./exampleInterview").then((m) => m.machineMapping),
    [ID_EXAMPLE_SCREENER]: await import("./exampleScreener").then((m) => m.machineMapping),
    [ID_EXAMPLE_SPAWNED_MACHINE]: await import("./exampleSpawnedMachine").then((m) => m.machineMapping),
  };
};
