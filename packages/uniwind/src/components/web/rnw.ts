import '../../core/config'
import './uniwind-metro-injected'

const moveCssRulesToUtilitiesLayer = (sourceSheet: CSSStyleSheet) => {
    const layerRuleIndex = sourceSheet.insertRule(
        '@layer rnw {}',
        0,
    )
    const layerRule = sourceSheet.cssRules[layerRuleIndex] as CSSGroupingRule

    while (sourceSheet.cssRules.length > 1) {
        const nextRule = sourceSheet.cssRules[1]!

        layerRule.insertRule(nextRule.cssText, layerRule.cssRules.length)
        sourceSheet.deleteRule(1)
    }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const rnwStyleSheet = document.querySelector<HTMLStyleElement>('#react-native-stylesheet')

    if (rnwStyleSheet?.sheet) {
        moveCssRulesToUtilitiesLayer(rnwStyleSheet.sheet)
    }
}

export const toRNWClassName = (className?: string): {} =>
    className !== undefined
        ? ({ $$css: true, tailwind: className })
        : {}
