import { CalcFor_DimensionPercentageFor_LengthValue, CalcFor_Length } from 'lightningcss'
import { Logger } from '../logger'
import type { ProcessorBuilder } from './processor'

export class Calc {
    private readonly logger = new Logger('Calc')

    constructor(private readonly Processor: ProcessorBuilder) {}

    processCalc(calc: CalcFor_DimensionPercentageFor_LengthValue | CalcFor_Length): string {
        switch (calc.type) {
            case 'sum': {
                const sum = calc.value.map(x => this.processCalc(x)).join(' + ')

                return sum.includes('%') ? this.tryPercentageEval(sum) : sum
            }
            case 'value':
                return this.Processor.CSS.processValue(calc.value)
            case 'function':
                return this.Processor.CSS.processValue(calc.value)
            case 'number':
                return String(calc.value)
            default:
                this.logger.error(`Unsupported calc type - ${calc.type}`)

                return ''
        }
    }

    tryPercentageEval(value: string) {
        try {
            const tokens = value.split(/[\s+-]+/)

            if (tokens.some(token => !token.includes('%'))) {
                this.logger.error(`Invalid calc, you can't mix percentage and non-percentage values`)

                return value
            }

            const numericValue = value.replace(/%/g, '')

            // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
            return new Function(`return ${numericValue} + '%'`)()
        } catch {
            this.logger.error(`Invalid calc ${value}`)

            return value
        }
    }
}
