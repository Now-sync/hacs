module.exports = {
  output: {
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  }
};
