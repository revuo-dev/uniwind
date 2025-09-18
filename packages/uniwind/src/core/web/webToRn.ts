import { RNStyle } from '../types'
import { formatColor } from './formatColor'

const keyInObject = <T extends object>(key: any, obj: T): key is keyof T => key in obj

export const webToRN = (styles: CSSStyleDeclaration) => {
    return new Proxy(styles as unknown as RNStyle, {
        get: (target, prop) => {
            return convertWebToRN(prop as keyof RNStyle, target as unknown as CSSStyleDeclaration)
        },
    })
}

const convertWebToRN = (prop: keyof RNStyle, target: CSSStyleDeclaration): RNStyle[keyof RNStyle] => {
    const value = convertProp(prop, target)

    return convertValue(value)
}

const convertValue = (value: any): any => {
    if (typeof value !== 'string') {
        return value
    }

    if (typeof value === 'number') {
        return value
    }

    if (value.endsWith('px')) {
        return Number(value.replace('px', ''))
    }

    return formatColor(value) ?? value
}

const convertProp = (prop: keyof RNStyle, target: CSSStyleDeclaration): RNStyle[keyof RNStyle] => {
    switch (prop) {
        // TODO: Convert more props
        case 'paddingHorizontal':
            return target.paddingInline
        case 'paddingVertical':
            return target.paddingBlock
        case 'marginHorizontal':
            return target.marginInline
        case 'marginVertical':
            return target.marginBlock
        default:
            return keyInObject(prop, target) ? target[prop] : undefined
    }
}
