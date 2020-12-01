import { build, OnResolveArgs, Plugin } from 'esbuild'
import path from 'path'
import fs from 'fs'
import builtins from 'builtin-modules'
import resolve from 'resolve'

build({
    bundle: true,
    outdir: 'bundle',
    format: 'esm',
    target: 'es2017',
    entryPoints: ['./src/index.ts'],
    plugins: [PnpResolver()],
})

export function PnpResolver(): Plugin {
    const builtinsSet = new Set(builtins)
    return {
        name: 'custom-resolver',
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: 'pnp' }, async (args) => {
                const contents = await (
                    await fs.promises.readFile(args.path)
                ).toString()
                let resolveDir = path.dirname(args.path)
                // console.log({ resolveDir })
                return {
                    loader: 'js',
                    contents,
                    resolveDir,
                    // errors: [{ text: resolveDir }],
                }
            })
            onLoad({ filter: /.*/, namespace: 'builtins' }, (args) => {
                console.info('mocking ' + args.path)
                return {
                    loader: 'js',
                    contents: 'module.exports = {}',
                }
            })
            const resolver = (args: OnResolveArgs) => {
                if (builtinsSet.has(args.path)) {
                    return {
                        namespace: 'builtins',
                        path: args.path,
                        // external: true,
                    }
                }
                const resolved = resolve.sync(args.path, {
                    basedir: args.resolveDir,
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
                })

                if (!resolved) {
                    return {
                        external: true,
                        errors: [{ text: 'could not resolve ' + args.path }],
                    }
                }
                return {
                    path: resolved,
                    namespace: 'pnp',
                }
            }
            onResolve({ filter: /.*/ }, resolver)

            // onResolve({ filter: /.*/, namespace: 'pnp' }, resolver)
        },
    }
}
