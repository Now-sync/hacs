module.exports = {
  entry: "./frontend/syncApp.js",
  output: {
    path: __dirname + "/frontend",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  watch: true
};
