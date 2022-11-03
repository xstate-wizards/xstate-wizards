export type TLocalPetModel = {
  id: string | number;
  type?: string;
  name?: string;
  isFavorite?: boolean;
};

export const PET_TYPES = ["cat", "dog", "hawk", "plant"];

// In memory data storage for showing saving/fetching examples with wizards
let localPets: TLocalPetModel[] = [];

export const getPets = async () => localPets;
export const postPet = async (newPet: TLocalPetModel) => {
  localPets.push(newPet);
};
export const putPet = async (updatedPet: TLocalPetModel) => {
  localPets = localPets.map((p) => (p.id === updatedPet.id ? updatedPet : p));
};
export const deletePet = async (petId: TLocalPetModel) => {
  localPets = localPets.filter((p) => p.id !== petId);
};

// Simple grabber for Pets. An example can be more complex
export const selectPets = (ctx) => Object.values(ctx.resources?.Pet ?? {});
export const removePet = (ctx) => Object.values(ctx.resources?.Pet ?? {});
