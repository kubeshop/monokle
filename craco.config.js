const {CracoAliasPlugin} = require('react-app-alias-ex');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CracoLessPlugin = require('craco-less');
const {getThemeVariables} = require('antd/dist/theme');
const lodash = require('lodash');
const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

const additionalWebpackPlugins = isDevelopment
  ? []
  : [
      new SentryWebpackPlugin({
        org: 'kubeshop',
        project: 'monokle-desktop',
        include: './build',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
    ];

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MonacoWebpackPlugin({
          languages: ['yaml'],
          globalAPI: true,
          customLanguages: [
            {
              label: 'yaml',
              entry: 'monaco-yaml',
              worker: {
                id: 'monaco-yaml/yamlWorker',
                entry: 'monaco-yaml/yaml.worker',
              },
            },
          ],
        }),
        ...additionalWebpackPlugins,
      ],
    },
    devtool: 'source-map',
    configure: webpackConfig => {
      webpackConfig.node = {__dirname: false};
      webpackConfig.target = 'electron-renderer';
      webpackConfig.optimization = {
        moduleIds: 'deterministic',
        minimize: false,
      };
      webpackConfig.output = {
        filename: 'bundle.[name].js',
        path: path.resolve(__dirname, 'build'),
      };
      webpackConfig.externals = {
        "fsevents": "require('fsevents')"
      };
      // Temporary solution until react-scripts 5.0.1 is released
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];
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
      plugin: CracoAliasPlugin,
      options: {},
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
