// @ts-check
import { withNextDevtools } from "@next-devtools/core/plugin";
import withMDX from "@next/mdx";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Only import env validation if not skipped
if (!process.env.SKIP_ENV_VALIDATION) {
  await import("./src/env.mjs");
  await import("@saasfly/auth/env.mjs");
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@saasfly/api",
    "@saasfly/auth",
    "@saasfly/db",
    "@saasfly/stripe",
    "@saasfly/ui",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    /** 
     * This is required to work with Docker containers.
     */
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default withNextDevtools(withMDX()(config));
