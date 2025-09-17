import { compile } from '@tailwindcss/node'
import { ProcessorBuilder } from './processor'
import { addMetaToStylesTemplate, serializeStylesheet } from './stylesheet'
import { Platform } from './types'

type CompileVirtualConfig = {
    cssPath: string
    css: string
    candidates: Array<string>
    platform: Platform
}

export const compileVirtual = async ({ candidates, css, cssPath, platform }: CompileVirtualConfig) => {
    const compiler = await compile(css, {
        base: cssPath,
        onDependency: () => void 0,
    })
    const tailwindCSS = compiler.build(candidates)

    if (platform === Platform.Web) {
        return tailwindCSS
    }

    const Processor = new ProcessorBuilder()

    Processor.transform(tailwindCSS)

    return serializeStylesheet({ ...Processor.vars, ...addMetaToStylesTemplate(Processor, platform) })
}
