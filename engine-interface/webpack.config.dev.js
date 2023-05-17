const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const path = require('path');
const fs = require('fs');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.resolve(appDirectory, "build"),
        compress: true,
        hot: true,
        open: false,
        allowedHosts: 'all',
        devMiddleware: {
            publicPath: '/',
            writeToDisk: true
        }
    },
});
