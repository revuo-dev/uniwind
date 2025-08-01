import { UniwindRuntime } from './runtime'
import { StyleSheets } from './types'

const uniwind = {
    vars: globalThis.__uniwind__getVars(UniwindRuntime),
    stylesheet: {} as StyleSheets,
}

uniwind.stylesheet = globalThis.__uniwind__computeStylesheet(UniwindRuntime, uniwind.vars)

if (__DEV__) {
    globalThis.__uniwind__hot_reload = () => {
        uniwind.vars = globalThis.__uniwind__getVars(UniwindRuntime)
        uniwind.stylesheet = globalThis.__uniwind__computeStylesheet(UniwindRuntime, uniwind.vars)
    }
}

export const getStyleSheet = () => uniwind.stylesheet
