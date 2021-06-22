const CracoAlias = require('craco-alias');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {

  webpack: {
    plugins: {
      add: [new MonacoWebpackPlugin({
        languages: ['yaml'],
      })],
    },
    // eslint-disable-next-line no-unused-vars
    configure: (webpackConfig, { env, paths }) => {
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
      }
    }
  ]
};
