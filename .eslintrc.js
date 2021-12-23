module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {jsx: true},
    ecmaVersion: 12,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'unused-imports', 'prettier'],
  rules: {
    'no-console': 'warn',
    'no-multiple-empty-lines': 1,
    'no-param-reassign': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-useless-escape': 'off',
    'no-unused-expressions': 'off', // prevents basic use of React exports such as in App.tsx
    // Disabled old no-shadow rule as seems to be communicated by ESLint while working with TS.
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-shadow.md
    'no-shadow': 'off',
    'no-nested-ternary': 'off',
    'no-implicit-coercion': [
      'error',
      {
        boolean: true,
        number: true,
        string: true,
      },
    ],
    'arrow-body-style': 'off', // warn
    'arrow-parens': 'off', // warn
    'comma-dangle': 'off',
    'consistent-return': 'off',
    'dot-notation': 'off', // required for our env variables currently
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off', // cannot control what we import from standard libs
    'import/no-unresolved': 'off', // typescript
    'import/extensions': 'off', // don't micromanage pretty imports
    'lines-between-class-members': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'prefer-destructuring': 'off',
    'prefer-const': 'off',
    'require-yield': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
    'space-in-brackets': 'off',
    semi: 'error',
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-empty-function': ['warn'],
    '@typescript-eslint/no-empty-interface': ['warn'],
    '@typescript-eslint/no-for-in-array': ['warn'],
    '@typescript-eslint/no-inferrable-types': ['warn'],
    '@typescript-eslint/no-misused-new': ['warn'],
    '@typescript-eslint/no-this-alias': ['warn'],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['warn'],
    '@typescript-eslint/no-unnecessary-condition': ['warn'],
    '@typescript-eslint/no-unnecessary-type-assertion': ['warn'],
    '@typescript-eslint/no-unnecessary-type-constraint': ['warn'],
    '@typescript-eslint/no-implied-eval': ['error'],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: ['variable'],
        types: ['boolean'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'does'],
      },
    ],
    '@typescript-eslint/prefer-literal-enum-member': ['warn'],
    '@typescript-eslint/prefer-optional-chain': ['warn'],
    '@typescript-eslint/restrict-plus-operands': ['warn'],
    '@typescript-eslint/restrict-template-expressions': ['warn'],
    // React rules
    'react/jsx-no-target-blank': 'warn', // target="_blank" without rel="noreferrer" is a security risk: see https://html.spec.whatwg.org/multipage/links.html#link-type-noopener  react/jsx-no-target-blank
    'react/prop-types': 'off', // this doesn't allow us to use React.FC<>
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 0,
    'react/jsx-max-props-per-line': [1, {maximum: 1, when: 'multiline'}],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [2, {extensions: ['.js', '.jsx', '.ts', '.tsx']}], // Make ESLint happy about JSX inside of tsx files
    'react/destructuring-assignment': ['warn', 'always', {ignoreClassFields: true}],
    'react/boolean-prop-naming': ['error', {rule: '^(is|has|does|should)[A-Z]([A-Za-z0-9]?)+'}],
    'react/no-array-index-key': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    // Accessibility off for now to make speed a priority and avoid restructuring for now
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        controlComponents: ['Select'],
        assert: 'either',
        depth: 3,
      },
    ],
  },
  ignorePatterns: ['package.json', './node_modules', './dist', '**/dist/*.js'],
};
