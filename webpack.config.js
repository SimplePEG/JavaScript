const BundleAnalyzerPlugin = require('@bundle-analyzer/webpack-plugin')


module.exports = {
    context: __dirname + "/src",
    entry: "./speg.js",
    output: {
        path: __dirname + "/dist",
        filename: "speg.js",
        library: "simplepeg",
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [new BundleAnalyzerPlugin({ token: 'bd01d591e9a74b92b1bfb2ca8dfc8c416e6fa1d0' })],
};