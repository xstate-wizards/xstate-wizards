import { TMachineModelLoaders } from "@upsolve/wizards";
import { getUser } from "../models/user";

export const wizardModelLoaders: TMachineModelLoaders = {
  Hobby: () => ({
    modelName: "Hobby",
    loader: async () => [],
  }),
  Pet: () => ({
    modelName: "Pet",
    loader: async () => [],
  }),
  User: (options) => ({
    modelName: "User",
    // loader: async () => getUser(),
    loader: async () =>
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
  }),
};
