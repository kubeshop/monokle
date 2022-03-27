const CracoAlias = require('craco-alias');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CracoLessPlugin = require('craco-less');
const {getThemeVariables} = require('antd/dist/theme');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [new MonacoWebpackPlugin({languages: ['yaml'], globalAPI: true})],
    configure: webpackConfig => {
      webpackConfig.node = {__dirname: false};
      webpackConfig.target = 'electron-renderer';
      webpackConfig.optimization = {
        moduleIds: 'deterministic',
        minimize: false,
      };
      webpackConfig.output = {
        filename: 'bundle.[name].js',
      };
      // Temporary solution until react-scripts 5.0.1 is released
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];
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
            modifyVars: getThemeVariables({
              dark: true,
            }),
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
