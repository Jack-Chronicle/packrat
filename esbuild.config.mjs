// esbuild.config.mjs
// This configuration builds an Obsidian plugin using esbuild.
// Output is main.js in the project root, as required by Obsidian plugin guidelines.

import { build, context } from "esbuild";

const options = {
  entryPoints: ["src/main.ts"], // Main plugin entry point
  bundle: true,                 // Bundle all dependencies
  outfile: "main.js",           // Output file in root directory
  platform: "node",             // Node.js platform for Obsidian
  format: "cjs",                // CommonJS module format
  target: "es2020",             // Target ECMAScript version
  external: ["obsidian"],       // Don't bundle Obsidian API
  sourcemap: true,              // Generate source maps for debugging
  minify: false,                // No minification by default
};

if (process.argv.includes('--watch')) {
  // Watch mode: rebuild on file changes
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching for changes...");
  // Prevent script from exiting
  process.stdin.resume();
} else {
  // One-off build
  await build(options);
  console.log("Build finished.");
}
