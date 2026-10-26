import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@myrehat-task-b/api": path.resolve(
        import.meta.dirname,
        "./packages/api/src",
      ),
      "@myrehat-task-b/db": path.resolve(
        import.meta.dirname,
        "./packages/db/src",
      ),
      "@myrehat-task-b/auth": path.resolve(
        import.meta.dirname,
        "./packages/auth/src",
      ),
    },
  },
});
