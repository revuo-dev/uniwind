import { formatRgb, parse } from 'culori'

const dummy = typeof document !== 'undefined'
    ? Object.assign(document.createElement('div'), {
        style: 'display: none',
    })
    : null

if (dummy) {
    document.body.appendChild(dummy)
}

export const getAccentColor = (className?: string) => {
    if (className === undefined) {
        return undefined
    }

    if (!dummy) {
        return ''
    }

    dummy.className = className

    const accentColor = window.getComputedStyle(dummy).accentColor
    const parsed = parse(accentColor)

    if (!parsed) {
        return accentColor
    }

    return formatRgb(parsed)
}
