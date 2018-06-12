const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/c.js',
    output: {
        filename: 'catarse.js',
        library: 'c',
        path: path.resolve(__dirname, 'dist'),
    },
};
