import esbuild from 'esbuild'

esbuild.build({
    entryPoints: ['src/metro/index.ts'],
    bundle: true,
    outfile: 'dist/metro/index.js',
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    external: ['../package.json'],
    loader: {
        '.node': 'file',
    },
    plugins: [
        {
            name: 'native-modules',
            setup(build) {
                build.onResolve({ filter: /\.node$/ }, args => {
                    return { path: args.path, external: true }
                })
            },
        },
    ],
})
    .catch(() => process.exit(1))
