import fs from 'fs'
import path from 'path'
import { generateCSSForInsets } from './insets'
import { generateCSSForThemes } from './themes'
import { generateCSSForVariants } from './variants'

export const buildCSS = (themes: Array<string>, input: string) => {
    const variants = generateCSSForVariants()
    const insets = generateCSSForInsets()
    const themesCSS = generateCSSForThemes(themes, input)
    const cssFile = path.join(__dirname, '../../uniwind.css')

    fs.writeFileSync(
        cssFile,
        [
            variants,
            insets,
            themesCSS,
        ].join('\n'),
    )
}
