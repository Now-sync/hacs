module.exports = {
  output: {
    filename: "bundle.js"
  },
  module: {
    loaders: [
        {
            exclude: /(node_modules)/,
            loader: 'babel-loader'
        },
        {
            test: /\.css$/,
            loader: "style-loader!css-loader" 
        }
    ]
  }
};
