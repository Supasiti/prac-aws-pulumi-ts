import * as esbuild from 'esbuild';
import * as fflate from 'fflate';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

const IN_DIR = './src/handlers';
const OUT_DIR = './dist';

function bundle(entries: string[]) {
  rimraf.rimrafSync(OUT_DIR);

  const options: esbuild.BuildOptions = {
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    outdir: OUT_DIR,
    entryPoints: entries,
    banner: {
      js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
  };

  esbuild.buildSync(options);
}

function compress(handlers: string[]) {
  for (const handler of handlers) {
    const zipPath = `${OUT_DIR}/${handler}.zip`;

    const zipContent = fflate.zipSync({
      'index.mjs': fs.readFileSync(
        path.resolve(process.cwd(), OUT_DIR, `${handler}.js`),
      ),
    });

    fs.writeFileSync(zipPath, zipContent);
  }
}

const handlers = ['getUser', 'createUser'];

function run() {
  const entries = handlers.map((h) => `${IN_DIR}/${h}.ts`);

  bundle(entries);
  compress(handlers);
}

run();
