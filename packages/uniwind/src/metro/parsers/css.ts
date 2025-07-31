const convertMap = {
    marginInline: (value: number) => ({
        marginHorizontal: value,
    }),
    marginBlock: (value: number) => ({
        marginVertical: value,
    }),
    paddingInline: (value: number) => ({
        paddingHorizontal: value,
    }),
    paddingBlock: (value: number) => ({
        paddingVertical: value,
    }),
    direction: (value: string) => ({
        writingDirection: value,
    }),
    borderBottomRightRadius: (value: number) => ({
        borderBottomEndRadius: value,
    }),
    borderBottomLeftRadius: (value: number) => ({
        borderBottomStartRadius: value,
    }),
    borderInlineEndColor: (value: string) => ({
        borderEndColor: value,
    }),
    borderInlineStartColor: (value: string) => ({
        borderStartColor: value,
    }),
    borderTopRightRadius: (value: number) => ({
        borderTopEndRadius: value,
    }),
    borderTopLeftRadius: (value: number) => ({
        borderTopStartRadius: value,
    }),
    borderInlineEndWidth: (value: number) => ({
        borderEndWidth: value,
    }),
    borderInlineStartWidth: (value: number) => ({
        borderStartWidth: value,
    }),
    right: (value: number) => ({
        end: value,
    }),
    left: (value: number) => ({
        start: value,
    }),
    marginRight: (value: number) => ({
        marginEnd: value,
    }),
    marginLeft: (value: number) => ({
        marginStart: value,
    }),
    paddingRight: (value: number) => ({
        paddingEnd: value,
    }),
    paddingLeft: (value: number) => ({
        paddingStart: value,
    }),
    transform: (value: string) => ({
        transformMatrix: value.slice(7, -1).split(',').map(parseFloat),
    }),
    backgroundSize: (value: string) => ({
        resizeMode: value,
    }),
} as Record<PropertyKey, (value: any) => Record<string, any>>

export class CSS {
    static toRN(key: string, value: any): [string, unknown] {
        const resolver = convertMap[key]

        if (!resolver) {
            return [key, value]
        }

        const result = resolver(value)

        return Object.entries(result)[0] ?? [key, value]
    }
}
