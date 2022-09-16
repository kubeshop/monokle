const CracoAlias = require('craco-alias');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CracoLessPlugin = require('craco-less');
const {getThemeVariables} = require('antd/dist/theme');
const lodash = require('lodash');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const {IgnorePlugin} = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
const PUBLIC = path.join(__dirname, 'public');
const SRC = path.join(__dirname, 'src');

const optionalPlugins = [];
if (process.platform !== 'darwin') {
  optionalPlugins.push(new IgnorePlugin({resourceRegExp: /^fsevents$/}));
}

module.exports = {
  webpack: {
    plugins: [new MonacoWebpackPlugin({languages: ['yaml'], globalAPI: true})],
    configure: webpackConfig => {
      webpackConfig.node = {__dirname: false};
      webpackConfig.mode = 'development';
      webpackConfig.target = 'electron-renderer';
      webpackConfig.optimization = {
        moduleIds: 'deterministic',
        minimize: false,
      };
      webpackConfig.entry = {
        reactRefreshSetup: '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js',
        main: path.join(SRC, 'index.tsx'),
      };
      webpackConfig.output = {
        filename: 'bundle.[name].js',
        path: path.resolve(__dirname, 'build'),
      };
      webpackConfig.resolve = {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        plugins: [
          new TsconfigPathsPlugin({
            configFile: path.resolve(__dirname, 'tsconfig.renderer.json'),
          }),
        ],
      };
      // Temporary solution until react-scripts 5.0.1 is released
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];
      webpackConfig.plugins = [
        ...optionalPlugins,
        new HtmlWebpackPlugin({filename: './index.html', template: path.join(PUBLIC, 'index.html')}),
        isDevelopment && new ReactRefreshWebpackPlugin(),
      ].filter(Boolean);
      return webpackConfig;
    },
  },
  babel: {
    presets: [],
    plugins: [
      process.env.NODE_ENV === 'development'
        ? ['babel-plugin-styled-components', {displayName: true, namespace: 'dev'}]
        : [{}],
    ],
  },
  jest: {
    configure: jestConfig =>
      lodash.merge(jestConfig, {
        setupFilesAfterEnv: ['<rootDir>/jest.env.js'],
        transform: {
          // https://github.com/gsoft-inc/craco/issues/353#issuecomment-1003301013
          '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': './lib/jest-babel-transform.js',
        },
      }),
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
