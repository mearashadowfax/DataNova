import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Mirror every `paths` alias from tsconfig.json so tests import like the app.
const { compilerOptions } = JSON.parse(
  readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf8')
) as { compilerOptions: { paths: Record<string, string[]> } };

const alias = Object.fromEntries(
  Object.entries(compilerOptions.paths).map(([key, [target]]) => [
    key.replace(/\/\*$/, ''),
    fileURLToPath(new URL(target.replace(/\/\*$/, ''), import.meta.url)),
  ])
);

export default defineConfig({
  resolve: { alias },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
