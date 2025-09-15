import { Scanner } from '@tailwindcss/oxide'
import chokidar, { FSWatcher } from 'chokidar'
import type EventEmitter from 'events'
import type { MetroConfig } from 'metro-config'
import path from 'path'
import { compileVirtual } from './compileVirtual'
import { DeepMutable, ExtendedBundler, ExtendedFileSystem, Platform, UniwindConfig } from './types'

const getVirtualPath = (platform: string) => `${platform}.uniwind.${platform === Platform.Web ? 'css' : 'js'}`

const platforms = [Platform.iOS, Platform.Android, Platform.Web]

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
        watcher: null as EventEmitter | null,
        virtualModulesPossible: new Promise<void>(() => void 0),
        globalWatcher: null as FSWatcher | null,
        virtualModules: new Map<string, string>(),
        getCandidates: () =>
            new Scanner({
                sources: [
                    {
                        base: process.cwd(),
                        pattern: '**/*',
                        negated: false,
                    },
                ],
            }).scan(),
    }

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

        if (platform !== Platform.iOS && platform !== Platform.Android && platform !== Platform.Web) {
            return resolved
        }

        return {
            ...resolved,
            filePath: getVirtualPath(platform),
        }
    }

    config.server.enhanceMiddleware = (middleware, metroServer) => {
        const bundler = metroServer.getBundler().getBundler()

        uniwind.virtualModulesPossible = bundler
            .getDependencyGraph()
            .then(async graph => {
                uniwind.watcher = bundler.getWatcher()
                // @ts-expect-error Hidden property
                ensureFileSystemPatched(graph._fileSystem)
                ensureBundlerPatched(bundler)
                setupGlobalWatcher()

                await Promise.all(platforms.map(recreateStylesheets))
            })

        return middleware
    }

    const ensureFileSystemPatched = (fs: ExtendedFileSystem) => {
        if (!fs.getSha1.__uniwind_patched) {
            const original_getSha1 = fs.getSha1.bind(fs)

            fs.getSha1 = filename => {
                if (uniwind.virtualModules.has(filename)) {
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
            const virtualFile = uniwind.virtualModules.get(filePath)

            if (virtualFile !== undefined) {
                fileBuffer = Buffer.from(virtualFile)
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
            path.join(process.cwd(), uniwind.input),
            path.join(process.cwd(), '**/*.ts'),
            path.join(process.cwd(), '**/*.tsx'),
            path.join(process.cwd(), '**/*.js'),
            path.join(process.cwd(), '**/*.jsx'),
        ]

        uniwind.globalWatcher = chokidar.watch(filesToWatch, {
            ignoreInitial: true,
            persistent: true,
        })

        uniwind.globalWatcher.on('all', () => {
            platforms.forEach(platform => {
                recreateStylesheets(platform)
            })
        })

        uniwind.globalWatcher.on('raw', () => {
            platforms.forEach(platform => {
                recreateStylesheets(platform)
            })
        })
    }

    const recreateStylesheets = async (platform: Platform) => {
        if (!uniwind.watcher) {
            return
        }

        const virtualPath = getVirtualPath(platform)
        const newVirtual = await compileVirtual(uniwind.input, uniwind.getCandidates, platform)

        if (uniwind.virtualModules.get(virtualPath) === newVirtual) {
            return
        }

        uniwind.virtualModules.set(virtualPath, newVirtual)
        uniwind.watcher.emit('change', {
            eventsQueue: [{
                filePath: virtualPath,
                metadata: {
                    modifiedTime: Date.now(),
                    size: newVirtual.length,
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
