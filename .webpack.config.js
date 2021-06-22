const {appendWebpackPlugin} = require('@rescripts/utilities')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path');

// define child rescript
module.exports = config => {
  config.node.__dirname = false;
  config.target = 'electron-renderer';

  return appendWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ['yaml'],
    }),
    config,
  )
}
