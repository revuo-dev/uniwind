import { StyleDependency } from '../../types'
import { Processor } from '../processor'
import { Platform, StylesTemplate } from '../types'
import { isDefined } from '../utils'

export const addMetaToStylesTemplate = (styles: StylesTemplate, currentPlatform: Platform) => {
    const stylesheetsEntries = Object.entries(styles)
        .map(([className, styles]) => {
            const entries = Object.entries(styles)
                .filter(([property]) => {
                    return !['minWidth', 'maxWidth'].includes(property)
                })
                .flatMap(([property, value]) => Processor.RN.cssToRN(property, value))

            const { colorScheme, orientation, platform, rtl } = Processor.MQ.extractResolvers(className)

            if (platform && platform !== Platform.Native && platform !== currentPlatform) {
                return null
            }

            const stylesUsingVariables: Record<string, string> = {}
            const inlineVariables: Array<[string, string]> = []
            const dependencies: Array<StyleDependency> = []

            const filteredEntries = entries
                .filter(([property, value]) => {
                    if (property.startsWith('--')) {
                        inlineVariables.push([property, `() => ${typeof value === 'object' ? JSON.stringify(value) : value}`])

                        return false
                    }

                    const stringifiedValue = JSON.stringify(value)

                    if (stringifiedValue.includes('this')) {
                        stylesUsingVariables[property] = className
                    }

                    return true
                })

            const stringifiedEntries = JSON.stringify(filteredEntries)

            if (colorScheme !== null) {
                dependencies.push(StyleDependency.ColorScheme)
            }

            if (orientation !== null) {
                dependencies.push(StyleDependency.Orientation)
            }

            if (rtl !== null) {
                dependencies.push(StyleDependency.Rtl)
            }

            if (Number(styles.minWidth) !== 0 || Number(styles.maxWidth) !== Number.MAX_VALUE || stringifiedEntries.includes('rt.screen')) {
                dependencies.push(StyleDependency.Dimensions)
            }

            if (stringifiedEntries.includes('rt.insets')) {
                dependencies.push(StyleDependency.Insets)
            }

            if (stringifiedEntries.includes('rt.rem')) {
                dependencies.push(StyleDependency.FontScale)
            }

            return [
                className,
                {
                    entries: filteredEntries,
                    minWidth: styles.minWidth,
                    maxWidth: styles.maxWidth,
                    colorScheme,
                    orientation,
                    rtl,
                    native: platform !== null,
                    stylesUsingVariables,
                    inlineVariables,
                    dependencies,
                },
            ] as const
        })
        .filter(isDefined)
    const stylesheets = Object.fromEntries(stylesheetsEntries) as Record<string, any>

    return stylesheets
}
