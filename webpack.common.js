const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const fs = require("fs");
const path = require("path");
const pages = ['index'];

const htmlWebpackPerPage = (page) => {
  return new HTMLWebpackPlugin({
    inject: true,
    template: `./src/${page}.html`,
    filename: `${page}.html`,
    chunks: [page],
  });
};

const includePreprocessor = (content, loaderContext) => {
  return content.replace(
    /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi,
    (m, src) => {
      const filePath = path.resolve(loaderContext.context, src);
      loaderContext.dependency(filePath);
      let partialDatei = fs.readFileSync(filePath);
      return partialDatei;
    }
  );
};

module.exports = {
  entry: pages.reduce((config, page) => {
    config[page] = `./src/js/${page}`;
    return config;
  }, {}),
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            preprocessor: includePreprocessor
          }
        },
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        type: 'asset/resource'
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
  ].concat(pages.map(htmlWebpackPerPage)),

  devServer: {
    watchFiles: ["src/*.html"],
    hot: true,
  }
};