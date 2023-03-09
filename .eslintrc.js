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
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'unused-imports', 'prettier', 'import'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn'],
    // Disabled old no-shadow rule as seems to be communicated by ESLint while working with TS.
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-shadow.md
    '@typescript-eslint/no-shadow': ['error'],

    'arrow-body-style': 'off', // warn
    'arrow-parens': 'off', // warn

    'comma-dangle': 'off',
    'consistent-return': 'off', // warn. Look at api calls closely before enabling this. api.ts.

    'default-param-last': 'off',
    'dot-notation': 'off', // required for our env variables currently

    'import/no-named-as-default': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off', // cannot control what we import from standard libs
    'import/extensions': 'off', // don't micromanage pretty imports
    'import/export': 'warn',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // disallow imports in electron from src
          {target: './electron', from: './src', except: ['./shared']},
          // disallow imports in src from electron
          {target: './src', from: './electron'},
          // disallow imports in shared from src
          {target: './src/shared', from: './src', except: ['./shared', './assets']},
          // disallow imports in shared from electron
          {target: './src/shared', from: './electron'},
        ],
      },
    ],

    // Accessibility off for now to make speed a priority and avoid restructuring for now
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off', // TODO warn because, we should really be using buttons.
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        controlComponents: ['Select'],
        assert: 'either',
        depth: 3,
      },
    ],
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',

    'lines-between-class-members': 'off',

    'max-len': 'off',

    'no-console': 'warn',
    'no-implicit-coercion': [
      'error',
      {
        boolean: true,
        number: true,
        string: true,
      },
    ],
    'no-multiple-empty-lines': 1,
    'no-nested-ternary': 'off', // warn
    'no-param-reassign': 'off',
    'no-restricted-exports': 'off',
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'no-undef': 'off',
    'no-unused-expressions': 'off', // prevents basic use of React exports such as in App.tsx
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-useless-escape': 'off',

    'object-curly-newline': 'off',

    'prefer-const': 'off',
    'prefer-destructuring': 'off',

    'react/destructuring-assignment': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-props-no-spreading': 0,
    'react/jsx-max-props-per-line': [1, {maximum: 1, when: 'multiline'}],
    'react/jsx-filename-extension': [2, {extensions: ['.js', '.jsx', '.ts', '.tsx']}], // Make ESLint happy about JSX inside of tsx files
    'react/jsx-no-target-blank': 'off', //  target="_blank" without rel="noreferrer" is a security risk: see https://html.spec.whatwg.org/multipage/links.html#link-type-noopener  react/jsx-no-target-blank
    'react/jsx-no-constructed-context-values': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/prop-types': 'off', // TODO re-enable
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off', // TODO re-enable
    'react/no-unstable-nested-components': 'off',
    'react/no-unused-prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'require-yield': 'off', // don't micromanage sagas or side effects

    semi: 'error',
    'space-in-brackets': 'off',

    'unused-imports/no-unused-imports-ts': 'error',
  },
  ignorePatterns: ['package.json', './node_modules', './dist', '**/dist/*.js'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: ['tsconfig.json', 'electron/tsconfig.json', 'shared/tsconfig.json'],
      },
    },
  },
};
