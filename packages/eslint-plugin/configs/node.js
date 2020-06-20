module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    // NB: This config is inlined into ../index.js, hence './configs'.
    "./configs/base.js",
  ],
  "rules": {
    // This is for the server. Logging is fine.
    "no-console": "off",
  },
};
