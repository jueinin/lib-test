import webpack from 'webpack';

import path from 'path';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest'
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const currentEnv = 'development';
process.env.NODE_ENV = currentEnv;
const config: webpack.Configuration & Configuration = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: currentEnv,
    devtool: "inline-cheap-module-source-map",
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, 'src/resource'), // 没有被打包的一些在resource的静态文件直接通过/文件名访问
        compress: true,
        port: 3001,
        host: '0.0.0.0',
        disableHostCheck: true,
        proxy: {
            '/api': {
                target: process.env.STATUS === 'deploy' ? 'http://nest:3000' : 'http://localhost:3000',
                secure: false,
                changeOrigin: true,
                // onProxyReq(proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse): void {
                //     console.log('req',req.url)
                // },
                // onProxyRes(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse): void {
                //     console.log('res',req.url,res.statusCode)
                // },
                // onError(err: Error, req: http.IncomingMessage, res: http.ServerResponse): void {
                //     console.log('error', err);
                // }
            },
        },
        historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          exclude: /\.module\.css/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: currentEnv === 'development',
              },
            },
            {
              loader: 'css-loader',
              options: {
                // importLoaders: 1,
                sourceMap: false,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: [require("tailwindcss")],
                sourceMap: false
              }
            }
          ],
        },
        {
          test: /\.module\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: currentEnv === "development"
              }
            },
            {
              loader: 'css-loader',
              options: {
                // importLoaders: 1,
                sourceMap: false,
                modules: {
                  mode: 'local',
                  localIdentName: '[path][name]__[local]--[hash:base64:5]',
                  context: path.resolve(__dirname, 'src'),
                },
                esModule: true
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: currentEnv === 'development',
              },
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: false,
              },
            },
            {
              loader: 'sass-loader',
            },
          ],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-react',
                    {
                      targets: {
                        browsers: ['last 1 Chrome versions'],
                      },
                    },
                  ],
                  ['@babel/preset-env'],
                  ['@babel/preset-typescript'],
                ],
                  plugins: [
                      ['@babel/plugin-transform-runtime'],
                      [
                          'babel-plugin-import',
                          {
                              libraryName: '@material-ui/core',
                              libraryDirectory: 'esm',
                              camel2DashComponentName: false,
                          },
                          'core',
                      ],
                      [
                          'babel-plugin-import',
                          {
                              libraryName: '@material-ui/icons',
                              libraryDirectory: 'esm',
                              camel2DashComponentName: false,
                          },
                          'icons',
                      ],
                      [
                          'babel-plugin-import',
                          {
                              libraryName: '@umijs/hooks',
                              libraryDirectory: 'es',
                              camel2DashComponentName: false,
                          },
                      ],
                      ["@babel/plugin-proposal-pipeline-operator", {"proposal": "fsharp"}],
                      ['@babel/plugin-proposal-decorators',{
                          legacy: true
                      }],
                      ['@babel/plugin-proposal-class-properties'],
                      ['@babel/plugin-proposal-partial-application'],
                      ['react-refresh/babel'],
                  ],
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|gif|jpeg|woff|woff2|ttf|eot)$/,
          use: ['file-loader'],
        },
      ],
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ],
};
export default config;
