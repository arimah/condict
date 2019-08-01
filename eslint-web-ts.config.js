module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "react",
    "jsx-a11y",
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

    "jsx-quotes": [
      "error",
      "prefer-single"
    ],

    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        "controlComponents": [
          "TextInput",
          "NumberInput",
          "Select"
        ]
      }
    ],

    // This rule is deprecated and should not be used.
    "jsx-a11y/label-has-for": "off"
  }
};
