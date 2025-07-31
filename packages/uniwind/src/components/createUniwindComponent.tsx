import { useMemo } from 'react'
import { Dimensions, StyleProp, ViewStyle } from 'react-native'
import { resolveStyles } from './resolveStyles'

const getStylesRegistry = () => globalThis.__uniwind__ ?? {}

type UniwindComponentProps = {
    className?: string
    style?: StyleProp<ViewStyle>
}

export const createUniWindComponent = <T extends React.ComponentType<UniwindComponentProps>>(Component: T) => {
    return (props: React.ComponentProps<T>) => {
        const globalStyles = getStylesRegistry()
        const classNames = useMemo(() => {
            return props.className?.split(' ')
        }, [props.className])
        const styles = useMemo(() => {
            if (!classNames) {
                return undefined
            }

            return classNames.map(className => {
                return globalStyles[className]
            })
        }, [classNames, globalStyles])

        const dimensions = Dimensions.get('window')
        const windowWidth = dimensions.width
        const orientation = windowWidth > dimensions.height ? 'landscape' : 'portrait'
        const resolvedStyles = useMemo(() => {
            if (!styles) {
                return undefined
            }

            return resolveStyles(styles, windowWidth, orientation)
        }, [styles, windowWidth, orientation])

        return (
            // @ts-expect-error Generic component type
            <Component
                {...props}
                style={[
                    resolvedStyles,
                    props.style,
                ]}
            />
        )
    }
}
