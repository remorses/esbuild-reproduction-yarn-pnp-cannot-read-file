import { build } from 'esbuild'
import { PnpResolver } from './plugin'
import { NodeResolvePlugin } from '@esbuild-plugins/all'

build({
    bundle: true,
    outdir: 'bundle',
    format: 'esm',
    splitting: true,
    metafile: 'meta.json',
    target: 'es2020',
    entryPoints: ['./src/index.ts'],
    loader: { '.png': 'file' },
    plugins: [
        NodeResolvePlugin({
            onResolved: (x) => {
                console.log({ x })
            },
            extensions: ['.png', '.ts', '.js'],
        }),
        {
            name: 'test',
            setup({ onLoad }) {
                onLoad({ filter: /\.png/ }, (args) => {
                    console.log({ args })
                    return null
                })
            },
        },
    ],
})
