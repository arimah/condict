/* eslint-disable */
const assert = require('assert');
const {default: convert} = require('../dist');

const assertConversion = (input, output) => {
  assert.equal(
    convert(input),
    output,
    `Did not convert '${input}' to '${output}'`
  );
};

describe('convert', () => {
  describe('pulmonic consonants', () => {
    it('should convert nasal consonants', () => {
      assertConversion(
        'm F n n` J N N\\',
        'm ɱ n ɳ ɲ ŋ ɴ'
      );
    });

    it('should convert plosives', () => {
      assertConversion(
        'p b t d t` d` c J\\ k g q G\\ >\\ ?',
        'p b t d ʈ ɖ c ɟ k ɡ q ɢ ʡ ʔ'
      );
    });

    it('should convert fricatives', () => {
      assertConversion(
        'p\\ B f v T D s z S Z s` z` C j\\ x G X R X\\ ?\\ H\\ <\\ h h\\',
        'ɸ β f v θ ð s z ʃ ʒ ʂ ʐ ç ʝ x ɣ χ ʁ ħ ʕ ʜ ʢ h ɦ'
      );
    });

    it('should convert approximants', () => {
      assertConversion(
        'P v\\ r\\ r\\` j M\\',
        'ʋ ʋ ɹ ɻ j ɰ'
      );
    });

    it('should convert trills', () => {
      assertConversion('B\\ r R\\', 'ʙ r ʀ');
    });

    it('should convert taps and flaps', () => {
      // Including the lateral flap
      assertConversion('4 r` l\\', 'ɾ ɽ ɺ');
    });

    it('should convert lateral fricatives', () => {
      assertConversion('K K\\', 'ɬ ɮ');
    });

    it('should convert lateral approximants', () => {
      assertConversion('l l` L L\\', 'l ɭ ʎ ʟ');
    });

    it('should convert coarticulated consonants', () => {
      assertConversion(
        'W w H s\\ z\\ x\\',
        'ʍ w ɥ ɕ ʑ ɧ'
      );
    });
  });

  describe('non-pulmonic consonants', () => {
    it('should convert clicks', () => {
      // U+01C0 ǀ Latin Letter Dental Click
      // U+01C1 ǁ Latin Letter Lateral Click
      // U+01C3 ǃ Latin Letter Retroflex Click
      // Unicode escapes because of high confusability.
      assertConversion(
        'O\\ |\\ !\\ =\\ |\\|\\',
        'ʘ \u01C0 \u01C3 ǂ \u01C1'
      );
    });

    it('should convert implosives', () => {
      assertConversion(
        'b_< d_< g_< G\\_< J\\_<',
        'ɓ ɗ ɠ ʛ ʄ'
      );
    });

    // Ejectives are formed with a simple modifier, tested below.
  });

  describe('vowels', () => {
    it('should convert standard vowels', () => {
      assertConversion(
        'i y 1 } M u I Y I\\ U\\ U e 2 @\\ 8 7 o @ E 9 3 3\\ V O { 6 a & A Q',
        'i y ɨ ʉ ɯ u ɪ ʏ ᵻ ᵿ ʊ e ø ɘ ɵ ɤ o ə ɛ œ ɜ ɞ ʌ ɔ æ ɐ a ɶ ɑ ɒ'
      );
    });

    it('should convert CXS/extended vowels', () => {
      assertConversion('i\\ u\\', 'ɨ ʉ');
    });
  });

  describe('diacritic placement', () => {
    // It's obvously not possible to test every combination of base + diacritic,
    // so we test a few select cases instead.

    it('should place the voiceless diacritic correctly', () => {
      // Letters without descenders - diacritic should end up below.
      // U+0325 Combining Ring Below
      assertConversion(
        'n_0 r_0 b_0 d_0 D_0 W_0 B\\_0 l\\_0 a_0 e_0 i_0 o_0 u_0',
        'n\u0325 r\u0325 b\u0325 d\u0325 ð\u0325 ʍ\u0325 ʙ\u0325 ɺ\u0325 a\u0325 e\u0325 i\u0325 o\u0325 u\u0325'
      );
      // Letters with descender and no ascender - diacritic should end up above.
      // U+030A Combining Ring Above
      assertConversion(
        'g_0 j_0 J\\_0 N_0 H_0 Z_0 r`_0 z`_0 y_0',
        'ɡ\u030A j\u030A ɟ\u030A ŋ\u030A ɥ\u030A ʒ\u030A ɽ\u030A ʐ\u030A y\u030A'
      );
      // Non-ASCII IPA characters with descender - the diacritic should be
      // placed above these, too.
      assertConversion(
        'ɡ_0 ɟ_0 ŋ_0 ɥ_0 ʒ_0 ɽ_0 ʐ_0 ɣ_0 χ_0',
        'ɡ\u030A ɟ\u030A ŋ\u030A ɥ\u030A ʒ\u030A ɽ\u030A ʐ\u030A ɣ\u030A χ\u030A'
      );
    });

    it('should place the non-syllabic diacritic correctly', () => {
      // Letters without descenders - diacritic should end up below.
      // U+0329 Combining Vertical Line Below
      assertConversion(
        'n= r= b= d= D= W= B\\= l\\= a= e= i= o= u=',
        'n\u0329 r\u0329 b\u0329 d\u0329 ð\u0329 ʍ\u0329 ʙ\u0329 ɺ\u0329 a\u0329 e\u0329 i\u0329 o\u0329 u\u0329'
      );
      // Letters with descender and no ascender - diacritic should end up above.
      // U+030A Combining Vertical Line Above
      assertConversion(
        'g= j= J\\= N= H= Z= r`= z`= y=',
        'ɡ\u030D j\u030D ɟ\u030D ŋ\u030D ɥ\u030D ʒ\u030D ɽ\u030D ʐ\u030D y\u030D'
      );
      // Non-ASCII IPA characters with descender - the diacritic should be
      // placed above these, too.
      assertConversion(
        'ɡ= ɟ= ŋ= ɥ= ʒ= ɽ= ʐ= ɣ= χ=',
        'ɡ\u030D ɟ\u030D ŋ\u030D ɥ\u030D ʒ\u030D ɽ\u030D ʐ\u030D ɣ\u030D χ\u030D'
      );
    });

    it('should place the advanced diacritic correctly', () => {
      // Letters without descenders - diacritic should end up below.
      // U+031F Combining Plus Sign Below
      assertConversion(
        'n_+ r_+ b_+ d_+ D_+ W_+ B\\_+ l\\_+ a_+ e_+ i_+ o_+ u_+',
        'n\u031F r\u031F b\u031F d\u031F ð\u031F ʍ\u031F ʙ\u031F ɺ\u031F a\u031F e\u031F i\u031F o\u031F u\u031F'
      );
      // Letters with descender and no ascender - diacritic should end up after.
      // U+02D6 Modifier Letter Plus Sign
      assertConversion(
        'g_+ j_+ J\\_+ N_+ H_+ Z_+ r`_+ z`_+ y_+',
        'ɡ\u02D6 j\u02D6 ɟ\u02D6 ŋ\u02D6 ɥ\u02D6 ʒ\u02D6 ɽ\u02D6 ʐ\u02D6 y\u02D6'
      );
      // Some non-ASCII IPA characters with descender - the diacritic should be
      // placed after these, too.
      assertConversion(
        'ɡ_+ ɟ_+ ŋ_+ ɥ_+ ʒ_+ ɽ_+ ʐ_+ ɣ_+ χ_+',
        'ɡ\u02D6 ɟ\u02D6 ŋ\u02D6 ɥ\u02D6 ʒ\u02D6 ɽ\u02D6 ʐ\u02D6 ɣ\u02D6 χ\u02D6'
      );
    });

    it('should place the retracted diacritic correctly', () => {
      // Letters without descenders - diacritic should end up below.
      // U+0320 Combining Minus Sign Below
      assertConversion(
        'n_- r_- b_- d_- D_- W_- B\\_- l\\_- a_- e_- i_- o_- u_-',
        'n\u0320 r\u0320 b\u0320 d\u0320 ð\u0320 ʍ\u0320 ʙ\u0320 ɺ\u0320 a\u0320 e\u0320 i\u0320 o\u0320 u\u0320'
      );
      // Letters with descender and no ascender - diacritic should end up after.
      // U+02D7 Modifier Letter Minus Sign
      assertConversion(
        'g_- j_- J\\_- N_- H_- Z_- r`_- z`_- y_-',
        'ɡ\u02D7 j\u02D7 ɟ\u02D7 ŋ\u02D7 ɥ\u02D7 ʒ\u02D7 ɽ\u02D7 ʐ\u02D7 y\u02D7'
      );
      // Some non-ASCII IPA characters with descender - the diacritic should be
      // placed after these, too.
      assertConversion(
        'ɡ_- ɟ_- ŋ_- ɥ_- ʒ_- ɽ_- ʐ_- ɣ_- χ_-',
        'ɡ\u02D7 ɟ\u02D7 ŋ\u02D7 ɥ\u02D7 ʒ\u02D7 ɽ\u02D7 ʐ\u02D7 ɣ\u02D7 χ\u02D7'
      );
    });
  });

  describe('comma', () => {
    // U+02CC Modifier Letter Low Vertical Line, aka secondary stress
    it('should transform `,` to secondary stress before a letter', () => {
      assertConversion(',a', '\u02CCa');
      assertConversion(',,,x', '\u02CC\u02CC\u02CCx');
    });

    it('should not convert `,` before space', () => {
      assertConversion(', ', ', ');
      assertConversion(' , ', ' , ');
      assertConversion('a, b', 'a, b');
    });

    it('should not convert `,` at end of line', () => {
      assertConversion(',', ',');
      assertConversion(',,', '\u02CC,');
      assertConversion(',,,', '\u02CC\u02CC,');
      assertConversion('x,', 'x,');
    });
  });

  describe('escape sequences', () => {
    it('should escape characters after *', () => {
      assertConversion('*g', 'g');
      assertConversion('x*N', 'xN');
      assertConversion('af*=b', 'af=b');
    });

    it('should only escape one character', () => {
      assertConversion('*_H', '_ɥ');
      assertConversion('*J\\', 'J\\');
      assertConversion('*-\\', '-\\');
    });

    it('should handle multiple * correctly', () => {
      assertConversion('**', '*');
      assertConversion('****', '**');
      assertConversion('******', '***');
    });

    it('should ignore * before a space', () => {
      assertConversion('* foo', '* foo');
      assertConversion('foo * bar', 'foo * bar');
      assertConversion('foo* ', 'foo* ');
    });

    it('should ignore * at end of line', () => {
      assertConversion('*', '*');
      assertConversion('foo*', 'foo*');
    });
  });

  it('should convert the empty string', () => {
    assertConversion('', '');
  });

  it('should match the longest substring', () => {
    // ||\ should be parsed as || + \, not as | + |\
    assertConversion('||\\', '‖\\');
  });
});
