import { build } from 'esbuild'
import { PnpResolver } from './plugin'

build({
    bundle: true,
    outdir: 'bundle',
    format: 'esm',
    splitting: true,
    metafile: 'meta.json',
    target: 'es2017',
    entryPoints: ['./src/index.ts'],
    plugins: [PnpResolver()],
})
