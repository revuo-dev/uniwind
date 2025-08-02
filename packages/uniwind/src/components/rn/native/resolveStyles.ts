import { UniwindRuntime } from '../../runtime'
import { Style } from '../../types'

export const resolveStyles = (styles: Array<Style | undefined>) => {
    const result = {} as Record<string, unknown>
    const bestBreakpoints = {} as Record<string, number>

    styles.forEach(style => {
        if (
            style === undefined
            || style.minWidth > UniwindRuntime.screenWidth
            || style.maxWidth < UniwindRuntime.screenWidth
        ) {
            return
        }

        style.entries.forEach(([property, value]) => {
            if (
                style.orientation !== null
                && UniwindRuntime.orientation === style.orientation
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
