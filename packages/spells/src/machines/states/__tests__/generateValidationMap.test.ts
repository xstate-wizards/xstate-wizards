import { createLocalId } from "../../../models/idHelpers";
import { generateValidationMap, isEveryInputValid } from "../generateValidationMap";

// SAMPLE DATA
const testResourceIdOne = createLocalId();
const testResourceIdTwo = createLocalId();
const context = {
  states: { num: -1, bool: true, inputTest: null },
  resources: {
    Thing: {
      [testResourceIdOne]: { id: testResourceIdOne, name: null, value: 100, isApproved: false, age: undefined },
      [testResourceIdTwo]: { id: testResourceIdTwo, name: "Thingy", value: 0, isApproved: true, age: undefined },
    },
  },
};
const functions = {};

// CONTENT
const contentResourceEditor = [
  {
    type: "input",
    inputType: "number",
    assign: "states.num",
    validations: ["required", "isInteger", "zeroOrGreaterNumber"],
  },
  {
    type: "forEach",
    items: {
      "Object.values": [
        {
          var: ["context.resources.Thing"],
        },
      ],
    },
    content: [
      {
        type: "row",
        content: [
          {
            type: "input",
            inputType: "text",
            assign: {
              modelName: "Thing",
              id: {
                var: ["content.node.id"],
              },
              path: "name",
            },
            validations: ["required", "stringLength#6"],
          },
          {
            type: "resourceEditor",
            config: {
              modelName: "Thing",
              resourceId: {
                var: ["content.node.id"],
              },
              resourceDefaults: {},
            },
            content: [
              {
                type: "row",
                content: [
                  {
                    type: "input",
                    inputType: "age",
                    assign: { path: "age" },
                    validations: ["required"],
                  },
                  {
                    type: "input",
                    inputType: "number",
                    assign: { path: "value" },
                    validations: ["required", "zeroOrGreaterNumber"],
                  },
                  {
                    type: "input",
                    inputType: "checkbox",
                    assign: { path: "isApproved" },
                    validations: ["required", "isChecked"],
                  },
                  // TODO: { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
const contentResourceEditorFunctional = [
  {
    type: "input",
    inputType: "number",
    assign: "states.num",
    validations: ["required", "isInteger", "zeroOrGreaterNumber"],
  },
  {
    type: "forEach",
    items: (ctx) => Object.values(ctx.resources.Thing),
    content: (ctx, item) => [
      {
        type: "row",
        content: [
          {
            type: "input",
            inputType: "text",
            assign: { modelName: "Thing", id: item.id, path: "name" },
            validations: ["required", "stringLength#6"],
          },
          {
            type: "resourceEditor",
            config: {
              modelName: "Thing",
              resourceId: item.id,
              resourceDefaults: {},
            },
            content: [
              {
                type: "row",
                content: [
                  {
                    type: "input",
                    inputType: "age",
                    assign: { path: "age" },
                    validations: ["required"],
                  },
                  {
                    type: "input",
                    inputType: "number",
                    assign: { path: "value" },
                    validations: ["required", "zeroOrGreaterNumber"],
                  },
                  {
                    type: "input",
                    inputType: "checkbox",
                    assign: { path: "isApproved" },
                    validations: ["required", "isChecked"],
                  },
                  // TODO: { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe("generateValidationMap", () => {
  [
    ["contentResourceEditor", contentResourceEditor],
    ["contentResourceEditorFunctional", contentResourceEditorFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      // --- generate
      const vm = generateValidationMap({
        contentNodes,
        meta: {},
        state: { context },
        serializations: { functions },
      });
      // --- expect state
      expect(vm[`states.num`]).toStrictEqual({ dirty: false, validationError: "Must be 0 or higher." });
      // --- expect resource 1
      expect(vm[`resources.Thing[${testResourceIdOne}].name`]).toStrictEqual({
        dirty: false,
        validationError: "You need to fill this in.",
      });
      expect(vm[`resources.Thing[${testResourceIdOne}].age`]).toStrictEqual({
        dirty: false,
        validationError: "You need to fill this in.",
      });
      expect(vm[`resources.Thing[${testResourceIdOne}].value`]).toStrictEqual({ dirty: false, validationError: null });
      expect(vm[`resources.Thing[${testResourceIdOne}].isApproved`]).toStrictEqual({
        dirty: false,
        validationError: "Must be checked.",
      });
      // --- expect resource 2
      expect(vm[`resources.Thing[${testResourceIdTwo}].name`]).toStrictEqual({ dirty: false, validationError: null });
      expect(vm[`resources.Thing[${testResourceIdTwo}].age`]).toStrictEqual({
        dirty: false,
        validationError: "You need to fill this in.",
      });
      expect(vm[`resources.Thing[${testResourceIdTwo}].value`]).toStrictEqual({ dirty: false, validationError: null });
      expect(vm[`resources.Thing[${testResourceIdTwo}].isApproved`]).toStrictEqual({
        dirty: false,
        validationError: null,
      });
    });
  });
});

describe("isEveryInputValid", () => {
  [
    ["contentResourceEditor", contentResourceEditor],
    ["contentResourceEditorFunctional", contentResourceEditorFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      // --- generate
      const vm = generateValidationMap({
        contentNodes,
        meta: {},
        state: { context },
        serializations: { functions },
      });
      // --- expect
      expect(isEveryInputValid(vm)).toBe(false);
    });
  });
});
