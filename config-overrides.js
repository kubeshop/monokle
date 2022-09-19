const {alias, aliasJest, configPaths} = require('react-app-rewire-alias');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const {IgnorePlugin} = require('webpack');

const aliasMap = configPaths('./paths.json');

const isDevelopment = process.env.NODE_ENV !== 'production';
const PUBLIC = path.join(__dirname, 'public');

const optionalPlugins = [];
if (process.platform !== 'darwin') {
  optionalPlugins.push(new IgnorePlugin({resourceRegExp: /^fsevents$/}));
}

module.exports = alias(aliasMap);
module.exports.jest = aliasJest(aliasMap);

module.exports = {
  webpack: (config, env) => {
    config.node = {__dirname: false};
    config.mode = 'development';
    config.target = 'electron-renderer';
    config.output = {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].[chunkhash:8].js',
      publicPath: PUBLIC,
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
      new NodePolyfillPlugin(),

      isDevelopment && new ReactRefreshWebpackPlugin(),
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(PUBLIC, 'index.html'),
        hash: true,
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
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        exclude: /node_modules/,
        use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
      },
    ];
    return config;
  },
};
