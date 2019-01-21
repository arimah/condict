module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1,
        "flatTernaryExpressions": true,
        // Template literal indentation is screwy. Ignore it for now.
        "ignoredNodes": ["TemplateLiteral *"]
      }
    ],
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
    "no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }
    ],
    // This is for the server. Logging is fine.
    "no-console": "off"
  }
};
