import { useSyncExternalStore } from 'react'
import { RNStylesProps, UniwindComponentProps } from '../props'
import { UniwindStore } from './store'

export const createUniwindComponent = (
    Component: React.ComponentType<any>,
    additionalStyles?: Array<RNStylesProps>,
) => {
    return (props: UniwindComponentProps) => {
        const uniwindState = useSyncExternalStore(
            subscribe => UniwindStore.subscribe(subscribe),
            () => UniwindStore.getSnapshot(props, additionalStyles),
        )

        return (
            <Component
                {...props}
                {...uniwindState.dynamicStyles}
            />
        )
    }
}
