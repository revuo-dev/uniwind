export class UniwindParsingError extends Error {
    constructor(message: string) {
        super(`Uniwind parsing error: ${message}`)
    }
}
