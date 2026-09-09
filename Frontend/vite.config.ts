import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

function buildTimeImageOptimizer() {
  return {
    name: "alsorouh-image-optimizer",
    apply: "build" as const,
    async buildStart() {
      try {
        const { optimizeImages } =
          await import("./scripts/optimize-images.mjs");
        await optimizeImages();
      } catch (error) {
        this.warn(`image optimization skipped: ${(error as Error).message}`);
      }
    },
  };
}

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    buildTimeImageOptimizer(),
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    {
      name: "force-exit-after-build",
      apply: "build",
      closeBundle() {
        setTimeout(() => process.exit(0), 0);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.csv"],
});
