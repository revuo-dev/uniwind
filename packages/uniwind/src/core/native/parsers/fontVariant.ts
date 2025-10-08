export const parseFontVariant = (fontVariant: string) =>
    fontVariant
        .split(' ').filter(token => token !== 'undefined')
