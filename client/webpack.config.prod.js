const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = webpackMerge(require('./webpack.config.common.js'), {
    output: {
        publicPath: '/',
        filename: 'script/[name][fullhash].js',
        chunkFilename: 'script/[name][chunkhash].js',
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            sourceMap: true,
        })],
    },

    devtool: 'source-map',

    mode: 'production',
});
