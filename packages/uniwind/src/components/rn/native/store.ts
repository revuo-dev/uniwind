import { UniwindRuntime } from '../../runtime'
import { RNClassNameProps, RNStyle, RNStylesProps, UniwindComponentProps } from '../props'
import { resolveStyles } from './resolveStyles'

export class UniwindStoreBuilder {
    vars = globalThis.__uniwind__getVars(UniwindRuntime)
    stylesheets = globalThis.__uniwind__computeStylesheet(UniwindRuntime, this.vars)
    listeners = new Set<() => void>()
    styleCache = new Map<string, RNStyle>()

    constructor() {}

    subscribe(onStoreChange: () => void) {
        const listener = () => {
            onStoreChange()
        }

        return () => this.listeners.delete(listener)
    }

    getStyles(className: string) {
        const cached = this.styleCache.get(className)

        if (cached) {
            return cached
        }

        const styles = className
            .split(' ')
            .map(className => this.stylesheets[className])
        const style = resolveStyles(styles)

        this.styleCache.set(className, style)

        return style
    }

    getSnapshot(props: UniwindComponentProps, additionalStyles?: Array<RNStylesProps>) {
        return {
            dynamicStyles: {
                style: [
                    this.getStyles(props.className ?? ''),
                    props.style,
                ],
                ...additionalStyles?.reduce((acc, styleProp) => {
                    acc[styleProp] = [
                        this.getStyles(props[styleProp.replace('Style', 'ClassName') as RNClassNameProps] ?? ''),
                        props[styleProp],
                    ]

                    return acc
                }, {} as Record<RNStylesProps, [RNStyle, unknown]>),
            },
        }
    }

    reload = () => {
        this.vars = globalThis.__uniwind__getVars(UniwindRuntime)
        this.stylesheets = globalThis.__uniwind__computeStylesheet(UniwindRuntime, this.vars)
        this.listeners.forEach(listener => listener())
        this.styleCache.clear()
    }
}

export const UniwindStore = new UniwindStoreBuilder()

if (__DEV__) {
    globalThis.__uniwind__hot_reload = () => {
        UniwindStore.reload()
    }
}
