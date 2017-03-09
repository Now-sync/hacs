module.exports = {
  entry: "./src/frontend/syncApp.js",
  output: {
    path: __dirname + "/src/frontend",
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
