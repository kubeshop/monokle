const CracoAlias = require('craco-alias');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {add: [new MonacoWebpackPlugin({languages: ['yaml'], globalAPI: true})]},
    configure: (webpackConfig, {env, paths}) => {
      webpackConfig.node.__dirname = false;
      webpackConfig.target = 'electron-renderer';
      return webpackConfig;
    },
  },

  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './',
        tsConfigPath: './paths.json',
        unsafeAllowModulesOutsideOfSrc: false,
        debug: false,
      },
    },
  ],
};
