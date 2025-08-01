import { UniwindRuntime } from './runtime'

const vars = globalThis.__uniwind__getVars(UniwindRuntime)
export const stylesheet = globalThis.__uniwind__computeStylesheet(UniwindRuntime, vars)
