/**
 * take all main scripts and add configuration for compiling each in isolation
 */
const typescript = require("rollup-plugin-typescript2");
const glob = require("glob");

const rollupConfigs = glob.sync("src/scripts/**/*.ts").map((entry) => ({
  input: `${entry}`,
  output: {
    file: `dist/${entry.replace(/\.ts$/, ".js").replace("src\\", "")}`,
    format: "cjs",
    exports: "none",
  },
  plugins: [typescript({ tsconfig: "tsconfig.json" })],
}));

console.log(JSON.stringify({ rollupConfigs }));

module.exports = rollupConfigs;
