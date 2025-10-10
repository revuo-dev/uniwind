import { Scanner } from '@tailwindcss/oxide'
import fs from 'fs'
import type {
    JsTransformerConfig,
    JsTransformOptions,
    TransformResponse,
} from 'metro-transform-worker'
import path from 'path'
import { compileVirtual } from './compileVirtual'
import { getSources } from './getSources'
import { injectThemes } from './injectThemes'
import { Platform, UniwindMetroTransformerOptions } from './types'
import { areSetsEqual } from './utils'

let metroTransformerPath: string
let worker: typeof import('metro-transform-worker')

try {
    metroTransformerPath = (require('@expo/metro-config') as typeof import('@expo/metro-config')).unstable_transformerPath
} catch {
    metroTransformerPath = '@expo/metro-config/build/transform-worker/transform-worker.js'
}

try {
    worker = require(metroTransformerPath)
} catch {
    worker = require('metro-transform-worker')
}

const uniwindCache = {
    css: '',
    candidates: new Set<string>(),
    virtual: {
        [Platform.Web]: null,
        [Platform.iOS]: null,
        [Platform.Android]: null,
        [Platform.Native]: null,
    } as Record<Platform, TransformResponse | null>,
}

export const transform = async (
    config: JsTransformerConfig & { uniwind?: UniwindMetroTransformerOptions },
    projectRoot: string,
    filePath: string,
    data: Buffer,
    options: JsTransformOptions & { uniwind?: UniwindMetroTransformerOptions },
): Promise<TransformResponse> => {
    const uniwindOptions = options.uniwind ?? config.uniwind

    if (uniwindOptions === undefined || options.platform === undefined) {
        return worker.transform(config, projectRoot, filePath, data, options)
    }

    if (filePath.endsWith('uniwind-metro-injected.js')) {
        const injected = injectThemes({
            input: uniwindOptions.input,
            themes: uniwindOptions.themes,
            dtsPath: uniwindOptions.dtsPath,
        })

        data = Buffer.from(injected)
    }

    const isCss = options.type !== 'asset' && filePath.endsWith('.css')

    if (!isCss) {
        return worker.transform(config, projectRoot, filePath, data, options)
    }

    const css = fs.readFileSync(filePath, 'utf-8')
    const platform = options.platform as Platform
    const sources = getSources(css, path.dirname(uniwindOptions.input))
    const candidates = new Scanner({ sources }).scan()
    const candidatesSet = new Set(candidates)

    if (
        uniwindCache.virtual[platform] !== null
        && uniwindCache.css === css
        && areSetsEqual(candidatesSet, uniwindCache.candidates)
    ) {
        return uniwindCache.virtual[platform]
    }

    uniwindCache.css = css
    uniwindCache.candidates = new Set(candidates)

    const virtualFile = await compileVirtual({
        candidates,
        css,
        cssPath: uniwindOptions.input,
        platform,
        themes: uniwindOptions.themes,
    })

    data = Buffer.from([
        virtualFile,
        platform !== Platform.Web ? injectThemes(uniwindOptions) : '',
    ].join(''))

    const transform = await worker.transform(
        config,
        projectRoot,
        `${filePath}${platform === Platform.Web ? '' : '.js'}`,
        data,
        options,
    )
    ;(transform as any).output[0].data.css = {
        skipCache: true,
        code: '',
    }

    uniwindCache.virtual[platform] = transform

    return transform
}
