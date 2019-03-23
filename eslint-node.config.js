module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
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
        // Template literal indentation is screwy. Ignore it for now.
        "ignoredNodes": ["TemplateLiteral *"]
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

    // This is for the server. Logging is fine.
    "no-console": "off",

    // The following rules interfere with various TypeScript features.
    "no-undef": "off", // Taken care of by the type system.
    "no-dupe-class-members": "off", // Doesn't work well with overloading.
  }
};
