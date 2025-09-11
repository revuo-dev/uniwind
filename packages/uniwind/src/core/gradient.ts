import type { GradientValue } from 'react-native'

type InferFromReadonlyArray<T> = T extends ReadonlyArray<infer U> ? U : never

const gradientDirectionTokens = new Set(['to', 'top', 'right', 'bottom', 'left'])

export const resolveGradient = (value: Array<string>) => {
    const flatten = value.flat()
    const directionToken = flatten.find(token => token.includes('to') || token.includes('deg'))
    const filtered = flatten.filter(token => token !== directionToken)
    const colorStops = [] as Array<InferFromReadonlyArray<GradientValue['colorStops']>>

    for (let i = 0; i < filtered.length; i += 2) {
        const position = filtered[i + 1]

        colorStops.push({
            color: filtered[i]!,
            positions: position !== undefined ? [position] as unknown as Array<Array<string>> : undefined,
        })
    }

    const direction = directionToken
        ?.split(' ')
        .reduce((acc, token) => {
            if (gradientDirectionTokens.has(token) || token.includes('deg')) {
                return `${acc} ${token.replace(',', '')}`
            }

            return acc
        }, '')
        .trim()

    return [
        {
            colorStops,
            type: 'linear-gradient',
            direction,
        },
    ] satisfies Array<GradientValue>
}
