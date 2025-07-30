import { Vars } from '../types'
import { UniwindParsingError } from '../utils'
import type { Parser as ParserType } from '.'
import { Rem } from './rem'
import { Var } from './var'

const VAR_RE = /^var\(--[^)]+\)$/
const PX_RE = /^-?\d*\.?\d+px$/
const REM_RE = /^-?\d*\.?\d+rem$/
const NUM_RE = /^-?\d*\.?\d+$/
const OP_RE = /^[+\-*/()]$/
const TOKEN_RE = /var\(--[^)]+\)|-?\d*\.?\d+(?:px|rem)?|[+\-*/()]/g

const handlers = {
    px: parseFloat,
    rem: v => Rem.parse(v),
    number: parseFloat,
    var: (v, vars, Parser: typeof ParserType) => {
        const varValue = Var.extractVar(v, vars, Parser)

        if (varValue === undefined) {
            return 0
        }

        return parseFloat(String(varValue))
    },
} satisfies Record<string, (value: string, vars: Vars, Parser: typeof ParserType) => number>

export class Calc {
    static parse(value: string, vars: Vars, Parser: typeof ParserType) {
        const tokens = value.match(TOKEN_RE)

        if (!tokens) {
            throw new UniwindParsingError(`Invalid calc() - ${value}`)
        }

        const jsExpr = tokens
            .map(token => {
                switch (true) {
                    case VAR_RE.test(token):
                        return handlers.var(token, vars, Parser)
                    case PX_RE.test(token):
                        return handlers.px(token)
                    case REM_RE.test(token):
                        return handlers.rem(token)
                    case NUM_RE.test(token):
                        return handlers.number(token)
                    case OP_RE.test(token):
                        return token
                    default:
                        throw new UniwindParsingError(`Invalid token in calc(): ${token}`)
                }
            })
            .join('')

        try {
            // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
            return Function(`"use strict"; return ${jsExpr}`)() as number
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)

            throw new UniwindParsingError('Invalid calc()')
        }
    }
}
