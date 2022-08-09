/* eslint import/no-default-export: off */
import { join, resolve } from 'path'

import react from '@vitejs/plugin-react'

import type { UserConfig, ConfigEnv } from 'vite'

const srcRoot = join(__dirname, 'src')
const resolveAlias = {
  '/@': srcRoot,
  '@components': resolve(__dirname, 'src/components'),
  '@parts': resolve(__dirname, 'src/parts'),
  '@atoms': resolve(__dirname, 'src/atoms'),
  '@functions': resolve(__dirname, 'src/functions'),
  '@hooks': resolve(__dirname, 'src/hooks'),
  '@constants': resolve(__dirname, 'src/constants'),
  '@types': resolve(__dirname, 'types'),
}

export default ({ command }: ConfigEnv): UserConfig => {
  // DEV
  if (command === 'serve') {
    return {
      root: srcRoot,
      base: '/',
      plugins: [react()],
      resolve: {
        alias: resolveAlias,
      },
      build: {
        outDir: join(srcRoot, '/out'),
        emptyOutDir: true,
        rollupOptions: {},
      },
      server: {
        port: process.env.PORT === undefined ? 3000 : +process.env.PORT,
      },
      optimizeDeps: {
        exclude: ['path'],
      },
    }
  }
  // PROD
  return {
    root: srcRoot,
    base: './',
    plugins: [react()],
    resolve: {
      alias: resolveAlias,
    },
    build: {
      outDir: join(srcRoot, '/out'),
      emptyOutDir: true,
      rollupOptions: {},
    },
    server: {
      port: process.env.PORT === undefined ? 3000 : +process.env.PORT,
    },
    optimizeDeps: {
      exclude: ['path'],
    },
  }
}
