const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "production",
    entry: "./src/index.tsx",
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "public"),
        publicPath: "/"
    },    
   
    module: 
    {
        rules: [
            {
                test: /\.css$/,
                use:[
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.scss$/,
                use:[
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    
    plugins: [
        new BundleAnalyzerPlugin()
    ],

    devServer:{
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 9000,
        historyApiFallback: true
    },

    devtool: 'source-map',

    performance: {
        maxEntrypointSize: 2048000,
        maxAssetSize: 2048000
    }
}