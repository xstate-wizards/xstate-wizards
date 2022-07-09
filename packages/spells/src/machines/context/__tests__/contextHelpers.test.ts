// @ts-nocheck

import { TSpellModelOptionsMap } from "../../../types";
import { createLocalId } from "../../../models/idHelpers";
import {
  prepMachineContextWithResources,
  upsertResourceOnContext,
  updateResourceOnContext,
  deleteResourceOnContext,
} from "../contextHelpers";

describe("prepMachineContextWithResources", () => {
  // SETUP
  const keys = ["Filer", "Asset", "Claim"];
  const upsolveWizardModelsMap: TSpellModelOptionsMap = {
    Filer: { loader: { withGraph: "[addresses]" } },
    Asset: { loader: { withGraph: "[]" } },
    Claim: { loader: { withGraph: "[creditor]" } },
  };
  const testStore = {};
  const ctx = prepMachineContextWithResources(upsolveWizardModelsMap, testStore);

  // TESTS
  test("setup resources", () => {
    keys.forEach((key) => {
      // Check resources
      expect(ctx.resources[key]).not.toBeNull();
      expect(ctx.resourcesUpdates[key]).not.toBeNull();
    });
  });
  test("setup resourcesUpdates", () => {
    keys.forEach((key) => {
      expect(ctx.resourcesUpdates[key].create).not.toBeNull();
      expect(ctx.resourcesUpdates[key].update).not.toBeNull();
      expect(ctx.resourcesUpdates[key].delete).not.toBeNull();
      expect(ctx.resourcesUpdates[key].relate).not.toBeNull();
      expect(ctx.resourcesUpdates[key].unrelate).not.toBeNull();
    });
  });
});

describe("upsertResourceOnContext", () => {
  // SETUP
  const upsolveWizardModelsMap: TSpellModelOptionsMap = {
    File: { loader: { withGraph: "[]" } },
    Supplement: { loader: { withGraph: "[files]" } },
  };
  const ctx = prepMachineContextWithResources(upsolveWizardModelsMap, {});

  // TESTS
  test("database id", () => {
    const databaseId = 123;
    const newCtx = upsertResourceOnContext(ctx, {
      modelName: "File",
      id: databaseId,
      props: {
        awsStorageKey: "1/123/cat.png",
        createdAt: new Date(),
        name: "cat.png",
        supplementId: undefined,
        thumbnailUrl: "https://example.com/assets/1/123/cat-640.png",
        url: "https://example.com/assets/1/123/cat.png",
      },
    });
    // Expect resource
    expect(newCtx.resources.File[databaseId]).not.toBeUndefined();
    expect(newCtx.resources.File[databaseId].awsStorageKey).toBe("1/123/cat.png");
    expect(newCtx.resources.File[databaseId].supplementId).toBeUndefined();
    // Expect no resource create or update record (already exists)
    expect(newCtx.resourcesUpdates.File.create.some((c) => c.id === databaseId)).toBe(false);
    expect(newCtx.resourcesUpdates.File.update.some((u) => u.id === databaseId)).toBe(false);
  });
  test("local id", () => {
    const localId = createLocalId();
    const newCtx = upsertResourceOnContext(ctx, {
      modelName: "File",
      id: localId,
      props: {
        awsStorageKey: "1/123/dog.png",
        createdAt: new Date(),
        name: "dog.png",
        supplementId: undefined,
        thumbnailUrl: "https://example.com/assets/1/123/dog-640.png",
        url: "https://example.com/assets/1/123/dog.png",
      },
    });

    // Expect resource
    expect(newCtx.resources.File[localId]).not.toBeUndefined();
    expect(newCtx.resources.File[localId].awsStorageKey).toBe("1/123/dog.png");
    expect(newCtx.resources.File[localId].supplementId).toBeUndefined();

    // Expect resourcesUpdates create record
    expect(newCtx.resourcesUpdates.File.create.some((c) => c.id === localId)).toBe(true);
    expect(newCtx.resourcesUpdates.File.update.some((u) => u.id === localId)).toBe(false);
  });
  test("initial ctx was not mutated", () => {
    expect(Object.keys(ctx.resources.File).length).toBe(0);
    expect(Object.keys(ctx.resources.Supplement).length).toBe(0);
  });
});

