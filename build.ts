import { build, Plugin } from 'esbuild'
import path from 'path'
import fs from 'fs'
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
    return {
        name: 'custom-resolver',
        setup: function setup({ onLoad, onResolve }) {
            onLoad({ filter: /.*/, namespace: 'pnp' }, async (args) => {
                const contents = await (
                    await fs.promises.readFile(args.path)
                ).toString()
                let resolveDir = path.dirname(args.path)
                console.log({ resolveDir })
                return {
                    loader: 'default',
                    contents,
                    resolveDir,
                    // errors: [{ text: resolveDir }],
                }
            })
            onResolve({ filter: /.*/, namespace: 'pnp' }, (args) => {
                return {
                    path: args.path,
                    namespace: 'pnp',
                }
            })
            onResolve({ filter: /.*/ }, (args) => {
                if (args.path.startsWith('.')) {
                    // console.log(`skipped ${args.path}`)
                    return
                }

                const resolved = resolve.sync(args.path, {
                    basedir: args.resolveDir,
                })

                if (!resolved) {
                    return {
                        errors: [{ text: 'could not resolve ' + args.path }],
                    }
                }
                return {
                    path: resolved,
                    namespace: 'pnp',
                }
            })
        },
    }
}
