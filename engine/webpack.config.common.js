const webpack = require('webpack');
const path = require("path");
const fs = require("fs");
const ESLintPlugin = require('eslint-webpack-plugin');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/index.ts"),
    output: {
        filename: "optiengine.js",
        path: path.resolve("./build/"),
        library: {
            name: 'OptiEngine',
            type: 'umd',
            umdNamedDefine: true,
        },
        clean: true
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            fs: false,
            path: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
};
