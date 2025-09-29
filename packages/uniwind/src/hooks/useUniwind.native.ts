import { useEffect, useState } from 'react'
import { Uniwind } from '../core'
import { UniwindStore } from '../core/native'
import { StyleDependency } from '../types'

export const useUniwind = () => {
    const [theme, setTheme] = useState(Uniwind.currentTheme)

    useEffect(() => {
        const dispose = UniwindStore.subscribe(() => {
            setTheme(Uniwind.currentTheme)
        }, [StyleDependency.Theme])

        return () => {
            dispose()
        }
    }, [])

    return {
        theme,
    }
}
