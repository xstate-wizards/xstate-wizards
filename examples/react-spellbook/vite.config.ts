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
      "@xstate-wizards/spellbook": path.join(packages, "spellbook/src"),
      "@xstate-wizards/wizards-of-react": path.join(packages, "wizards-of-react/src"),
      "@xstate-wizards/crystal-ball": path.join(packages, "crystal-ball/src"),
      "tel-fns": path.join(packages, "tel-fns/src"),
      // Force all packages to share a single copy of these libraries
      "xstate": path.join(packages, "spells/node_modules/xstate"),
      "@xstate/react": path.join(packages, "wizards-of-react/node_modules/@xstate/react"),
    },
  },
});
