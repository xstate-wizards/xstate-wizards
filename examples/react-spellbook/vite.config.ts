import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dev mode: resolves workspace packages to their TypeScript source
// (hot reload on package changes, no build step needed)
const packages = path.resolve(__dirname, "../../packages");
const rootNodeModules = path.resolve(__dirname, "../../node_modules");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@xstate-wizards/spells": path.join(packages, "spells/src"),
      "@xstate-wizards/spellbook": path.join(packages, "spellbook/src"),
      "@xstate-wizards/wizards-of-react": path.join(packages, "wizards-of-react/src"),
      "@xstate-wizards/crystal-ball": path.join(packages, "crystal-ball/src"),
      "tel-fns": path.join(packages, "tel-fns/src"),
      // Force all packages to share a single copy of these libraries (hoisted to root)
      "xstate": path.join(rootNodeModules, "xstate"),
      "@xstate/react": path.join(rootNodeModules, "@xstate/react"),
    },
  },
});
