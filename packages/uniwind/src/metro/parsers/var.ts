import { Vars } from '../types'
import type { Parser as ParserType } from '.'

export class Var {
    static parse(varName: string, vars: Vars, Parser: typeof ParserType) {
        const varValue = vars[varName]

        if (varValue === undefined) {
            return undefined
        }

        return Parser.parse(varValue, vars)
    }

    static extractVar(rawValue: string, vars: Vars, Parser: typeof ParserType) {
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
            return Parser.parse(unwrapped, vars)
        }

        const value = unwrapped.slice(0, splitIndex).trim()
        const varValue = Parser.parse(value, vars)

        if (varValue !== undefined) {
            return varValue
        }

        const defaultValue = unwrapped.slice(splitIndex + 1).trim()
        const defaultVarValue = Parser.parse(defaultValue, vars)

        return defaultVarValue
    }
}
