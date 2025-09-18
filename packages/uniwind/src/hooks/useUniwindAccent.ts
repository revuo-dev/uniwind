import { formatColor } from '../core/web/formatColor'
import { useResolveClassNames } from './useResolveClassNames'

export const useUniwindAccent = (className: string | undefined) => {
    const styles = useResolveClassNames(className ?? '')

    return styles.accentColor !== undefined
        ? formatColor(styles.accentColor)
        : undefined
}
