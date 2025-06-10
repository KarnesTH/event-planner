import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['node_modules', 'coverage'] },
  {
    files: ['**/*.{js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-console': 'error',
      'no-debugger': 'error',
    },
  },
]