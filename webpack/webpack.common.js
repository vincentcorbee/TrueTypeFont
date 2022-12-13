const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const pkg = require('../package.json')
const dependencies = pkg.dependencies
const webpack = require('webpack')
const devMode = false
const entry = {
  app: [path.resolve(__dirname, path.join('..', 'src', 'app.ts'))],
}
const index = {
  hash: true,
  template: path.join('src', 'index.html'),
  chunks: ['app'],
}

if (dependencies !== undefined && Object.keys(dependencies).length) {
  entry.vendor = Object.keys(dependencies)
  index.chunks.unshift('vendor')
}

const config = {
  entry,
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '..', 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  optimization: {},
  plugins: [
    new webpack.NamedModulesPlugin(),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
    }),
    new HtmlWebpackPlugin(index),
  ],
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')()],
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.[j|t]s$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000,
              name: 'img/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
}
module.exports = config
