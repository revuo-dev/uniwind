export type Orientation = 'portrait' | 'landscape'
export type ColorScheme = 'light' | 'dark'

export type Style = {
    entries: Array<[string, unknown]>
    minWidth: number
    maxWidth: number
    orientation: Orientation | null
}

export type StyleSheets = Record<string, Style>

export type UniwindRuntime = {
    screenWidth: number
    screenHeight: number
    orientation: Orientation
    colorScheme: ColorScheme
    rem: number
}

declare global {
    var __uniwind__getVars: (runtime: UniwindRuntime) => Record<string, unknown>
    var __uniwind__computeStylesheet: (runtime: UniwindRuntime, vars: Record<string, unknown>) => StyleSheets
    var __uniwind__hot_reload: () => void
}
