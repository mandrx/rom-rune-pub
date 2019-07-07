/* config-overrides.js */

const { override, fixBabelImports, addLessLoader } = require("customize-cra");

/*
module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: "worker-loader" }
  });
  return config;
};
*/

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "primary-color": "#dc4478",
      "link-color": "#e91e63",
      "processing-color": "#e91e63"
    }
  })
);
