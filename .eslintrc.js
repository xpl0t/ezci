module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    "quotes": "off",
    "@typescript-eslint/quotes": [
      "warn",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],
    "@typescript-eslint/explicit-function-return-type": ["warn"],
    "@typescript-eslint/explicit-member-accessibility": ["warn"],
    "@typescript-eslint/no-require-imports": ["error"],
    "@typescript-eslint/prefer-nullish-coalescing": ["warn"],
    "brace-style": "off",
    "@typescript-eslint/brace-style": ["warn"]
  },
};
