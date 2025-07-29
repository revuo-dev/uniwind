import esbuild from 'esbuild'

const commonOptions = {
    entryPoints: ['src/components/index.ts'],
    bundle: true,
    packages: 'external',
    external: ['../package.json'],
}

Promise.all([
    esbuild.build({
        ...commonOptions,
        outfile: 'dist/components/index.cjs',
        format: 'cjs',
    }),
    esbuild.build({
        ...commonOptions,
        outfile: 'dist/components/index.mjs',
        format: 'esm',
    }),
    esbuild.build({
        entryPoints: ['src/metro/index.ts'],
        bundle: true,
        outfile: 'dist/metro/index.cjs',
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
    }),
])
    .then(() => console.log('Build completed'))
    .catch(() => process.exit(1))
