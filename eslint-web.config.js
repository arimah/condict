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
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "import",
    "jsx-a11y"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
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
