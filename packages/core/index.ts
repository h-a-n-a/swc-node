import {
  transform as swcTransform,
  transformSync as swcTransformSync,
  Options as SwcOptions,
  ReactConfig,
  Config,
  JscTarget,
} from '@swc/core'

export interface Options {
  target?: JscTarget
  module?: 'commonjs' | 'umd' | 'amd' | 'es6'
  sourcemap?: Config['sourceMaps']
  jsx?: boolean
  experimentalDecorators?: boolean
  emitDecoratorMetadata?: boolean
  dynamicImport?: boolean
  esModuleInterop?: boolean
  keepClassNames?: boolean
  react?: Partial<ReactConfig>
}

function transformOption(path: string, options?: Options, jest = false): SwcOptions {
  const opts = options == null ? {} : options
  opts.esModuleInterop = opts.esModuleInterop ?? true
  return {
    filename: path,
    jsc: {
      target: opts.target ?? 'es2018',
      parser: {
        syntax: 'typescript' as const,
        tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
        decorators: Boolean(opts.experimentalDecorators),
        dynamicImport: Boolean(opts.dynamicImport),
      },
      transform: {
        legacyDecorator: Boolean(opts.experimentalDecorators),
        decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
        react: options?.react,
        hidden: {
          jest,
        },
      },
      keepClassNames: opts.keepClassNames,
    },
    minify: false,
    isModule: true,
    module: {
      type: 'commonjs',
      noInterop: !opts.esModuleInterop,
    },
    sourceMaps: typeof opts.sourcemap === 'undefined' ? true : opts.sourcemap,
    swcrc: false,
  }
}

export function transformSync(source: string, path: string, options?: Options) {
  return swcTransformSync(source, transformOption(path, options))
}

export function transformJest(source: string, path: string, options?: Options) {
  return swcTransformSync(source, transformOption(path, options, true))
}

export function transform(source: string, path: string, options?: Options) {
  return swcTransform(source, transformOption(path, options))
}
