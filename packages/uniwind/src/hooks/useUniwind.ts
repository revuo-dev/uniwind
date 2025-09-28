import { useEffect, useState } from 'react'
import { UniwindStore } from '../core/native'
import { UniwindRuntime } from '../core/native/runtime'
import { StyleDependency } from '../types'

export const useUniwind = () => {
    const [theme, setTheme] = useState(UniwindRuntime.currentThemeName)

    useEffect(() => {
        const listner = UniwindStore.subscribe(() => {
            setTheme(UniwindRuntime.currentThemeName)
        }, [StyleDependency.Theme])

        return () => {
            listner()
        }
    }, [])

    return {
        theme,
    }
}
