import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dev mode: resolves workspace packages to their TypeScript source
const packages = path.resolve(__dirname, "../../packages");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@xstate-wizards/spells": path.join(packages, "spells/src"),
      "@xstate-wizards/wizards-of-react": path.join(packages, "wizards-of-react/src"),
      "tel-fns": path.join(packages, "tel-fns/src"),
    },
  },
});
