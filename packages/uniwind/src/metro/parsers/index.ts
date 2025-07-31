import { parse as parseColor } from 'culori'
import { Vars } from '../types'
import { Calc } from './calc'
import { Color } from './color'
import { Px } from './px'
import { Rem } from './rem'
import { Var } from './var'

export class Parser {
    static parse(value: string | number | undefined, vars: Vars): string | number | undefined {
        if (typeof value === 'number' || value === undefined) {
            return value
        }

        switch (true) {
            case value.startsWith('calc('):
                return Calc.parse(value, vars, this)
            case value.startsWith('var('):
                return Var.extractVar(value, vars, this)
            case value.startsWith('--'):
                return Var.parse(value, vars, this)
            case parseColor(value) !== undefined:
                return Color.rgba(value)
            case value.endsWith('px'):
                return Px.parse(value)
            case value.endsWith('rem'):
                return Rem.parse(value)
            default:
                return value
        }
    }
}
