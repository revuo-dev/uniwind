import { Scanner } from '@tailwindcss/oxide'
import chokidar, { FSWatcher } from 'chokidar'
import fs from 'fs'
import { MetroConfig } from 'metro-config'
import path from 'path'
import { createStylesheets } from './createStylesheets'
import { DeepMutable, ExtendedBundler, ExtendedFileSystem, Haste, UniwindConfig } from './types'

const virtualDirectory = path.resolve(__dirname, '.cache')
const virtualFile = 'virtual.js'
const virtualFilePath = path.join(virtualDirectory, virtualFile)

export const withUniwind = (
    config: DeepMutable<MetroConfig>,
    {
        input = 'global.css',
    } = {} as UniwindConfig,
) => {
    const uniwind = {
        input,
        originalResolveRequest: config.resolver?.resolveRequest,
        originalGetTransformOptions: config.transformer?.getTransformOptions,
        haste: null as Haste | null,
        virtualModulesPossible: new Promise<void>(() => void 0),
        globalWatcher: null as FSWatcher | null,
        virtualJS: '',
        scanner: new Scanner({
            sources: [
                {
                    base: process.cwd(),
                    pattern: '**/*',
                    negated: false,
                },
            ],
        }),
    }

    fs.mkdirSync(virtualDirectory, { recursive: true })
    fs.writeFileSync(virtualFilePath, '')

    config.resolver ??= {}
    config.server ??= {}
    config.transformer ??= {}

    config.resolver.sourceExts = [
        ...config.resolver.sourceExts ?? [],
        'css',
    ]
    config.resolver.assetExts = config.resolver.assetExts?.filter(
        ext => ext !== 'css',
    )
    config.resolver.resolveRequest = (context, moduleName, platform) => {
        const resolver = uniwind.originalResolveRequest ?? context.resolveRequest
        const resolved = resolver(context, moduleName, platform)

        if (!('filePath' in resolved && resolved.filePath.endsWith(uniwind.input))) {
            return resolved
        }

        return {
            ...resolved,
            filePath: virtualFilePath,
        }
    }

    config.server.enhanceMiddleware = (middleware, metroServer) => {
        const bundler = metroServer.getBundler().getBundler()

        uniwind.virtualModulesPossible = bundler
            .getDependencyGraph()
            .then(async graph => {
                // @ts-expect-error Hidden property
                uniwind.haste = graph._haste
                // @ts-expect-error Hidden property
                ensureFileSystemPatched(graph._fileSystem)
                ensureBundlerPatched(bundler)
                setupGlobalWatcher()

                await recreateStylesheets()
            })

        return middleware
    }

    config.transformer.getTransformOptions = async (entryPoints, transformOptions, getDependenciesOf) => {
        await uniwind.virtualModulesPossible

        return uniwind.originalGetTransformOptions?.(entryPoints, transformOptions, getDependenciesOf) ?? {}
    }

    const ensureFileSystemPatched = (fs: ExtendedFileSystem) => {
        if (!fs.getSha1.__uniwind_patched) {
            const original_getSha1 = fs.getSha1.bind(fs)

            fs.getSha1 = filename => {
                if (filename === virtualFile) {
                    return `${filename}-${Date.now()}`
                }

                return original_getSha1(filename)
            }
            fs.getSha1.__uniwind_patched = true
        }

        return fs
    }

    const ensureBundlerPatched = (bundler: ExtendedBundler) => {
        if (bundler.transformFile.__uniwind_patched) {
            return
        }

        const transformFile = bundler.transformFile.bind(bundler)

        bundler.transformFile = async (
            filePath,
            transformOptions,
            fileBuffer,
        ) => {
            if (filePath.includes(virtualFile)) {
                fileBuffer = Buffer.from(uniwind.virtualJS)
            }

            return transformFile(filePath, transformOptions, fileBuffer)
        }

        bundler.transformFile.__uniwind_patched = true
    }

    const setupGlobalWatcher = () => {
        if (uniwind.globalWatcher) {
            uniwind.globalWatcher.close()
        }

        const filesToWatch = [
            path.join(process.cwd(), '**/*.ts'),
            path.join(process.cwd(), '**/*.tsx'),
            path.join(process.cwd(), '**/*.js'),
            path.join(process.cwd(), '**/*.jsx'),
        ]

        uniwind.globalWatcher = chokidar.watch(filesToWatch, {
            ignoreInitial: true,
            persistent: true,
        })

        uniwind.globalWatcher.on('all', event => {
            if (['change', 'add', 'unlink'].includes(event)) {
                recreateStylesheets()
            }
        })

        uniwind.globalWatcher.on('raw', () => {
            recreateStylesheets()
        })
    }

    const recreateStylesheets = async () => {
        if (!uniwind.haste) {
            return
        }

        const newJS = await createStylesheets(uniwind.input, uniwind.scanner)

        if (uniwind.virtualJS === newJS) {
            return
        }

        uniwind.virtualJS = newJS
        uniwind.haste.emit('change', {
            eventsQueue: [{
                filePath: virtualFilePath,
                metadata: {
                    modifiedTime: Date.now(),
                    size: newJS.length,
                    type: 'virtual',
                },
                type: 'change',
            }],
        })
    }

    process.on('exit', () => {
        if (uniwind.globalWatcher) {
            uniwind.globalWatcher.close()
        }
    })

    return config
}
