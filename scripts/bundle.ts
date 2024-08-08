import { build } from './bundler.js';

const config = {
  outDir: './dist',
  inDir: './src/handlers',
};

build(config);
