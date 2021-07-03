const CracoAlias = require('craco-alias');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CracoLessPlugin = require("craco-less");

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
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1a9aff',
              '@heading-color': 'fade(@white, 85%)',
              '@body-background': '#000',
              '@component-background': '#000',
              '@text-color': 'fade(@white, 85%)',
              '@disabled-color': 'fade(#fff, 25%)',
              '@background-color-base': '#262626'
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
