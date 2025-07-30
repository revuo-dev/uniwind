import { converter, formatRgb, parse } from 'culori'
import { UniwindParsingError } from '../utils'

const toRgb = converter('rgb')

export class Color {
    static rgba(value: string) {
        const parsed = parse(value)
        const rgb = toRgb(parsed)

        if (rgb === undefined) {
            throw new UniwindParsingError(`Invalid color - ${value}`)
        }

        return formatRgb(rgb)
    }
}
