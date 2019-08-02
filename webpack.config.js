const paths = require('./tasks/paths')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: process.env.NODE_ENV,
  watch: !isProd,
  devtool: isProd ? 'source-map' : 'eval-source-map',
  entry: {
    main: paths.devJs + 'main.js'
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    path: path.resolve(__dirname, paths.buildJs)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  }
}
