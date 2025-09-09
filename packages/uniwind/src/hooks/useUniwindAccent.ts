import { useEffect, useState } from 'react'
import { CSSListener } from '../core/cssListener'
import { getAccentColor } from '../core/getAccentColor'

type UseUniwindAccent = {
    (className: string): string
    (className: string | undefined): string | undefined
}

export const useUniwindAccent: UseUniwindAccent = className => {
    const [accentColor, setAccentColor] = useState(() => getAccentColor(className))

    useEffect(() => {
        if (className === undefined) {
            return
        }

        setAccentColor(getAccentColor(className))

        const dispose = CSSListener.addListener(className.split(' '), () => setAccentColor(getAccentColor(className)))

        return dispose
    }, [className])

    return accentColor as string
}
