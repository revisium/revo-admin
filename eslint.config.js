import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import eslintReact from '@eslint-react/eslint-plugin'
import globals from 'globals'

// Design-system architecture gates (see .superpowers/sdd/kit-architecture.md). Scoped to the new
// kit/components/entities/project/features/ProjectSearchToolbar code; the legacy prototype
// under src/pages, src/widgets, the rest of src/entities and src/features, and the flat
// src/shared/ui/* files is intentionally exempt.
const designSystemFiles = [
  'src/shared/ui/kit/**/*.{ts,tsx}',
  'src/shared/ui/components/**/*.{ts,tsx}',
  'src/entities/project/**/*.{ts,tsx}',
  'src/features/ProjectSearchToolbar/**/*.{ts,tsx}',
]

const chakraRecipeComponentRestriction = {
  name: '@chakra-ui/react',
  importNames: [
    'Button',
    'Input',
    'Textarea',
    'Link',
    'Card',
    'Badge',
    'Separator',
    'Breadcrumb',
    'Field',
    'EmptyState',
    'Skeleton',
    'Code',
    'Heading',
  ],
  message:
    "This name resolves a built-in Chakra recipe of the same name, layering Chakra's default appearance underneath this design system's. Use the kit component instead.",
}

const forbidComponentsImport = {
  group: [
    'src/shared/ui/components',
    'src/shared/ui/components/*',
    '../components',
    '../components/*',
    '../../components',
    '../../components/*',
  ],
  message: 'Import direction is one-way (components -> kit). This file may not import from src/shared/ui/components.',
}

const designSystemRestrictedSyntax = [
  {
    selector: "CallExpression[callee.name=/^use(Slot)?Recipe$/] > ObjectExpression > Property[key.name='key']",
    message:
      "useRecipe/useSlotRecipe with { key: '...' } resolves to SystemRecipeFn<{}, {}> for keys outside Chakra's generated config, so variant props come out untyped (this repo does not run chakra typegen). Use { recipe: xRecipe } instead, which infers them.",
  },
  {
    selector:
      'Literal[value=/^(brand\\.|status\\.|accent\\.|dot\\.|bg\\.inset$|border\\.(warmStrong|subtle)$|radii\\.(warmCard|chip|btn|modal)$|shadows\\.sh-|fg\\.[0-3]$|bg\\.[0-2]$|text\\.[1-4]$|neutral\\.|(regular|medium|semibold|bold)-)/]',
    message:
      'Legacy design token. This design system does not consume legacy brand/status/accent/dot/neutral/radii/shadows tokens.',
  },
  {
    selector:
      "MemberExpression[object.name='chakra'][property.name=/^(div|span|p|aside|main|header|footer|section|article|nav|hr|ul|ol|li|label|code|h[1-4])$/]",
    message:
      "This chakra.* element has a recipe-free primitive equivalent. Use Box, Flex, Text, or Text as='...' from '@chakra-ui/react' instead.",
  },
]

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjsPlugin.configs.recommended,
  eslintReact.configs['recommended-typescript'],
  prettierPlugin,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-magic-numbers': ['error', { ignore: [0, 1, -1, 404] }],
      'no-return-await': 'error',
      'no-implicit-coercion': 'error',
      'sonarjs/cognitive-complexity': ['error', 15],
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      '.sonar/**',
      '.scannerwork/**',
      'src/__generated__/**',
      'eslint.config.js',
    ],
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-magic-numbers': 'off',
      'sonarjs/no-hardcoded-credentials': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
    },
  },
  {
    files: ['src/shared/lib/hooks/useViewModel.ts'],
    rules: {
      '@eslint-react/rules-of-hooks': 'off',
    },
  },
  {
    // Static presentational fixtures and graph layout coordinates are data, not
    // logic. Literal numbers (token counts, costs, node positions) are expected.
    files: ['src/shared/fixtures/**/*.ts', '**/*.client.tsx'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },
  {
    files: designSystemFiles,
    rules: {
      'no-restricted-syntax': ['error', ...designSystemRestrictedSyntax],
    },
  },
  {
    files: [
      'src/shared/ui/components/**/*.{ts,tsx}',
      'src/entities/project/**/*.{ts,tsx}',
      'src/features/ProjectSearchToolbar/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { paths: [chakraRecipeComponentRestriction] }],
    },
  },
  {
    files: ['src/shared/ui/kit/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [chakraRecipeComponentRestriction],
          patterns: [forbidComponentsImport],
        },
      ],
    },
  },
]
