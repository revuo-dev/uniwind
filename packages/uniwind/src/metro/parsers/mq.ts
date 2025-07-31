import { Orientation, Vars } from '../types'
import { Parser as ParserType } from '.'

export class Mq {
    static parse(mq: string, vars: Vars, Parser: typeof ParserType) {
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
            ) ?? 1

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
            ) ?? Number.MAX_VALUE

        const orientation = (
            lower.match(/orientation\s*:\s*(portrait|landscape)/)?.[1]
                ?? null
        ) as Orientation | null

        return {
            minWidth: Number(Parser.parse(minWidth, vars) ?? 1),
            maxWidth: Number(Parser.parse(maxWidth, vars) ?? Number.MAX_VALUE),
            orientation,
        }
    }
}
