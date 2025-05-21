const path = require('path');
const glob = require('glob');

function sassGlobImporter(url, prev) {
    if (!url.includes('*')) return null;

    // Ensure we only match .sass files
    const pattern = url.endsWith('.sass') ? url : `${url}/**/*.sass`;
    const files = glob.sync(pattern, {
        cwd: path.dirname(prev),
    });

    const imports = files.map((file) => {
        // Remove the .sass extension for the import
        const normalizedFile = file.replace(/\.sass$/, '');
        // Don't add ./ prefix since we're using includePaths
        return `@forward '${normalizedFile}';`;
    }).join('\n');

    return { contents: imports };
}

module.exports = {
    context: __dirname,

    entry: {
        app: ['@babel/polyfill', './script/app.jsx'],
    },

    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '',
        filename: 'script/[name].js',
        chunkFilename: 'script/[name].js',
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            'script',
            'script/components/common',
            'script/components/ui',
            'script/components/hoc',
            'node_modules',
        ],
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-object-rest-spread',
                            ],
                        },
                    },
                ],
            },

            {
                test: /\.sass$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader', options: { url: false } },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                quietDeps: true,
                                importer: sassGlobImporter,
                                includePaths: [path.resolve(__dirname, 'style')],
                            },
                        },
                    },
                    { loader: 'import-glob-loader' },
                ],
            },
        ],
    },
};
