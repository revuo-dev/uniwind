import { RNStyle } from '../types'
import { webToRN } from './webToRn'

const dummy = typeof document !== 'undefined'
    ? Object.assign(document.createElement('div'), {
        style: 'display: none',
    })
    : null

if (dummy) {
    document.body.appendChild(dummy)
}

export const getWebStyles = (className?: string): RNStyle => {
    if (className === undefined) {
        return {}
    }

    if (!dummy) {
        return {}
    }

    dummy.className = className

    return webToRN(window.getComputedStyle(dummy))
}
