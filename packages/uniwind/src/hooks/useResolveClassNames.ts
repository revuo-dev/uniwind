import { useEffect, useReducer } from 'react'
import { CSSListener, getWebStyles } from '../core/web'

export const useResolveClassNames = (className: string) => {
    const [styles, recreate] = useReducer(
        () => getWebStyles(className),
        getWebStyles(className),
    )

    useEffect(() => {
        recreate()

        const dispose = CSSListener.addListener(className, recreate)

        return dispose
    }, [className])

    return styles
}
