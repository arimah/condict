module.exports = () => ({
  presets: [
    [require('@babel/preset-env'), {
      modules: 'commonjs',
      targets: [
        '>0.2%',
        'not dead',
        'not ie <= 11',
        'not op_mini all',
      ],
    }],
  ],
});
