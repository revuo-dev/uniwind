export class Rem {
    static parse(value: string) {
        return parseFloat(value.replace('rem', '')) * 14
    }
}
