import type { MetroConfig } from 'metro-config'

type UniwindConfig = {
    cssEntryFile: string
    themes?: Array<string>
    dtsFile?: string
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
