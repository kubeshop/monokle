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
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
const PUBLIC = path.join(__dirname, 'public');

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
      webpackConfig.output = {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].[chunkhash:8].js',
        chunkFilename: '[id].[chunkhash:8].js',
      };
      webpackConfig.resolve = {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        plugins: [
          new TsconfigPathsPlugin({
            configFile: path.resolve(__dirname, 'tsconfig.renderer.json'),
          }),
        ],
        fallback: {
          ...webpackConfig.resolve.fallback,
          fs: false,
        },
      };
      // Temporary solution until react-scripts 5.0.1 is released
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];
      webpackConfig.plugins = [
        ...optionalPlugins,
        isDevelopment && new ReactRefreshWebpackPlugin(),
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: path.join(__dirname, 'public', 'index.html'),
          favicon: path.join(__dirname, 'public', 'icon.ico'),
        }),
        new MiniCssExtractPlugin(),
        new InterpolateHtmlPlugin({
          PUBLIC_URL: '',
        }),
      ].filter(Boolean);
      webpackConfig.module.rules = [
        {
          test: /\.html$/,
          loader: 'html-loader',
        },
        {
          test: /\.m?js/,
          type: 'javascript/auto',
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.json$/,
          type: 'json',
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
          exclude: /node_modules/,
          use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
        },
      ];
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
