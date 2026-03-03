import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Resolve workspace packages to their TypeScript source for Vite
// (avoids CJS/ESM mismatch with compiled dist output)
const packages = path.resolve(__dirname, "../../packages");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@xstate-wizards/spells": path.join(packages, "spells/src"),
      "@xstate-wizards/wizards-of-react": path.join(packages, "wizards-of-react/src"),
      "@xstate-wizards/crystal-ball": path.join(packages, "crystal-ball/src"),
      "tel-fns": path.join(packages, "tel-fns/src"),
    },
  },
});
