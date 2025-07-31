export type Orientation = 'portrait' | 'landscape'

export type Style = {
    _entries: Array<[string, unknown]>
    minWidth: number
    maxWidth: number
    orientation: Orientation | null
}

type StylesRegistry = Record<string, Style>

declare global {
    var __uniwind__: StylesRegistry | undefined
}
