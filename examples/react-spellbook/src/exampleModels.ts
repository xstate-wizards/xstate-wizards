import { TWizardModelsMap } from "@xstate-wizards/spells";

export const exampleModels: TWizardModelsMap = {
  CaseImmigration: {
    modelName: "CaseImmigration",
    schema: {
      type: "object",
      properties: {
        type: { type: "string" },
        language: { type: "string" },
        createdAt: {
          type: "string",
          format: "date",
        },
        updatedAt: {
          type: "string",
          format: "date",
        },
        applicant: { $ref: "Party" },
        partys: {
          type: "array",
          items: {
            $ref: "Party",
          },
        },
      },
    }, // TODO
    loader: (options) => {
      return new Promise((resolve) => {
        resolve([
          { id: 3, createdAt: new Date() },
          { id: 6, createdAt: new Date() },
        ]);
      });
    },
  },
  Party: {
    modelName: "Party",
    schema: {
      type: "object",
      properties: {
        id: { type: ["integer", "null"] },
        caseId: { type: ["integer"] },
        type: { type: ["string", "null"] },
        name: { type: ["string", "null"] },
        firstName: { type: ["string", "null"] },
        lastName: { type: ["string", "null"] },
        middleName: { type: ["string", "null"] },
        maritalStatus: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        gender: { type: ["string", "null"] },
        age: { type: ["number", "null"] },
        relationship: { type: ["string", "null"] },
        livesWithDebtor: { type: ["boolean", "null"] },
        addressId: { type: ["integer", "null"] },
        createdAt: { type: ["string", "null"], format: "date-time" },
        updatedAt: { type: ["string", "null"], format: "date-time" },
      },
    },
    loader: (options) => {
      return new Promise((resolve) => {
        resolve([]);
      });
    },
  },
  Supplement: {
    modelName: "Supplement",
    schema: {
      type: "object",
      properties: {
        type: { type: ["string"], enum: ["payStub", "taxReturn", "driversLicense"] },
        year: { type: ["integer", "null"], minimum: 1900, maximum: 2100 },
        missing: { type: ["boolean", "null"] },
        missingReason: { type: ["string", "null"] },
        missingReasonExplanation: { type: ["string", "null"] },
        createdAt: { type: ["string"], format: "date-time" },
        updatedAt: { type: ["string", "null"], format: "date-time" },
      },
    },
    loader: (options) => {
      return new Promise((resolve) => {
        resolve([]);
      });
    },
  },
};