describe("updateResourceOnContext", () => {
  // SETUP
  const upsolveWizardModelsMap: TSpellModelOptionsMap = {
    File: { loader: { withGraph: "[]" } },
    Supplement: { loader: { withGraph: "[files]" } },
  };
  const fileId = 456;
  const supplementId = createLocalId();
  const ctx = upsertResourceOnContext(prepMachineContextWithResources(upsolveWizardModelsMap, {}), [
    {
      modelName: "Supplement",
      id: supplementId,
    },
    {
      modelName: "File",
      id: fileId,
      props: {
        awsStorageKey: "1/456/gideon.jpg",
        createdAt: new Date(),
        name: "gideon.jpg",
        supplementId: undefined,
        thumbnailUrl: "https://example.com/assets/1/123/gideon-640.jpg",
        url: "https://example.com/assets/1/123/gideon.jpg",
      },
    },
  ]);

  // TESTS
  test("should not add update to resourcesUpdates, properties equal", () => {
    expect(ctx.resourcesUpdates.File.create?.length).toEqual(0);
    expect(ctx.resourcesUpdates.File.update?.length).toEqual(0);
    expect(ctx.resourcesUpdates.Supplement.create?.length).toBeGreaterThan(0);
    expect(ctx.resourcesUpdates.Supplement.update?.length).toEqual(0);
    const newCtx = updateResourceOnContext(ctx, {
      modelName: "File",
      id: fileId,
      props: {
        awsStorageKey: "1/456/gideon.jpg",
        name: "gideon.jpg",
      },
    });
    expect(newCtx.resourcesUpdates.File.create?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.File.update?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.Supplement.create?.length).toEqual(1);
    expect(newCtx.resourcesUpdates.Supplement.update?.length).toEqual(0);
  });

  test("added update to resourcesUpdates", () => {
    expect(ctx.resourcesUpdates.File.create?.length).toEqual(0);
    expect(ctx.resourcesUpdates.File.update?.length).toEqual(0);
    expect(ctx.resourcesUpdates.Supplement.create?.length).toBeGreaterThan(0);
    expect(ctx.resourcesUpdates.Supplement.update?.length).toEqual(0);
    const newCtx = updateResourceOnContext(ctx, {
      modelName: "File",
      id: fileId,
      props: {
        supplementId,
      },
    });
    expect(newCtx.resourcesUpdates.File.create?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.File.update?.length).toEqual(1);
    expect(newCtx.resourcesUpdates.Supplement.create?.length).toEqual(1);
    expect(newCtx.resourcesUpdates.Supplement.update?.length).toEqual(0);
  });

  test("initial ctx was not mutated", () => {
    expect(ctx.resourcesUpdates.File.update?.length).toEqual(0);
    expect(ctx.resourcesUpdates.Supplement.update?.length).toEqual(0);
  });
});

describe("deleteResourceOnContext", () => {
  // SETUP
  const upsolveWizardModelsMap: TSpellModelOptionsMap = {
    File: { loader: { withGraph: "[]" } },
    Supplement: { loader: { withGraph: "[files]" } },
  };
  const fileId = 789;
  const supplementId = createLocalId();
  const ctx = upsertResourceOnContext(prepMachineContextWithResources(upsolveWizardModelsMap, {}), [
    {
      modelName: "Supplement",
      id: supplementId,
    },
    {
      modelName: "File",
      id: fileId,
      props: {
        awsStorageKey: "1/456/cake.pdf",
        createdAt: new Date(),
        name: "cake.pdf",
        supplementId: undefined,
        thumbnailUrl: "https://example.com/assets/1/123/cake-640.pdf",
        url: "https://example.com/assets/1/123/cake.pdf",
      },
    },
  ]);

  // TEST
  test("do not add delete to resourcesUpdates if a local resource", () => {
    const newCtx = deleteResourceOnContext(ctx, {
      modelName: "Supplement",
      id: supplementId,
    });
    expect(newCtx.resources.Supplement[supplementId]).toBeUndefined();
    expect(newCtx.resourcesUpdates.Supplement.create?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.Supplement.update?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.Supplement.delete?.length).toEqual(0);
  });

  test("add delete to resourcesUpdates", () => {
    const newCtx = deleteResourceOnContext(ctx, {
      modelName: "File",
      id: fileId,
    });
    expect(newCtx.resources.File[fileId]).toBeUndefined();
    expect(newCtx.resourcesUpdates.File.create?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.File.update?.length).toEqual(0);
    expect(newCtx.resourcesUpdates.File.delete?.length).toEqual(1);
  });

  test("initial ctx was not mutated", () => {
    expect(ctx.resources.Supplement[supplementId]).not.toBeUndefined();
    expect(ctx.resources.File[fileId]).not.toBeUndefined();
  });
});
