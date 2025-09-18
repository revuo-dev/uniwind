import { useEffect, useReducer } from 'react'
import { UniwindStore } from '../core/native'

export const useResolveClassNames = (className: string) => {
    const [uniwindState, recreate] = useReducer(
        () => UniwindStore.getStyles(className),
        UniwindStore.getStyles(className),
    )

    useEffect(() => {
        recreate()
    }, [className])

    useEffect(() => {
        const dispose = UniwindStore.subscribe(recreate, uniwindState.dependencies)

        return dispose
    }, [uniwindState.dependencies, className])

    return uniwindState.styles
}
