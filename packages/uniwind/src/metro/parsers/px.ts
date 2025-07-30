export class Px {
    static parse(value: string) {
        return parseFloat(value.replace('px', ''))
    }
}
