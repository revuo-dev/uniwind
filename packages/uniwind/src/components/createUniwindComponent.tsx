import { useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { resolveStyles } from './resolveStyles'
import { stylesheet } from './stylesheet'

type UniwindComponentProps = {
    className?: string
    style?: StyleProp<ViewStyle>
}

export const createUniWindComponent = <T extends React.ComponentType<UniwindComponentProps>>(Component: T) => {
    return (props: React.ComponentProps<T>) => {
        const classNames = useMemo(() => {
            return props.className?.split(' ')
        }, [props.className])
        const styles = useMemo(() => {
            if (!classNames) {
                return undefined
            }

            return classNames.map(className => {
                return stylesheet[className]
            })
        }, [classNames, stylesheet])

        const resolvedStyles = useMemo(() => {
            if (!styles) {
                return undefined
            }

            return resolveStyles(styles)
        }, [styles])

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
