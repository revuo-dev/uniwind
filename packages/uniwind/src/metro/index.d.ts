import type { MetroConfig } from 'metro-config'

type UniwindConfig = {
    input: string
    themes?: Array<string>
    dtsPath?: string
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
