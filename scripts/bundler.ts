import * as esbuild from 'esbuild';
import * as fflate from 'fflate';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

// const IN_DIR = './src/handlers';
// const OUT_DIR = './dist';

function bundle(entries: string[], outDir: string) {
  rimraf.rimrafSync(outDir);

  const options: esbuild.BuildOptions = {
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    outdir: outDir,
    entryPoints: entries,
    banner: {
      js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
  };

  esbuild.buildSync(options);
}

function compress(handlers: string[], outDir: string) {
  for (const handler of handlers) {
    const zipPath = `${outDir}/${handler}.zip`;

    const zipContent = fflate.zipSync({
      'index.mjs': fs.readFileSync(
        path.resolve(process.cwd(), outDir, `${handler}.js`),
      ),
    });

    fs.writeFileSync(zipPath, zipContent);
  }
}

const handlers = ['getUser', 'createUser'];

export type Config = {
  outDir: string;
  inDir: string;
};

export function build(config: Config) {
  const entries = handlers.map((h) => `${config.inDir}/${h}.ts`);

  bundle(entries, config.outDir);
  compress(handlers, config.outDir);
}
