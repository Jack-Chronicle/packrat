// esbuild.config.mjs
import { build, context } from "esbuild";

const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  platform: "node",
  format: "cjs",
  target: "es2020",
  external: ["obsidian"],
  sourcemap: false,
  minify: false,
};

if (process.argv.includes('--watch')) {
  // Use new esbuild context API for watch mode
  const ctx = await context(options);
  await ctx.watch();
  console.log("Watching for changes...");
  // Prevent script from exiting
  process.stdin.resume();
} else {
  // Regular one-off build
  await build(options);
  console.log("Build finished.");
}
