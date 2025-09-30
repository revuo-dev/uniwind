const transforms = [
    'translateX',
    'translateY',
    'translateZ',
    'rotate',
    'rotateX',
    'rotateY',
    'rotateZ',
    'scaleX',
    'scaleY',
    'scaleZ',
    'skewX',
    'skewY',
    'perspective',
]

export const parseTransformsMutation = (styles: Record<string, any>) => {
    const transformTokens = typeof styles.transform === 'string'
        ? styles.transform
            .split(' ')
            .filter(token => token !== 'undefined')
        : []
    const transformsResult = transforms.reduce<Array<Record<string, any>>>((acc, transform) => {
        // Transforms inside transform - transform: rotate(45deg);
        transformTokens
            .filter(token => token.startsWith(transform))
            .forEach(token => {
                const transformValue = token.slice(transform.length + 1, -1)

                acc.push({ [transform]: transformValue })
            })

        // Transforms outside of transform - { rotate: '45deg' }
        if (styles[transform] !== undefined) {
            acc.push({ [transform]: styles[transform] })
            delete styles[transform]
        }

        return acc
    }, [])

    if (transformsResult.length > 0) {
        styles.transform = transformsResult
    }
}
