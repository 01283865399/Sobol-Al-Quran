import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import asar from '@electron/asar';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packageMetadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const outputDirectory = resolve(process.argv[2] || join(root, 'windows-app/release'));
const stagingDirectory = await mkdtemp(join(tmpdir(), 'sobul-quran-desktop-'));
const appDirectory = join(stagingDirectory, 'app');
const unpackedDirectory = join(stagingDirectory, 'win-unpacked');
const resourcesDirectory = join(unpackedDirectory, 'resources');

try {
  await mkdir(appDirectory, { recursive: true });
  await mkdir(resourcesDirectory, { recursive: true });
  await Promise.all([
    cp(join(root, 'windows-app/desktop'), join(appDirectory, 'desktop'), { recursive: true }),
    cp(join(root, 'dist'), join(appDirectory, 'dist'), { recursive: true }),
    cp(join(root, 'windows-app/dist-electron'), join(appDirectory, 'dist-electron'), { recursive: true }),
    cp(join(root, 'node_modules/electron/dist'), unpackedDirectory, { recursive: true }),
  ]);

  await writeFile(
    join(appDirectory, 'package.json'),
    JSON.stringify({
      name: 'sobul-quran',
      version: packageMetadata.version,
      description: packageMetadata.description,
      author: packageMetadata.author,
      main: 'desktop/main.cjs',
    })
  );
  await asar.createPackage(appDirectory, join(resourcesDirectory, 'app.asar'));
  await rename(
    join(unpackedDirectory, 'electron.exe'),
    join(unpackedDirectory, 'Sobul Quran.exe')
  );
  await mkdir(outputDirectory, { recursive: true });

  const electronBuilderCli = join(root, 'node_modules/electron-builder/cli.js');
  execFileSync(
    process.execPath,
    [
      electronBuilderCli,
      '--prepackaged',
      unpackedDirectory,
      '--win',
      'nsis',
      '--x64',
      `--config.directories.output=${outputDirectory.replace(/\\/g, '/')}`,
    ],
    { cwd: root, stdio: 'inherit' }
  );
} finally {
  await rm(stagingDirectory, { recursive: true, force: true });
}
