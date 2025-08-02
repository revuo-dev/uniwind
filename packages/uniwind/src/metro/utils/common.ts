export const toSafeString = (value: string) => `\`${value}\``

export const isDefined = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined

export const escapeDynamic = (str: string) =>
    str.replace(/"(vars|\()([^"]+)"/g, (match, type) => {
        switch (type) {
            case 'vars':
            case '(':
                return match.slice(1, -1)
            default:
                return match
        }
    })
