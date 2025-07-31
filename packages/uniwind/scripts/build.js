import esbuild from 'esbuild'
import fs from 'fs'

const commonOptions = {
    entryPoints: ['src/components/index.ts'],
    bundle: true,
    packages: 'external',
    external: ['../package.json'],
}

if (fs.existsSync('dist')) {
    fs.rmdirSync('dist', { recursive: true })
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
    esbuild.build({
        entryPoints: ['./src/babel/index.ts'],
        outfile: './dist/babel/index.cjs',
        bundle: true,
        packages: 'external',
        external: ['../package.json'],
        allowOverwrite: true,
        logLevel: 'warning',
        platform: 'node',
        minify: false,
    }),
])
    .then(() => console.log('Build completed'))
    .catch(() => process.exit(1))
