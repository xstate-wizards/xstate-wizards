import { TSpellModelOptionsMap, TWizardModelsMap } from "../types";

export async function wizardModelsFetching(
  wizardModels: TWizardModelsMap,
  spellModelOptions: TSpellModelOptionsMap
): Promise<Record<string, any[]>> {
  // Fetch (use spell's map, but wizard's loaders)
  const loadedData = await Promise.all(
    Object.keys(spellModelOptions).map(async (modelName) => [
      modelName,
      await wizardModels[modelName].loader(spellModelOptions[modelName].loader),
    ])
  );
  // Return parsed
  return loadedData.reduce(
    (accum, [modelName, modelData]) => ({
      ...accum,
      [modelName as string]: modelData,
    }),
    {}
  );
}
