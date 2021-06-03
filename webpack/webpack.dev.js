const merge = require('webpack-merge')
const path = require('path')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    overlay: true,
    port: 9001,
    historyApiFallback: true,
    hot: true,
  },
  plugins: [],
})
