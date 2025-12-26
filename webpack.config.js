const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production' || process.env.NODE_ENV === 'production';

  return {
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "eval-source-map",
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      clean: true,
      publicPath: "/",
    },
    devServer: {
      static: ["./dist", "./public"],
      hot: true,
      port: 3000,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.template.html",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: "",
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      new Dotenv({
        path: path.resolve(__dirname, fs.existsSync('.env.local') ? '.env.local' : '.env'),
        systemvars: true,
        silent: true,
      }),
    ],
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
  };
};
