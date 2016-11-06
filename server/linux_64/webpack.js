var webpack = require('webpack');

var PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {

    entry: './main.js',
    //devtool: 'source-map',
    output: {
        path: './dist',
        filename: PROD ? 'bundle.min.js' : 'bundle.js'
    },
    plugins: PROD ? [] : []
};