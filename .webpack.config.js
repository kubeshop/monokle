// define child rescript
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

module.exports = {
  config: {
    node: {
      __dirname: false
    },
    target: 'electron-renderer'
  },
  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json']
    })
  ]
};
