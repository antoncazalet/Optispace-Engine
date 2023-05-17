const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const child_process = require("child_process");
require('dotenv').config({ path: './.env' });

// App directory
const appDirectory = fs.realpathSync(process.cwd());

let lastCommitDate = child_process
    .execSync('git log -1 --date=format:"%d/%m/%Y %T" --format="%ad"')
    .toString()

let lastCommitHash = child_process
    .execSync('git rev-parse HEAD')
    .toString()

module.exports = {
    entry: path.resolve(appDirectory, "src/index.tsx"),
    output: {
        filename: "js/bundle.js",
        path: path.resolve("./dist/"),
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".d.ts"],
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
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                REACT_APP_API_HOST: process.env.REACT_APP_API_HOST,
                VERSION: JSON.stringify(require("./package.json").version),
                DATE: lastCommitDate,
                HASH: lastCommitHash,
                PRODUCTION: Boolean(process.env.NODE_ENV === 'production'),
            }),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, "public/index.html"),
            inject: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/robots.txt' },
                { from: 'public/rooms', to: 'rooms' },
                { from: 'public/assets', to: 'assets' }
            ]
        })
    ],
};
