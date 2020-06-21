module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
  },
  "extends": [
    // NB: This config is inlined into ../index.js, hence './configs'.
    "./configs/base.js",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  "plugins": [
    "react",
    "jsx-a11y",
  ],
  "settings": {
    "react": {
      "version": "detect",
    },
  },
  "rules": {
    "react/prop-types": "off", // We have a type system.

    "jsx-quotes": [
      "error",
      "prefer-single",
    ],

    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        "controlComponents": [
          "TextInput",
          "NumberInput",
          "Select"
        ],
      },
    ],

    // This rule is deprecated and should not be used.
    "jsx-a11y/label-has-for": "off",
  },
};
