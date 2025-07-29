import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { converter, formatRgb, parse } from 'culori'
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import postcssJS from 'postcss-js'

const oklchToRgba = (oklchString: string) => {
    const parsedColor = parse(oklchString)

    if (!parsedColor) {
        return null
    }

    if (parsedColor.mode !== 'oklch') {
        return null
    }

    const toRgb = converter('rgb')
    const rgbColor = toRgb(parsedColor)

    return formatRgb(rgbColor)
}

const parseFontSize = (value: string) => {
    const remSize = Number(value.replace('rem', ''))

    return remSize * 16
}

const parseLineHeight = (value: string, fontSize: number) => {
    // eslint-disable-next-line no-eval
    const result = (0, eval)(value.replace('calc(', '').replace(')', ''))

    return result * fontSize
}

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
    const cssTree = postcssJS.objectify(root)
    const theme: Record<string, any> = cssTree['@layer theme'][':root, :host']
    const vars: Record<string, string> = Object.fromEntries(
        Object.entries(theme).map(([key, value]) => {
            if (typeof value !== 'string') {
                return [key, value]
            }

            if (key.startsWith('--color')) {
                return [key, oklchToRgba(value)]
            }

            if (key.startsWith('--text')) {
                const fontSizeValue = theme[key.replace('--line-height', '')]
                const fontSize = parseFontSize(String(fontSizeValue))

                return [
                    key,
                    key.endsWith('--line-height')
                        ? parseLineHeight(value, fontSize)
                        : fontSize,
                ]
            }

            return [key, value]
        }),
    )
    const classes: Record<string, any> = cssTree['@layer utilities']
    const styles = Object.fromEntries(
        Object.entries(classes).map(([key, value]) => {
            if (typeof value !== 'object' || value === null) {
                return [key, value]
            }

            const parsedStyles = Object.fromEntries(
                Object.entries(value as object).map(([styleKey, styleValue]) => {
                    const getStyleValue = () => {
                        if (typeof styleValue !== 'string') {
                            return String(styleValue)
                        }

                        if (styleValue.startsWith('var(')) {
                            const varKey = styleValue.startsWith('var(--tw-leading')
                                ? styleValue.replace('var(--tw-leading, var(', '').replace('))', '')
                                : styleValue.replace('var(', '').replace(')', '')
                            const varValue = vars[varKey]

                            return varValue
                        }

                        return styleValue
                    }

                    return [
                        styleKey,
                        getStyleValue(),
                    ]
                }),
            )

            return [key.replace('.', ''), parsedStyles]
        }),
    )

    return `globalThis.__uniwind__=${JSON.stringify(styles)}`
}
