const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = merge(require('./webpack.config.common.js'), {
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        disableHostCheck: true,
        host: '0.0.0.0',
        hot: true,
        port: 5931,
        historyApiFallback: {
            index: 'index.html',
        },
        // The API is served by `wrangler dev` in ../worker
        proxy: {
            '/api': 'http://localhost:8787',
        },
    },
    output: {
        publicPath: '/',
        filename: 'script/[name][hash].js',
        chunkFilename: 'script/[name][chunkhash].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.API_HTTP_URL': JSON.stringify('/api'),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: 'cheap-module-source-map',
    mode: 'development',
});
