import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import postcssJS from 'postcss-js'
import { CSS, Mq, Parser } from './parsers'
import { StyleAcc, Vars } from './types'

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
                .reduce<StyleAcc>((stylesAcc, [styleKey, styleValue]) => {
                    if (styleKey.startsWith('@media') && typeof styleValue === 'object' && styleValue !== null) {
                        const { maxWidth, minWidth, orientation } = Mq.parse(styleKey, vars, Parser)
                        const mediaStyles = Object.entries(styleValue).map(([mqStyleKey, mqStyleValue]) => {
                            return CSS.toRN(mqStyleKey, Parser.parse(mqStyleValue, vars))
                        })

                        stylesAcc._entries.push(...mediaStyles)
                        stylesAcc.maxWidth = maxWidth
                        stylesAcc.minWidth = minWidth
                        stylesAcc.orientation = orientation

                        return stylesAcc
                    }

                    if (typeof styleValue !== 'string' && typeof styleValue !== 'number') {
                        return stylesAcc
                    }

                    const parsedStyle = Parser.parse(styleValue, vars)

                    if (parsedStyle !== undefined) {
                        stylesAcc._entries.push(CSS.toRN(styleKey, parsedStyle))
                    }

                    return stylesAcc
                }, { _entries: [], maxWidth: Number.MAX_VALUE, minWidth: 0, orientation: null })

            return [classKey.replace('.', '').replace(/\\/g, ''), parsedStyles]
        }),
    )

    return `globalThis.__uniwind__=${JSON.stringify(styles)}`
}
