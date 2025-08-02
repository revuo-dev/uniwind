import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    entries: [
        {
            builder: 'rollup',
            input: './src/metro',
            name: 'metro/index',
        },
        {
            builder: 'rollup',
            input: './src/babel',
            name: 'babel/index',
        },
        {
            builder: 'mkdist',
            input: './src/components',
            outDir: 'dist/components/common',
            ext: 'cjs',
            format: 'cjs',
        },
        {
            builder: 'mkdist',
            input: './src/components',
            outDir: 'dist/components/module',
            ext: 'mjs',
            format: 'esm',
        },
    ],
    outDir: 'dist',
    clean: true,
    externals: [
        /@tailwindcss/,
    ],
    rollup: {
        emitCJS: true,
        output: {
            format: 'cjs',
        },
    },
    dependencies: [
        '@tailwindcss',
    ],
})
