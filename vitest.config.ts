import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/spells/src/**/__tests__/**/*.test.ts"],
    globals: true,
  },
});
