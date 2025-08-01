import { Orientation } from './types'

export const toSafeString = (value: string) => `\`${value}\``

export const isDefined = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

const toVar = (value: string) => `vars[${toSafeString(value)}]`

const findMatch = (
    str: string,
    depth = 0,
    idx = 0,
): number => {
    const ch = str.charAt(idx)

    switch (ch) {
        case '':
            return -1
        case '(':
            return findMatch(str, depth + 1, idx + 1)
        case ')':
            return depth === 0
                ? idx
                : findMatch(str, depth - 1, idx + 1)
        default:
            return findMatch(str, depth, idx + 1)
    }
}

const processVarsRec = (str: string): string => {
    const start = str.indexOf('var(')

    if (start < 0) {
        return str
    }

    const after = str.slice(start + 4)
    const end = findMatch(after)

    if (end < 0) {
        return str
    }

    const inner = after.slice(0, end).trim()
    const suffix = after.slice(end + 1)

    return (
        str.slice(0, start)
        + processVar(`var(${inner})`).join(' ?? ')
        + processVarsRec(suffix)
    )
}

export const processCSSValue = (value: string) => {
    const replacedUnits = value
        .replace(/(\d+(?:\.\d+)?)(vw|vh|px|rem)/g, (match, value, unit) => {
            switch (unit) {
                case 'vw':
                    return `(${value} * rt.screenWidth / 100)`
                case 'vh':
                    return `(${value} * rt.screenHeight / 100)`
                case 'px':
                    return value
                case 'rem':
                    return `(${value} * rt.rem)`
                default:
                    return match
            }
        })
        .replace('calc', '')

    return processVarsRec(replacedUnits)
}

export const processVar = (rawValue: string): Array<string> => {
    // Strip `var(` prefix and trailing `)`
    const unwrapped = rawValue.slice(4, -1)
    const { index: splitIndex } = unwrapped
        .split('')
        .reduce(
            (acc, char, charIndex) => {
                const getDepth = () => {
                    if (char === '(') {
                        return acc.depth + 1
                    }

                    return char === ')'
                        ? acc.depth - 1
                        : acc.depth
                }

                const getIndex = () => {
                    if (acc.index !== null) {
                        return acc.index
                    }

                    return char === ',' && acc.depth === 0
                        ? charIndex
                        : null
                }

                const index = getIndex()
                const depth = getDepth()

                return { depth, index }
            },
            { depth: 0, index: null as number | null },
        )

    if (splitIndex === null) {
        return [toVar(unwrapped)]
    }

    const value = unwrapped.slice(0, splitIndex).trim()
    const defaultValueRaw = unwrapped.slice(splitIndex + 1).trim()
    const defaultValue = defaultValueRaw.startsWith('var(')
        ? processVar(defaultValueRaw)
        : [toVar(defaultValueRaw)]

    return [toVar(value), ...defaultValue]
}

export const processMediaQuery = (mq: string) => {
    const lower = mq.toLowerCase()

    // Full range: "100px <= width < 200px"
    const fullRangeMatch = lower.match(
        /([\d.]+[a-z%]+)\s*<=\s*width\s*<\s*([\d.]+[a-z%]+)/,
    ) ?? null

    const minWidth = fullRangeMatch
        ? fullRangeMatch[1]
        : [
            /width\s*>=\s*([\d.]+[a-z%]+)/, // width >= N → min-width
            /([\d.]+[a-z%]+)\s*<=\s*width/, // N <= width → min-width
            /width\s*>\s*([\d.]+[a-z%]+)/, // width > N → min-width
            /min-width\s*:\s*([\d.]+[a-z%]+)/, // classic min-width
        ].reduce<string | null>(
            (found, rx) => found ?? (lower.match(rx)?.[1] ?? null),
            null,
        )

    const maxWidth = fullRangeMatch
        ? fullRangeMatch[2]
        : [
            /width\s*<=\s*([\d.]+[a-z%]+)/, // width <= N → max-width
            /([\d.]+[a-z%]+)\s*>=\s*width/, // N >= width → max-width
            /width\s*<\s*([\d.]+[a-z%]+)/, // width < N → max-width
            /max-width\s*:\s*([\d.]+[a-z%]+)/, // classic max-width
        ].reduce<string | null>(
            (found, rx) => found ?? (lower.match(rx)?.[1] ?? null),
            null,
        )

    const orientation = (
        lower.match(/orientation\s*:\s*(portrait|landscape)/)?.[1]
            ?? null
    ) as Orientation | null

    return {
        minWidth: isDefined(minWidth) ? processCSSValue(minWidth) : 0,
        maxWidth: isDefined(maxWidth) ? processCSSValue(maxWidth) : Number.MAX_VALUE,
        orientation,
    }
}

export const escapeDynamic = (str: string) =>
    str.replace(/"(vars|\()([^"]+)"/g, (match, type) => {
        switch (type) {
            case 'vars':
            case '(':
                return match.slice(1, -1)
            default:
                return match
        }
    })
