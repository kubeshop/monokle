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
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'unused-imports', 'prettier'],
  rules: {
    'no-underscore-dangle': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'no-console': 'warn',
    'no-undef': 'off',
    semi: 'error',
    'no-unused-vars': 'off',
    'import/no-extraneous-dependencies': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': 'off',
    'comma-dangle': 'off',
    'no-multiple-empty-lines': 1,
    'no-useless-escape': 'off',
    'object-curly-newline': 'off',
    'lines-between-class-members': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
    'react/jsx-props-no-spreading': 0,
    'react/jsx-max-props-per-line': [1, {maximum: 1, when: 'multiline'}],
    // Disabled old no-shadow rule as seems to be communicated by ESLint while working with TS.
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-shadow.md
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'import/prefer-default-export': 'off', // cannot control what we import from standard libs
    'import/no-unresolved': 'off', // typescript
    'require-yield': 'off', // don't micromanage sagas or side effects
    'import/extensions': 'off', // don't micromanage pretty imports
    'no-unused-expressions': 'off', // prevents basic use of React exports such as in App.tsx
    'react/jsx-filename-extension': [2, {extensions: ['.js', '.jsx', '.ts', '.tsx']}], // Make ESLint happy about JSX inside of tsx files
    // Temporarily, we will ignore these while we introduce linting to our repo *conservatively*.
    // These are to be re-enabled soon.
    'arrow-body-style': 'off', // warn
    'arrow-parens': 'off', // warn
    'dot-notation': 'off', // required for our env variables currently
    'prefer-const': 'off',
    'max-len': 'off',
    'react/jsx-no-target-blank': 'off', //  target="_blank" without rel="noreferrer" is a security risk: see https://html.spec.whatwg.org/multipage/links.html#link-type-noopener  react/jsx-no-target-blank
    'react/prop-types': 'off', // TODO re-enable
    'react/require-default-props': 'off', // TODO re-enable
    'no-nested-ternary': 'off', // warn
    'consistent-return': 'off', // warn. Look at api calls closely before enabling this. api.ts.
    // Accessibility off for now to make speed a priority and avoid restructuring for now
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/anchor-is-valid': 'off', // TODO warn because, we should really be using buttons.
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/alt-text': 'off',
    "space-in-brackets": 'off',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        controlComponents: ['Select'],
        assert: 'either',
        depth: 3,
      },
    ],
    "no-implicit-coercion": ['error', {
      "boolean": true,
      "number": true,
      "string": true
    }]
  },
  ignorePatterns: ['package.json', './node_modules', './dist', '**/dist/*.js'],
};
