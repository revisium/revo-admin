import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  // Independent modules have their own import gate; FSD governs the application layers.
  { ignores: ['./src/modules/**'] },
  {
    files: ['./src/pages/**', './src/widgets/**', './src/features/**', './src/entities/**'],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  // The three DAG widgets legitimately share the "Graph" suffix; this is a naming
  // heuristic, not a structural rule (public-api / forbidden-imports stay on).
  { files: ['./src/features/**'], rules: { 'fsd/repetitive-naming': 'off' } },
])
