import webpack from "webpack";

import path from "path";
import HTMLWebpackPlugin from "html-webpack-plugin";
import { Configuration } from "webpack-dev-server";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const currentEnv = "development";
process.env.NODE_ENV = currentEnv;
const config: webpack.Configuration & Configuration = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: currentEnv,
  devtool: false,
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    },
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: currentEnv === "development"
            }
          },
          {
            loader: "css-loader",
            options: {
              // importLoaders: 1,
              sourceMap: false
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("tailwindcss")],
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: currentEnv === "development"
            }
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-react",
                  {
                    targets: {
                      browsers: ["last 1 Chrome versions"]
                    }
                  }
                ],
                ["@babel/preset-env"],
                ["@babel/preset-typescript"]
              ],
              plugins: [
                  ['@babel/plugin-transform-runtime'],
                [
                  "babel-plugin-import",
                  {
                    libraryName: "@material-ui/core",
                    libraryDirectory: "esm",
                    camel2DashComponentName: false
                  },
                  "core"
                ],
                [
                  "babel-plugin-import",
                  {
                    libraryName: "@material-ui/icons",
                    libraryDirectory: "esm",
                    camel2DashComponentName: false
                  },
                  "icons"
                ],
                [
                  "babel-plugin-import",
                  {
                    libraryName: "@umijs/hooks",
                    libraryDirectory: "es",
                    camel2DashComponentName: false
                  }
                ],
                ["react-refresh/babel"]
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|jpeg|woff|woff2|ttf|eot)$/,
        use: ["file-loader"]
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./src/index.html"
    }),
    new MiniCssExtractPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin()
  ]
};
export default config;
