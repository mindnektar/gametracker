const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(require('./webpack.config.common.js'), {
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
            'process.env.API_HTTP_URL': JSON.stringify('https://completed-games.herokuapp.com/api'),
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    devtool: 'source-map',

    mode: 'production',
});
