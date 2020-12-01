import { build } from 'esbuild'
import { PnpResolver } from './plugin'

build({
    bundle: true,
    outdir: 'bundle',
    format: 'esm',
    target: 'es2017',
    entryPoints: ['./src/index.ts'],
    plugins: [PnpResolver()],
})
