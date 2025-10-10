import type { MetroConfig } from 'metro-config'
import path from 'path'
import { UniwindBareRN } from './bare-rn'
import { injectThemes } from './injectThemes'
import { nativeResolver, webResolver } from './resolvers'
import { Platform, UniwindConfig, UniwindMetroTransformerOptions } from './types'
import { isExpo, uniq } from './utils'

export const withUniwindConfig = (
    config: MetroConfig,
    uniwindConfig: UniwindConfig,
): MetroConfig => {
    if (typeof uniwindConfig === 'undefined') {
        throw new Error('Uniwind: You need to pass second parameter to withUniwindConfig')
    }

    if (typeof uniwindConfig.cssEntryFile === 'undefined') {
        throw new Error(
            'Uniwind: You need to pass css css entry file to withUniwindConfig, e.g. withUniwindConfig(config, { cssEntryFile: "./global.css" })',
        )
    }

    const uniwindMetroTransformerOptions = {
        input: path.join(process.cwd(), uniwindConfig.cssEntryFile),
        themes: uniq([
            'light',
            'dark',
            ...(uniwindConfig.extraThemes ?? []),
        ]),
        dtsPath: uniwindConfig.dtsFile,
    } satisfies UniwindMetroTransformerOptions

    const isExpoApp = isExpo()
    const BareRN = isExpoApp ? null : new UniwindBareRN(uniwindMetroTransformerOptions)

    injectThemes(uniwindMetroTransformerOptions)

    return {
        ...config,
        transformerPath: isExpoApp ? require.resolve('./expo-transformer.cjs') : config.transformerPath,
        transformer: isExpoApp
            ? {
                ...config.transformer,
                uniwind: uniwindMetroTransformerOptions,
            } as typeof config.transformer
            : config.transformer,
        server: {
            ...config.server,
            enhanceMiddleware: isExpoApp
                ? config.server?.enhanceMiddleware
                : (middleware, metroServer) => {
                    BareRN?.init(metroServer)

                    return middleware
                },
        },
        resolver: {
            ...config.resolver,
            sourceExts: [
                ...config.resolver?.sourceExts ?? [],
                'css',
            ],
            assetExts: (config.resolver?.assetExts ?? []).filter(ext => ext !== 'css'),
            resolveRequest: (context, moduleName, platform) => {
                const resolver = config.resolver?.resolveRequest ?? context.resolveRequest
                const platformResolver = platform === Platform.Web ? webResolver : nativeResolver
                const resolved = platformResolver({
                    context,
                    moduleName,
                    platform,
                    resolver,
                })

                if (!BareRN) {
                    return resolved
                }

                return BareRN.resolve(resolved, platform)
            },
        },
    }
}
