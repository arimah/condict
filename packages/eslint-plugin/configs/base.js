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
        ]
      }
    ],

    // I like Haskell.
    "@typescript-eslint/explicit-function-return-type": "off",

    // Good idea in theory, not really workable in practice.
    "@typescript-eslint/no-explicit-any": "off",

    // `type` is fine.
    "@typescript-eslint/prefer-interface": "off",

    "linebreak-style": [
      "error",
      "unix"
    ],

    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],

    "semi": [
      "error",
      "always"
    ],

    "comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never"
      }
    ],

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }
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
      }
    }
  ],
};
