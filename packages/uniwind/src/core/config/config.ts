import { Appearance, Platform } from 'react-native'
import { ColorScheme, UniwindConfig } from '../../types'
import { themeChange } from './themeChange'

type UserThemes = UniwindConfig extends { themes: infer T extends ReadonlyArray<string> } ? T
    : ReadonlyArray<string>

export type ThemeName = UserThemes[number]

export type Config = {
    initialTheme?: ThemeName
    adaptiveThemes?: boolean
}

const SYSTEM_THEME = 'system' as const

class UniwindConfigBuilder {
    private hasAdaptiveThemes = true
    private colorScheme = Appearance.getColorScheme() ?? ColorScheme.Light
    #currentTheme = this.colorScheme as ThemeName

    constructor() {
        if (Platform.OS === 'web') {
            this.emitThemeChange()
        }

        Appearance.addChangeListener(event => {
            const colorScheme = event.colorScheme ?? ColorScheme.Light
            const prevTheme = this.#currentTheme

            if (this.hasAdaptiveThemes && prevTheme !== colorScheme) {
                this.#currentTheme = colorScheme
                this.emitThemeChange()
            }
        })
    }

    get currentTheme(): ThemeName {
        return this.#currentTheme
    }

    private get haveLightAndDarkThemes() {
        return this.themes.includes('light') && this.themes.includes('dark')
    }

    private get themes() {
        return globalThis.__uniwindThemes__ ?? ['light', 'dark']
    }

    configure(config: Config) {
        if (config.adaptiveThemes && !this.haveLightAndDarkThemes) {
            throw new Error(`Uniwind: You're trying to enable adaptive themes, but you did not register 'light' and 'dark' themes.`)
        }

        if (config.initialTheme !== undefined && config.adaptiveThemes) {
            throw new Error(`"Uniwind: You're trying to set initial theme and enable adaptiveThemes, but these options are mutually exclusive."`)
        }

        if (config.initialTheme !== undefined && !this.themes.includes(config.initialTheme)) {
            throw new Error(`Uniwind: You're trying to set '${config.initialTheme}' as initial theme, but it was not registered.`)
        }

        if (config.initialTheme === undefined && !config.adaptiveThemes && this.themes.length > 1) {
            throw new Error(`Uniwind: You need to set initial theme or enable adaptive themes.`)
        }

        if (config.initialTheme !== undefined) {
            this.#currentTheme = config.initialTheme
            this.emitThemeChange()
        }

        this.hasAdaptiveThemes = config.adaptiveThemes ?? false
    }

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    setTheme(theme: ThemeName | typeof SYSTEM_THEME) {
        if (theme === this.#currentTheme) {
            return
        }

        const prevTheme = this.#currentTheme

        if (theme === SYSTEM_THEME) {
            if (!this.haveLightAndDarkThemes) {
                throw new Error(`Uniwind: You're trying to setTheme to '${SYSTEM_THEME}', but you did not register 'light' and 'dark' themes.`)
            }

            this.hasAdaptiveThemes = true
            this.#currentTheme = this.colorScheme

            if (prevTheme !== this.#currentTheme) {
                this.emitThemeChange()
            }

            return
        }

        if (!this.themes.includes(theme)) {
            throw new Error(`Uniwind: You're trying to setTheme to '${theme}', but it was not registered.`)
        }

        this.hasAdaptiveThemes = false
        this.#currentTheme = theme

        if (prevTheme !== this.#currentTheme) {
            this.emitThemeChange()
        }
    }

    private emitThemeChange() {
        themeChange(this.#currentTheme, this.themes)
    }
}

export const Uniwind = new UniwindConfigBuilder()
