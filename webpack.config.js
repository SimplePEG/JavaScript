module.exports = {
    context: __dirname + "/src",
    entry: "./speg.js",
    output: {
        path: __dirname + "/dist",
        filename: "speg.js",
        library: "simplepeg",
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};