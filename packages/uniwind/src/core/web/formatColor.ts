import { formatHex, formatHex8, parse } from 'culori'

export const formatColor = (color: string) => {
    const parsedColor = parse(color)

    if (!parsedColor) {
        return undefined
    }

    return parsedColor.alpha !== undefined && parsedColor.alpha !== 1
        ? formatHex8(parsedColor)
        : formatHex(parsedColor)
}
