// webpack.config.js
const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/vendors.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'vendors.bundle.js',
        clean: true,
    },
    // Bundle apenas de vendors, sem loaders complexos (BS5 já é moderno)
    // Se você precisar de transpile adicional, adicionamos Babel depois.
    resolve: {
        extensions: ['.js', '.mjs'],
    },
    performance: {
        hints: false,
    },
    stats: 'normal',
};
