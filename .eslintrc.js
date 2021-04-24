module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'jsx-a11y',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: '17.0.2',
    },
  },
  parserOptions: {
    project: './config/tsconfig.base.json'
  },
  rules: {
    indent: 'off', // Compatibility problems with TypeScript
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true,
        // Template literal indentation is screwy, as is indentation inside
        // type parameter lists. Ignore for now.
        ignoredNodes: [
          'TemplateLiteral *',
          'TSTypeParameterDeclaration *',
          'TSTypeParameterInstantiation *',
        ],
      },
    ],

    // I like Haskell.
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Good idea in theory, not really workable in practice.
    '@typescript-eslint/no-explicit-any': 'off',

    // `type` is fine.
    '@typescript-eslint/prefer-interface': 'off',

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'warn',

    'linebreak-style': [
      'error',
      'unix',
    ],

    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],

    semi: [
      'error',
      'always',
    ],

    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],

    // This project includes a lot of server or Node-only components, where it's
    // okay to log.
    'no-console': 'off',

    // The default rules are a little bit too picky and don't allow you to use
    // the banned types even if you know what you're doing. Especially for React
    // code it's useful to use `{}` to indicate "no properties".
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          Function: false,
          Object: false,
          '{}': false,
          object: false,
        },
      },
    ],

    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      {
        // I'm not a *fan* of exporting functions with `any` parameters, but
        // sometimes it's necessary.
        allowArgumentsExplicitlyTypedAsAny: true,
      },
    ],

    'require-await': 'error',

    // Warning rather than error because externally typed libraries may trigger
    // this rule.
    '@typescript-eslint/await-thenable': 'warn',

    // The default rule is a bit too strict, to the point where it becomes hard
    // to throw together log messages and the like. Sometimes embedded numbers,
    // booleans and the like are desirable.
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      {
        allowBoolean: true,
        allowNumber: true,
        allowNullish: true,
        allowAny: true,
      }
    ],

    // There are too many third-party libraries with sloppy typings that we
    // can't really make this a hard error, as nice as the rule is.
    '@typescript-eslint/no-unsafe-assignment': 'warn',

    // There are many situations where unbound methods are desirable, e.g. in
    // objects with helper functions that are supposed to be used that way even
    // if the TS typings don't reveal it.
    '@typescript-eslint/unbound-method': 'warn',

    // The following rules interfere with various TypeScript features.
    'no-undef': 'off', // Taken care of by the type system.
    'no-dupe-class-members': 'off', // Conflicts with overloading.

    // We have a type system.
    'react/prop-types': 'off',

    // New JSX transform automatically adds the appropriate imports, and does
    // not import React from 'react'.
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',

    'jsx-quotes': [
      'error',
      'prefer-single',
    ],

    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        controlComponents: [
          'TextInput',
          'NumberInput',
          'Select'
        ],
      },
    ],

    // This rule is deprecated and should not be used.
    'jsx-a11y/label-has-for': 'off',
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        // Need to allow things like `declare class X` followed by `declare namespace X`.
        'no-redeclare': 'off',

        // Everything in a .d.ts file is assumed to be public.
        '@typescript-eslint/explicit-member-accessibility': 'off'
      },
    },
  ],
};
