import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { toRNWClassName } from './rnw'

export const RefreshControl = copyComponentProperties(RNRefreshControl, (props: RefreshControlProps) => {
    const color = useUniwindAccent(props.colorsClassName)
    const tintColor = useUniwindAccent(props.tintColorClassName)
    const titleColor = useUniwindAccent(props.titleColorClassName)
    const progressBackgroundColor = useUniwindAccent(props.progressBackgroundColorClassName)

    return (
        <RNRefreshControl
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            colors={color !== undefined ? [color] : props.colors}
            tintColor={tintColor ?? props.tintColor}
            titleColor={titleColor ?? props.titleColor}
            progressBackgroundColor={progressBackgroundColor ?? props.progressBackgroundColor}
        />
    )
})
