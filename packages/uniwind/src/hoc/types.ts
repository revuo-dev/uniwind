import { RNStyle } from '../core/types'

export type AnyObject = Record<PropertyKey, any>

type StyleToClass<K extends PropertyKey> = K extends 'style' ? 'className'
    : K extends `${infer StyleProp}Style` ? `${StyleProp}ClassName`
    : never

type ColorPropToClass<K extends PropertyKey> = K extends 'color' ? 'colorClassName'
    : K extends `${string}Color` | `${string}color${string}` ? `${K}ClassName`
    : never

type ApplyUniwind<TProps extends AnyObject> =
    & {
        [K in keyof TProps as StyleToClass<K>]?: string
    }
    & {
        [K in keyof TProps as ColorPropToClass<K>]?: string
    }
    & TProps

type ApplyUniwindOptions<TProps extends AnyObject, TOptions extends { [K in keyof TProps]?: OptionMapping }> =
    & {
        // @ts-expect-error TS isn't smart enough to infer this
        [K in keyof TOptions as TOptions[K] extends undefined ? never : TOptions[K]['fromClassName']]?: string
    }
    & TProps

export type Component<T extends AnyObject> = React.JSXElementConstructor<T>

export type OptionMapping = {
    fromClassName: string
    styleProperty?: keyof RNStyle
}

export type WithUniwind = {
    // Auto mapping
    <TProps extends AnyObject>(Component: Component<TProps>): (props: ApplyUniwind<TProps> & {}) => React.ReactNode
    // Manual mapping
    <TProps extends AnyObject, const TOptions extends { [K in keyof TProps]?: OptionMapping }>(
        Component: Component<TProps>,
        options: TOptions,
    ): (props: ApplyUniwindOptions<TProps, TOptions> & {}) => React.ReactNode
}
