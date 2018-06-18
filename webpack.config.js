const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    devtool: 'eval',
    output: {
        filename: 'catarse.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.elm$/,
                exclude: [/elm-stuff/, /node_modules/],
                loader: 'elm-webpack-loader',
                options: {
                    debug: true,
                    warn: true
                }
            }
        ]
    }
};
