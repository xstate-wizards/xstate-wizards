type TLocalUserModel = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
};

// In memory data storage for showing saving/fetching examples with wizards
const localUser: TLocalUserModel = {
  id: undefined,
  firstName: undefined,
  lastName: undefined,
};
export const getUser = async () => (localUser?.id ? localUser : null);
export const putUser = async ({ firstName, id, lastName }: TLocalUserModel) => {
  localUser.id = id;
  localUser.firstName = firstName;
  localUser.lastName = lastName;
};

// Simple grabber for users. An example can be more complex
export const selectUser = (ctx) => {
  console.log("selectUser", ctx);
  return Object.values(ctx.resources?.User ?? {})?.[0];
};
