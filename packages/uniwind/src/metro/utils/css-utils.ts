import { processVarsRec } from './var-utils'

export const processCSSValue = (value: string) => {
    const replacedUnits = value
        .replace(/(\d+(?:\.\d+)?)(vw|vh|px|rem)/g, (match, value, unit) => {
            switch (unit) {
                case 'vw':
                    return `(${value} * rt.screenWidth / 100)`
                case 'vh':
                    return `(${value} * rt.screenHeight / 100)`
                case 'px':
                    return value
                case 'rem':
                    return `(${value} * rt.rem)`
                default:
                    return match
            }
        })
        .replace('calc', '')

    return processVarsRec(replacedUnits)
}

const cssToRNKeyMap = {
    marginInline: 'marginHorizontal',
    marginBlock: 'marginVertical',
    paddingInline: 'paddingHorizontal',
    paddingBlock: 'paddingVertical',
    direction: 'writingDirection',
    borderBottomRightRadius: 'borderBottomEndRadius',
    borderBottomLeftRadius: 'borderBottomStartRadius',
    borderInlineEndColor: 'borderEndColor',
    borderInlineStartColor: 'borderStartColor',
    borderTopRightRadius: 'borderTopEndRadius',
    borderTopLeftRadius: 'borderTopStartRadius',
    borderInlineEndWidth: 'borderEndWidth',
    borderInlineStartWidth: 'borderStartWidth',
    right: 'end',
    left: 'start',
    marginRight: 'marginEnd',
    marginLeft: 'marginStart',
    paddingRight: 'paddingEnd',
    paddingLeft: 'paddingStart',
    transform: 'transformMatrix',
    backgroundSize: 'resizeMode',
} as Record<string, string>

const cssToRNValueMap = {
    transform: (value: string) => {
        if (value.startsWith('matrix(')) {
            return value.slice(7, -1).split(',').map(parseFloat)
        }

        return value
    },
} as Record<string, (value: any) => any>

export const cssToRN = (property: string, value: any) => {
    const rnKey = cssToRNKeyMap[property] ?? property
    const rnValue = cssToRNValueMap[property]?.(value) ?? value

    return [rnKey, rnValue] as [string, unknown]
}
