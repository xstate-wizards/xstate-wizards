import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Preview mode: uses built dist output from installed packages
// (requires `npm run build` first)
export default defineConfig({
  plugins: [react()],
});
