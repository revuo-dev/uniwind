import { BuildConfig, defineBuildConfig } from 'unbuild'

type Config = {
    input: string
    outDir: string
    pattern?: Array<string>
    declaration?: boolean
}

const getConfig = (config: Config) =>
    [
        {
            builder: 'mkdist',
            input: config.input,
            outDir: `dist/common/${config.outDir}`,
            ext: 'js',
            format: 'cjs',
            pattern: config.pattern,
            esbuild: {
                jsx: 'automatic',
                jsxImportSource: 'react',
            },
        },
        {
            builder: 'mkdist',
            input: config.input,
            outDir: `dist/module/${config.outDir}`,
            ext: 'js',
            format: 'esm',
            pattern: config.pattern,
            declaration: config.declaration,
            esbuild: {
                jsx: 'automatic',
                jsxImportSource: 'react',
            },
        },
    ] satisfies Array<BuildConfig['entries'][number]>

export default defineBuildConfig({
    entries: [
        {
            builder: 'rollup',
            input: './src/metro',
            name: 'metro/index',
        },
        {
            builder: 'rollup',
            input: './src/metro/expo-transformer.ts',
            name: 'metro/expo-transformer',
        },
        {
            builder: 'mkdist',
            input: './src/metro',
            outDir: 'dist/metro',
            pattern: ['index.d.ts'],
            declaration: true,
            format: 'esm',
        },
        ...getConfig({
            input: './src/components',
            outDir: 'components',
        }),
        ...getConfig({
            input: './src',
            outDir: '',
            pattern: [
                '**/*',
                '!metro/**',
            ],
            declaration: true,
        }),
    ],
    outDir: 'dist',
    clean: true,
    externals: [
        /@tailwindcss/,
        'lightningcss',
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
