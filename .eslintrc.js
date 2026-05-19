module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  extends: ['react-app', 'react-app/jest', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-namespace': 'warn',
    'prefer-const': 'warn',
    'import/first': 'warn',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/setupTests.*', '**/__test__/**', '**/__tests__/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'testing-library/prefer-screen-queries': 'warn',
        'testing-library/no-wait-for-multiple-assertions': 'warn',
        'testing-library/no-wait-for-side-effects': 'warn',
        'testing-library/no-node-access': 'warn',
        'testing-library/no-unnecessary-act': 'warn',
        'testing-library/no-container': 'warn',
        'testing-library/prefer-presence-queries': 'warn',
        'jest/no-conditional-expect': 'warn',
      },
    },
  ],
};
