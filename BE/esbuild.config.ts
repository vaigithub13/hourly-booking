"use strict";

const esbuild = require("esbuild");
const { nodeExternalsPlugin } = require("esbuild-node-externals");
const tsPaths = require("esbuild-ts-paths");

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    minify: true,
    platform: "node",
    sourcemap: true,
    target: "node16",
    plugins: [nodeExternalsPlugin(), tsPaths()],
  })
  .catch(() => process.exit(1));
