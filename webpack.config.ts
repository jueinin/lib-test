import webpack from 'webpack';

import path from 'path';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const currentEnv = process.env.NODE_ENV as 'development' | 'production';
const isDev = currentEnv === 'development';
const config: webpack.Configuration & Configuration = {
    entry: process.env.TYPEPROJECT === 'admin' ? './src/backend/index.tsx' : './src/index.tsx',
    output: {
        filename: '[hash]bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: isDev ? '[name].bundle.js' : '[name][chunkhash].bundle.js'
    },
    mode: currentEnv,
    devtool: isDev ? 'inline-cheap-module-source-map' : false,
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx', 'json'],
    },
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, 'src/resource'), // 没有被打包的一些在resource的静态文件直接通过/文件名访问
        compress: true,
        port: 3001,
        host: '0.0.0.0',
        disableHostCheck: true,
        watchOptions: {
            ignored: /node_modules/,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                secure: false,
                changeOrigin: true,
            },
        },
        historyApiFallback: true,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendor'
        },
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
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require('tailwindcss')],
                            sourceMap: false,
                        },
                    },
                ],
            },
            {
                test: /\.module\.css$/,
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
                            modules: {
                                mode: 'local',
                                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                context: path.resolve(__dirname, 'src'),
                            },
                            esModule: true,
                        },
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
                                    'import',
                                    {
                                        libraryName: 'antd',
                                        libraryDirectory: 'es',
                                        style: 'css', // `style: true` 会加载 less 文件
                                    },
                                    "antd"
                                ],
                                [
                                    'babel-plugin-import',
                                    {
                                        libraryName: '@umijs/hooks',
                                        libraryDirectory: 'es',
                                        camel2DashComponentName: false,
                                    },
                                    'umi'
                                ],
                                ['@babel/plugin-proposal-pipeline-operator', { proposal: 'fsharp' }],
                                [
                                    '@babel/plugin-proposal-decorators',
                                    {
                                        legacy: true,
                                    },
                                ],
                                ['@babel/plugin-proposal-class-properties'],
                                ['@babel/plugin-proposal-partial-application'],
                                isDev && ['react-refresh/babel'],
                            ].filter(Boolean),
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
        new MiniCssExtractPlugin({
            filename: '[hash]main.css',
        }),
        new CopyWebpackPlugin([
            {
                from: './src/resource',
                to: '',
            },
        ]),
        isDev && new webpack.HotModuleReplacementPlugin(),
        isDev && new ReactRefreshWebpackPlugin(),
        // new BundleAnalyzerPlugin()
    ].filter(Boolean),
};
export default config;
