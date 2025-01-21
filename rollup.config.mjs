export default {
  input: "./module/ptr-slot.mjs",
  output: {
    file: "./public/ptr-slot.mjs",
    format: "esm",
  },
  external: ["/scripts/greensock/esm/all.js"],
};
