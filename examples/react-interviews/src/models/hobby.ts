type TLocalHobbyModel = {
  id?: string;
  description?: string;
  startedAt?: string;
};

// In memory data storage for showing saving/fetching examples with wizards
let localHobbies: TLocalHobbyModel[] = [];

export const getHobbies = async () => localHobbies;
export const postHobby = async (newHobby: TLocalHobbyModel) => {
  localHobbies.push(newHobby);
};
export const putHobby = async (updatedHobby: TLocalHobbyModel) => {
  localHobbies = localHobbies.map((p) => (p.id === updatedHobby.id ? updatedHobby : p));
};
export const deleteHobby = async (hobbyId: TLocalHobbyModel) => {
  localHobbies = localHobbies.filter((p) => p.id !== hobbyId);
};

// Simple grabber for Hobbies. An example can be more complex
export const selectHobbies = (ctx) => Object.values(ctx.resources?.Hobby ?? {});
export const removeHobby = (ctx) => Object.values(ctx.resources?.Hobby ?? {});
