import { evalJsonLogic } from "../functions/evalJsonLogic";

const eachRecursive = (obj) => {
  for (var k in obj) {
    // IF seeing assignmentSerialization, remap assignment
    if (k === "assignmentSerialization") {
      obj.assignment = {
        [obj.assignmentSerialization.assignKey]: (context, event) =>
          evalJsonLogic(obj.assignmentSerialization.jsonLogic, { context, event }),
      };
      // IF another obj, continue the dive
    } else if (typeof obj[k] == "object" && obj[k] !== null) {
      eachRecursive(obj[k]);
    }
  }
  return obj;
};

// This is a helper method to process serialized transition configs
// 1. assign actions have their "assignment" property serialized 'asassignmentSerialization'
// 2... none yet
export const deserializeTransitions = (transitionsObj) => {
  return eachRecursive(transitionsObj);
};
