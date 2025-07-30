import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import postcssJS from 'postcss-js'
import { Parser } from './parsers'
import { Vars } from './types'

export const createStylesheets = async (input: string, scanner: Scanner) => {
    const cssPath = path.join(process.cwd(), input)
    const css = fs.readFileSync(cssPath, 'utf8')
    const candidates = scanner.scan()
    const compiler = await compile(css, {
        base: cssPath,
        onDependency: () => void 0,
    })
    const result = compiler.build(candidates)
    const root = postcss.parse(result)
    const cssTree = postcssJS.objectify(root as unknown as Parameters<typeof postcssJS.objectify>[0])
    const theme: Record<string, any> = cssTree['@layer theme'][':root, :host']
    const vars = Object.entries(theme).reduce<Vars>((varsAcc, [varName, value]) => {
        if (typeof value !== 'string') {
            varsAcc[varName] = value

            return varsAcc
        }

        const varValue = Parser.parse(value, varsAcc)

        if (varValue === undefined) {
            return varsAcc
        }

        if (typeof varValue === 'number' && varName.endsWith('--line-height')) {
            const fontSize = varsAcc[varName.replace('--line-height', '')] as number

            varsAcc[varName] = fontSize * varValue

            return varsAcc
        }

        varsAcc[varName] = varValue

        return varsAcc
    }, {})
    const classes: Record<string, any> = cssTree['@layer utilities']
    const styles = Object.fromEntries(
        Object.entries(classes).map(([classKey, styles]) => {
            const parsedStyles = Object.entries(styles)
                .reduce<Record<string, unknown>>((stylesAcc, [styleKey, styleValue]) => {
                    if (typeof styleValue !== 'string') {
                        stylesAcc[styleKey] = styleValue

                        return stylesAcc
                    }

                    const parsedStyle = Parser.parse(styleValue, vars)

                    if (parsedStyle !== undefined) {
                        stylesAcc[styleKey] = parsedStyle
                    }

                    return stylesAcc
                }, {})

            return [classKey.replace('.', ''), parsedStyles]
        }),
    )

    return `globalThis.__uniwind__=${JSON.stringify(styles)}`
}
