import { createLocalId } from "../../../models/idHelpers";
import { countContentNodes, flattenContentNodes } from "../flattenContentNodes";

// SAMPLE DATA
const testResourceIdOne = createLocalId();
const testResourceIdTwo = createLocalId();
const context = {
  states: { num: 2, bool: true, inputTest: null },
  arrayOfData: [1, 2, 3],
  resources: {
    Thing: {
      [testResourceIdOne]: { id: testResourceIdOne },
      [testResourceIdTwo]: { id: testResourceIdTwo },
    },
  },
};
const functions = {};

// CONTENT NODES
const contentSimple = [
  { type: "p", text: "paragraph" },
  { type: "input", inputType: "text", label: "ok", assign: "states.inputTest" },
];
const contentSimpleFunctional = [
  { type: "p", text: "paragraph" },
  { type: "input", inputType: "text", label: "ok", assign: "states.inputTest" },
];
const contentForEach = [
  {
    type: "forEach",
    items: {
      var: ["context.arrayOfData"],
    },
    content: [{ type: "p", text: `Data: <<<JSON_LOGIC('{"var":["content.node"]}')>>>` }],
  },
];
const contentForEachFunctional = [
  {
    type: "forEach",
    items: (ctx) => ctx.arrayOfData,
    content: () => [{ type: "p", text: `Data: <<<JSON_LOGIC('{"var":["content.node"]}')>>>` }],
  },
];
const contentConditional = [
  {
    type: "conditional",
    conditional: {
      "<": [{ var: ["context.states.num"] }, 0],
    },
    options: {
      true: [{ type: "h1", text: `Title!` }],
      false: [{ type: "p", text: "Paragraph!" }],
    },
  },
];
const contentConditionalFunctional = [
  {
    type: "conditional",
    conditional: (ctx) => ctx.states.num < 0,
    options: {
      true: [{ type: "h1", text: `Title!` }],
      false: [{ type: "p", text: "Paragraph!" }],
    },
  },
];
const contentResourceEditor = [
  { type: "h4", text: `Resource Editor` },
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
      { type: "small", text: `ID: <<<JSON_LOGIC('{"var":["content.node.id"]}')>>>` },
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
                inputType: "text",
                label: "Name",
                assign: { path: "name" },
                validations: ["required"],
              },
              // TODO: { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
            ],
          },
        ],
      },
    ],
  },
];
const contentResourceEditorFunctional = [
  { type: "h4", text: `Resource Editor` },
  {
    type: "forEach",
    items: (ctx) => Object.values(ctx?.resources?.Thing),
    content: (ctx, item) => [
      { type: "small", text: `ID: <<<JSON_LOGIC('{"var":["content.node.id"]}')>>>` },
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
                inputType: "text",
                label: "Name",
                assign: { path: "name" },
                validations: ["required"],
              },
              // TODO: { type: "button", text: "Delete", event: { type: "DELETE_PET", data: { id: item.id } } },
            ],
          },
        ],
      },
    ],
  },
];

describe("flattenContentNodes", () => {
  // --- simple
  [
    ["contentSimple", contentSimple],
    ["contentSimpleFunctional", contentSimpleFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      const flattenedNodes = flattenContentNodes({ contentNodes, context, functions });
      expect(flattenedNodes.length).toBe(2);
    });
  });
  // --- for each
  [
    ["contentForEach", contentForEach],
    ["contentForEachFunctional", contentForEachFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      const flattenedNodes = flattenContentNodes({ contentNodes, context, functions });
      expect(flattenedNodes.length).toBe(4);
      expect(flattenedNodes.filter((n) => n.type === "p").length).toBe(3);
    });
  });
  // --- conditionals
  [
    ["contentConditional", contentConditional],
    ["contentConditionalFunctional", contentConditionalFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      const flattenedNodes = flattenContentNodes({ contentNodes: contentConditional, context, functions });
      expect(flattenedNodes.length).toBe(2);
      expect(flattenedNodes[0].type).toBe("conditional");
      expect(flattenedNodes[1].type).toBe("p");
    });
  });
  // --- resource editors
  [
    ["contentResourceEditor", contentResourceEditor],
    ["contentResourceEditorFunctional", contentResourceEditorFunctional],
  ].forEach(([tName, contentNodes]: any) => {
    test(tName, () => {
      const flattenedNodes = flattenContentNodes({ contentNodes, context, functions });
      // length
      expect(flattenedNodes.length).toBe(12);
      // titles
      expect(flattenedNodes.find((n) => n.type === "h4").text).toBe("Resource Editor");
      // text contentTree
      expect(flattenedNodes[2].contentTree.node.id).toBe(testResourceIdOne);
      expect(flattenedNodes[3].contentTree.node.id).toBe(testResourceIdOne);
      expect(flattenedNodes[4].contentTree.node.id).toBe(testResourceIdTwo);
      expect(flattenedNodes[5].contentTree.node.id).toBe(testResourceIdTwo);
      // resourceEditor config
      expect(flattenedNodes[3].config.modelName).toBe("Thing");
      expect(flattenedNodes[5].config.modelName).toBe("Thing");
      if (tName === "contentResourceEditor") {
        expect(flattenedNodes[3].config.resourceId).toStrictEqual({ var: ["content.node.id"] });
        expect(flattenedNodes[5].config.resourceId).toStrictEqual({ var: ["content.node.id"] });
      } else {
        expect(flattenedNodes[3].config.resourceId).toBe(testResourceIdOne);
        expect(flattenedNodes[5].config.resourceId).toBe(testResourceIdTwo);
      }
      // input (assigns)
      expect(flattenedNodes[7].assign.path).toBe("name");
      expect(flattenedNodes[7].assign.id).toBe(testResourceIdOne);
      expect(flattenedNodes[9].assign.path).toBe("name");
      expect(flattenedNodes[9].assign.id).toBe(testResourceIdTwo);
      // TODO: button event/assign
    });
  });
});

describe("countContentNodes", () => {
  test("contentSimple", () => {
    const flattenedNodes = flattenContentNodes({ contentNodes: contentSimple, context, functions });
    expect(countContentNodes({ contentNodes: flattenedNodes, context, functions })).toBe(2);
  });
  test("contentConditional", () => {
    const flattenedNodes = flattenContentNodes({ contentNodes: contentConditional, context, functions });
    expect(countContentNodes({ contentNodes: flattenedNodes, context, functions })).toBe(3);
  });
  test("contentResourceEditor", () => {
    const flattenedNodes = flattenContentNodes({ contentNodes: contentResourceEditor, context, functions });
    expect(countContentNodes({ contentNodes: flattenedNodes, context, functions })).toBe(30);
  });
});
