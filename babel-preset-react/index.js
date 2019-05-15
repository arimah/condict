module.exports = () => ({
  presets: [
    require('@condict/babel-preset'),
    require('@babel/preset-react'),
  ],
  plugins: [
    [require('babel-plugin-styled-components'), {
      fileName: false, // It's almost always "styles"
      minify: process.env.NODE_ENV !== 'development',
    }],
  ],
});
