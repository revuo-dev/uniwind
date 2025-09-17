import type { MetroConfig } from 'metro-config'

type UniwindConfig = {
    input: string
}

export declare function withUniwind(config: MetroConfig, options: UniwindConfig): MetroConfig
