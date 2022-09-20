const {alias, aliasJest, configPaths} = require('react-app-rewire-alias');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const {IgnorePlugin} = require('webpack');
const {override, fixBabelImports} = require('customize-cra');
const addLessLoader = require('customize-cra-less-loader');
const {getThemeVariables} = require('antd/dist/theme');

const aliasMap = configPaths('./paths.json');

const PUBLIC = path.join(__dirname, 'public');

const optionalPlugins = [];
if (process.platform !== 'darwin') {
  optionalPlugins.push(new IgnorePlugin({resourceRegExp: /^fsevents$/}));
}

module.exports = alias(aliasMap);
module.exports.jest = aliasJest(aliasMap);

const webpackCustomOverrides = (config, env) => {
  const isDevelopment = env !== 'production';

  config.node = {__dirname: false};
  config.mode = 'development';
  config.target = 'electron-renderer';
  config.output = {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[chunkhash:8].js',
    publicPath: '/',
  };
  config.resolve = {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.renderer.json'),
      }),
    ],
    fallback: {
      ...config.resolve.fallback,
      fs: false,
    },
  };
  // Temporary solution until react-scripts 5.0.1 is released
  config.ignoreWarnings = [/Failed to parse source map/];
  config.plugins = [
    ...optionalPlugins,
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PUBLIC, 'index.html'),
      publicPath: '',
    }),
    new InterpolateHtmlPlugin({
      PUBLIC_URL: '',
    }),
  ].filter(Boolean);
  config.module.rules = [
    ...config.module.rules,
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
    // {
    //   test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
    //   exclude: /node_modules/,
    //   use: ['file-loader?name=[name].[ext]'],
    // },
    {
      test: /\.less$/,
      use: [
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
              modifyVars: getThemeVariables({
                dark: true,
              }),
            },
          },
        },
      ],
    },
  ];
  return config;
};

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader(),
  webpackCustomOverrides,
  
);
