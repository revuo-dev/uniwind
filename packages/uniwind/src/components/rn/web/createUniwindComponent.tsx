import './rnw'
import React from 'react'
import { copyComponentProperties } from '../../utils'
import { RNClassNameProps, RNStylesProps, UniwindComponentProps } from '../props'

type TailwindRNStyle = {
    $$cssTrue: true
    tailwind: string | undefined
}

type AdditionalClasses = Record<string, [TailwindRNStyle, any]>

export const createUniwindComponent = (
    Component: React.ComponentType<any>,
    additionalStyles?: Array<RNStylesProps>,
) => {
    const UniwindComponent = (props: UniwindComponentProps) => {
        return (
            <Component
                {...props}
                style={[
                    { $$css: true, tailwind: props.className },
                    props.style,
                ]}
                {...additionalStyles?.reduce<AdditionalClasses>((acc, styleProp) => {
                    acc[styleProp] = [
                        {
                            $$cssTrue: true,
                            tailwind: props[styleProp.replace('Style', 'ClassName') as RNClassNameProps],
                        },
                        props[styleProp],
                    ]

                    return acc
                }, {})}
            />
        )
    }

    return copyComponentProperties(Component, UniwindComponent)
}
