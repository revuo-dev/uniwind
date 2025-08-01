import './rnw'
import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

type UniwindComponentProps = {
    className?: string
    style?: StyleProp<ViewStyle>
}

export const createUniWindComponent = <T extends React.ComponentType<UniwindComponentProps>>(Component: T) => {
    return (props: React.ComponentProps<T>) => {
        return (
            // @ts-expect-error Generic component type
            <Component
                {...props}
                style={[
                    { $$css: true, tailwind: props.className },
                    props.style,
                ]}
            />
        )
    }
}
