import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(process.cwd());
const outputDirectory = resolve(root, 'windows-app/dist-electron/functions');

await rm(resolve(root, 'windows-app/dist-electron'), { recursive: true, force: true });

await build({
  entryPoints: {
    chat: resolve(root, 'netlify/functions/chat.ts'),
    radio: resolve(root, 'netlify/functions/radio.ts'),
    media: resolve(root, 'netlify/functions/media.ts'),
  },
  outdir: outputDirectory,
  entryNames: '[name]',
  outExtension: {
    '.js': '.cjs',
  },
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  alias: {
    '@': root,
  },
});
