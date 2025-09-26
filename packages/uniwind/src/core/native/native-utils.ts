import { formatHex, formatHex8, interpolate, parse } from 'culori'

export const colorMix = (color: string, mixColor: string, weight: number) => {
    // Change alpha
    if (mixColor === '#00000000') {
        const parsedColor = parse(color)

        if (parsedColor === undefined) {
            return color
        }

        return formatHex8({
            ...parsedColor,
            alpha: weight,
        })
    }

    return formatHex(interpolate([mixColor, color])(weight))
}
