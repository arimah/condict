module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
  ],
  "rules": {
    "indent": "off", // Compatibility problems with TypeScript
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "flatTernaryExpressions": true,
        // Template literal indentation is screwy, as is indentation inside
        // type parameter lists. Ignore for now.
        "ignoredNodes": [
          "TemplateLiteral *",
          "TSTypeParameterDeclaration *",
          "TSTypeParameterInstantiation *",
        ],
      },
    ],

    // I like Haskell.
    "@typescript-eslint/explicit-function-return-type": "off",

    // Good idea in theory, not really workable in practice.
    "@typescript-eslint/no-explicit-any": "off",

    // `type` is fine.
    "@typescript-eslint/prefer-interface": "off",

    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "warn",

    "linebreak-style": [
      "error",
      "unix",
    ],

    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true,
      },
    ],

    "semi": [
      "error",
      "always",
    ],

    "comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never",
      },
    ],

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
      },
    ],

    // The default rules are a little bit too picky and don't allow you to use
    // the banned types even if you know what you're doing. Especially for React
    // code it's useful to use `{}` to indicate "no properties".
    "@typescript-eslint/ban-types": [
      "error",
      {
        "extendDefaults": true,
        "types": {
          "Function": false,
          "Object": false,
          "{}": false,
          "object": false,
        },
      },
    ],

    "@typescript-eslint/explicit-module-boundary-types": [
      "warn",
      {
        // I'm not a *fan* of exporting functions with `any` parameters, but
        // sometimes it's necessary.
        "allowArgumentsExplicitlyTypedAsAny": true,
      },
    ],

    // The following rules interfere with various TypeScript features.
    "no-undef": "off", // Taken care of by the type system.
    "no-dupe-class-members": "off", // Doesn't work well with overloading.
  },
  "overrides": [
    {
      "files": ["*.d.ts"],
      "rules": {
        // Need to allow things like `declare class X` followed by `declare namespace X`.
        "no-redeclare": "off",

        // Everything in a .d.ts file is assumed to be public.
        "@typescript-eslint/explicit-member-accessibility": "off"
      },
    },
  ],
};
