import { Scanner } from '@tailwindcss/oxide'
import fs from 'fs'
import { ServerConfigT } from 'metro-config'
import { Resolution } from 'metro-resolver'
import path from 'path'
import { compileVirtual } from './compileVirtual'
import { getSources } from './getSources'
import { injectThemes } from './injectThemes'
import { ExtendedBundler, ExtendedFileSystem, FileChangeEvent, Platform, UniwindMetroTransformerOptions } from './types'
import { areSetsEqual } from './utils'

const getVirtualPath = (platform: string) => `${platform}.uniwind.${platform === Platform.Web ? 'css' : 'js'}`
const getPlatformFromVirtualPath = (path: string) => {
    const [, platform] = path.match(/^(\w+)\.uniwind\./) ?? []

    return platform as Platform | undefined
}
const platforms = [Platform.iOS, Platform.Android, Platform.Web]

type EnchangeMiddlewareParameters = Parameters<ServerConfigT['enhanceMiddleware']>

export class UniwindBareRN {
    private virtualModules = new Map<string, string>()
    private injectedThemesScript = ''
    private css = ''
    private candidates = new Set<string>()

    constructor(private readonly uniwindOptions: UniwindMetroTransformerOptions) {
        this.injectedThemesScript = injectThemes(uniwindOptions)
    }

    init(metroServer: EnchangeMiddlewareParameters[1]) {
        const bundler = metroServer.getBundler().getBundler()
        const watcher = bundler.getWatcher()

        bundler.getDependencyGraph().then(async graph => {
            // @ts-expect-error Hidden property
            this.ensureFileSystemPatched(graph._fileSystem)
            this.ensureBundlerPatched(bundler)

            watcher.on('change', (event: FileChangeEvent) => {
                if ('eventsQueue' in event) {
                    if (
                        // Listen only to changes in JS/TS/css files
                        !event.eventsQueue.some(event => {
                            return ['.js', '.jsx', '.ts', '.tsx', '.css'].some(ext => event.filePath.endsWith(ext))
                        }) || event.eventsQueue.every(event => event.filePath.endsWith('uniwind.css'))
                    ) {
                        return
                    }

                    const css = fs.readFileSync(this.uniwindOptions.input, 'utf-8')
                    const candidates = new Set(this.getCandidates(css))
                    const tailwindHasChanged = css !== this.css || !areSetsEqual(this.candidates, candidates)

                    if (!tailwindHasChanged) {
                        return
                    }

                    this.injectedThemesScript = injectThemes(this.uniwindOptions)
                    this.css = css
                    this.candidates = candidates

                    platforms.forEach(platform => {
                        watcher.emit(
                            'change',
                            {
                                eventsQueue: [{
                                    filePath: getVirtualPath(platform),
                                    metadata: {
                                        modifiedTime: Date.now(),
                                        size: 1,
                                        type: 'virtual',
                                    },
                                    type: 'change',
                                }],
                            } satisfies FileChangeEvent,
                        )
                    })
                }
            })

            await Promise.all(platforms.map(platform => this.getVirtualFile(platform)))
        })
    }

    resolve(resolved: Resolution, platform: string | null) {
        if (('filePath' in resolved && resolved.filePath !== this.uniwindOptions.input)) {
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

    private ensureBundlerPatched(bundler: ExtendedBundler) {
        if (bundler.transformFile.__uniwind_patched) {
            return
        }

        const transformFile = bundler.transformFile.bind(bundler)

        bundler.transformFile = async (
            filePath,
            transformOptions,
            fileBuffer,
        ) => {
            const isVirtualFile = this.virtualModules.has(filePath)

            if (filePath.endsWith('/components/web/uniwind-metro-injected.js')) {
                fileBuffer = Buffer.from(this.injectedThemesScript)
            }

            if (isVirtualFile) {
                const platform = getPlatformFromVirtualPath(filePath)

                if (platform) {
                    const virtualFile = await this.getVirtualFile(platform)

                    fileBuffer = Buffer.from([
                        virtualFile,
                        platform !== Platform.Web ? this.injectedThemesScript : '',
                    ].join(''))
                }
            }

            return transformFile(filePath, transformOptions, fileBuffer)
        }

        bundler.transformFile.__uniwind_patched = true
    }

    private ensureFileSystemPatched(fs: ExtendedFileSystem) {
        if (!fs.getSha1.__uniwind_patched) {
            const original_getSha1 = fs.getSha1.bind(fs)

            fs.getSha1 = filename => {
                if (this.virtualModules.has(filename)) {
                    return `${filename}-${Date.now()}`
                }

                return original_getSha1(filename)
            }
            fs.getSha1.__uniwind_patched = true
        }

        return fs
    }

    private async getVirtualFile(platform: Platform) {
        const virtualFile = await compileVirtual({
            candidates: Array.from(this.candidates),
            platform,
            css: this.css,
            cssPath: this.uniwindOptions.input,
            themes: this.uniwindOptions.themes,
        })
        const injected = injectThemes(this.uniwindOptions)

        this.injectedThemesScript = injected
        this.virtualModules.set(getVirtualPath(platform), virtualFile)

        return virtualFile
    }

    private getCandidates(css: string) {
        const sources = getSources(css, path.dirname(this.uniwindOptions.input))
        const candidates = new Scanner({ sources }).scan()

        return candidates
    }
}
