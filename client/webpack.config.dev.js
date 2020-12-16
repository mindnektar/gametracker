const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = merge(require('./webpack.config.common.js'), {
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        writeToDisk: true,
        disableHostCheck: true,
        host: '0.0.0.0',
        hot: true,
        port: 5931,
        historyApiFallback: {
            index: 'index.html',
        },
    },
    output: {
        publicPath: '/',
        filename: 'script/[name][hash].js',
        chunkFilename: 'script/[name][chunkhash].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: 'cheap-module-source-map',
    mode: 'development',
});
