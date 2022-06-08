import { TWizardModelsMap } from "@upsolve/wizards";
import { getUser } from "../models/user";

export const wizardModelMap: TWizardModelsMap = {
  Hobby: {
    modelName: "Hobby",
    schema: {},
    loader: async () => [],
  },
  Pet: {
    modelName: "Pet",
    schema: {},
    loader: async () => [],
  },
  User: {
    modelName: "User",
    schema: {},
    // loader: async () => getUser(),
    loader: async (options) =>
      new Promise((resolve) =>
        // Mocking an async data fetch for user data
        getUser().then((user) => {
          if (user) {
            setTimeout(() => resolve([user]), options?.loader?.arbitraryParamForWaiting);
          } else {
            return resolve([]);
          }
        })
      ),
  },
};
