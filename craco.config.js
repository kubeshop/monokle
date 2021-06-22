const CracoAlias = require("craco-alias");

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        baseUrl: "./",
        tsConfigPath: "./paths.json",
        unsafeAllowModulesOutsideOfSrc: false,
        debug: false
      }
    }
  ]
};
