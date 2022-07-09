import uuidv4 from "uuid";

export const isIdLocal = (id: string | number) => {
  return typeof id === "string" && id.includes("local-");
};

export const createLocalId = () => {
  // @ts-ignore
  return `local-${uuidv4()}`;
};
