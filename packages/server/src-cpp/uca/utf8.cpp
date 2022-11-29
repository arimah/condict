#include "utf8.h"

namespace condict_uca {
  namespace utf8 {
    // Quick UTF-8 summary:
    //
    // U+0000  to U+007F:   0xxxxxxx
    // U+0080  to U+07FF:   110xxxxx 10xxxxxx
    // U+0800  to U+FFFF:   1110xxxx 10xxxxxx 10xxxxxx
    // U+10000 to U+10FFFF: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    //
    // * The shortest possible form must always be chosen. So-called overlong
    //   encodings are invalid UTF-8.
    // * The surrogate characters U+D800 to U+DFFF are invalid UTF-8.
    //
    // Upon encountering an invalid UTF-8 sequence, we emit U+FFFD Replacement
    // Character.

    constexpr uint32_t REPLACEMENT_CHAR = 0xFFFD;

    // Determines the length of a UTF-8 sequence based on bits 3–7 of the
    // first byte.
    const uint8_t first_byte_length[] = {
      // 0xxxx(xxx) - ASCII byte, always single
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      // 10xxx(xxx) - continuation byte, invalid as first byte
      0, 0, 0, 0, 0, 0, 0, 0,
      // 110xx(xxx) - 2-byte sequence
      2, 2, 2, 2,
      // 1110x(xxx) - 3-byte sequence
      3, 3,
      // 11110(xxx) - 4-byte sequence
      4,
      // 11111(xxx) - invalid
      0,
    };
    // The minimum code point for each length.
    const uint32_t min_code_point[] = { 0, 0, 0x80, 0x800, 0x10000 };

    uint8_t scan_next(const uint8_t* str, const uint8_t *end, uint32_t &cp) {
      uint8_t len = first_byte_length[*str >> 3];
      uint8_t read = 1;
      cp = *str & (0xff >> len);
      str++;
      while (
        // There are more continuation bytes left to read...
        read < len &&
        // we're not at the end of the string...
        str != end &&
        // and the next byte is a continuation
        (*str & 0xc0) == 0x80
      ) {
        cp = (cp << 6) | (*str & 0x3f);
        str++;
        read++;
      }
      if (
        // Not enough continuation bytes, or len == 0 (invalid first byte)
        read != len ||
        // Overlong encoding
        cp < min_code_point[len] ||
        // Surrogate character. 0xD800 to 0xDFFF encompasses code points that
        // match this pattern:
        //   00000000 00000000 11011xxx xxxxxxxx
        (cp & 0xfffff800) == 0xD800 ||
        // Value too big
        cp > 0x10FFFF
      ) {
        cp = REPLACEMENT_CHAR;
      }
      return read;
    }

    bool CodePointIter::next(uint32_t &result) {
      if (this->str == this->end) {
        result = 0;
        return false;
      }
      this->str += scan_next(this->str, this->end, result);
      return true;
    }

    uint32_t CodePointIter::peek() {
      if (this->str == this->end) {
        return 0;
      }
      uint32_t result;
      scan_next(this->str, this->end, result);
      return result;
    }
  }
}
