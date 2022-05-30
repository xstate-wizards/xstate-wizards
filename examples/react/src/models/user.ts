import { createLocalId } from "@upsolve/wizards";

type TLocalUserModel = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  password?: string;
};

// In memory data storage for showing saving/fetching examples with wizards
const localUser: TLocalUserModel = {
  // id: createLocalId(),
  // firstName: "m",
  // lastName: "h",
  id: undefined,
  firstName: undefined,
  lastName: undefined,
  password: undefined,
};
export const getUser = async () => (localUser?.id ? localUser : null);
export const putUser = async ({ firstName, id, lastName, password }: TLocalUserModel) => {
  localUser.id = id;
  localUser.firstName = firstName;
  localUser.lastName = lastName;
  localUser.password = password;
};

// Simple grabber for users. An example can be more complex
export const selectUser = (ctx) => {
  return Object.values(ctx.resources?.User ?? {})?.[0];
};
