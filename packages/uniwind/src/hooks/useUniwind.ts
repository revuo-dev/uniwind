import { useEffect, useState } from 'react'
import { ThemeName, Uniwind } from '../core'
import { CSSListener } from '../core/web'

export const useUniwind = () => {
    const [theme, setTheme] = useState(Uniwind.currentTheme)

    useEffect(() => {
        const dispose = CSSListener.addThemeListener(() => setTheme(Uniwind.currentTheme))

        return () => {
            dispose()
        }
    }, [])

    return {
        theme: theme as ThemeName,
    }
}
