import { Orientation, Style } from './types'

export const resolveStyles = (styles: Array<Style | undefined>, screenWidth: number, orientation: Orientation) => {
    const result = {} as Record<string, unknown>
    const bestBreakpoints = {} as Record<string, number>

    styles.forEach(style => {
        if (
            style === undefined
            || style.minWidth > screenWidth
            || style.maxWidth < screenWidth
        ) {
            return
        }

        style._entries.forEach(([property, value]) => {
            if (
                style.orientation !== null
                && orientation === style.orientation
            ) {
                result[property] = value
                bestBreakpoints[property] = Infinity

                return
            }

            if (bestBreakpoints[property] === undefined || style.minWidth > bestBreakpoints[property]) {
                bestBreakpoints[property] = style.minWidth
                result[property] = value
            }
        })
    })

    return result
}
