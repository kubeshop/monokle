const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const {IgnorePlugin} = require('webpack');

const optionalPlugins = [];
if (process.platform !== 'darwin') {
  optionalPlugins.push(new IgnorePlugin({resourceRegExp: /^fsevents$/}));
}

console.log('NODE_ENV', process.env.NODE_ENV);

module.exports = [
  {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './electron/main.ts',
    target: 'electron-main',
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.main.json',
              },
            },
          ],
          resolve: {
            fullySpecified: false,
          },
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
      ],
    },
    plugins: [...optionalPlugins],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, 'tsconfig.main.json'),
        }),
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build', 'electron'),
      filename: 'main.js',
    },
  },
];
