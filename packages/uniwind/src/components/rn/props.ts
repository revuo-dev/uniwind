import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native'

export type RNStyle = ViewStyle | TextStyle | ImageStyle

export type RNStylesProps =
    | 'style'
    | 'contentContainerStyle'
    | 'imageStyle'
    | 'ListFooterComponentStyle'
    | 'ListHeaderComponentStyle'
    | 'columnWrapperStyle'
export type RNClassNameProps = GetClassName<RNStylesProps>

type GetClassName<T extends string> = T extends `${infer S}Style` ? `${S}ClassName` : 'className'

export type UniwindComponentProps =
    & {
        [K in RNStylesProps]?: StyleProp<RNStyle>
    }
    & {
        [K in RNClassNameProps]?: string
    }
