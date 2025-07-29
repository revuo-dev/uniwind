import { useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

type StylesRegistry = Record<string, ViewStyle>

declare global {
    var __uniwind__: StylesRegistry | undefined
}

const getStylesRegistry = () => globalThis.__uniwind__ ?? {}

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
                return getStylesRegistry()[className]
            })
        }, [classNames])

        return (
            // @ts-expect-error Generic component type
            <Component
                {...props}
                style={[
                    styles,
                    props.style,
                ]}
            />
        )
    }
}
