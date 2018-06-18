const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    devtool: 'eval',
    output: {
        filename: 'catarse.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
