import { createLocalId } from "../../../models/idHelpers";
import { validationKeyForNode } from "../validationKeyForNode";

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

describe("validationKeyForNode", () => {
  // --- direct access
  test("node.assign", () => {
    expect(
      validationKeyForNode(
        {
          type: "input",
          inputType: "number",
          assign: "states.num",
        },
        { ctx: context, functions }
      )
    ).toBe(`states.num`);
  });
  // --- accepting a resource id or computing it off of the contentTree
  test("node.assign.modelName && node.assign.id - (value)", () => {
    // test with and without a assign path
    ["", "name"].forEach((path) => {
      expect(
        validationKeyForNode(
          {
            type: "input",
            inputType: "text",
            assign: { modelName: "Thing", id: testResourceIdTwo, path },
          },
          { ctx: context, functions }
        )
      ).toBe(`resources.Thing[${testResourceIdTwo}]${path ? `.${path}` : ""}`);
    });
  });
  test("node.assign.modelName && node.assign.id - (json-logic)", () => {
    // test with and without a assign path
    ["", "name"].forEach((path) => {
      expect(
        validationKeyForNode(
          {
            type: "input",
            inputType: "text",
            assign: { modelName: "Thing", id: { var: ["content.node.id"] }, path },
            contentTree: {
              node: {
                id: testResourceIdTwo,
                name: "Thingy",
                value: 0,
                isApproved: true,
                age: undefined,
                node: undefined,
              },
            },
          },
          { ctx: context, functions }
        )
      ).toBe(`resources.Thing[${testResourceIdTwo}]${path ? `.${path}` : ""}`);
    });
  });
  test.todo("node.assign.path && node.assign.value");
  test.todo("validationKey");
});
