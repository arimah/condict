module.exports = {
  extends: '../.eslintrc.cjs',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  rules: {
    // Next encourages putting "bare" anchor tags inside <Link>, which obviously
    // doesn't play well with this rule.
    'jsx-a11y/anchor-is-valid': 'off',
  },
};
