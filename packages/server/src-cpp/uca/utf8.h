#pragma once

#include <stdint.h>

namespace condict_uca {
  namespace utf8 {
    // Note: CodePointIter uses uint8_t internally instead of char because the
    // latter is not guaranteed to have any particular signedness, and indeed
    // on MSVC it defaults to signed. This causes problems with sign extension
    // when shifting non-ASCII characters.

    class CodePointIter {
    public:
      inline CodePointIter(int str_len, const char* str) :
        str(reinterpret_cast<const uint8_t*>(str)),
        end(reinterpret_cast<const uint8_t*>(str) + str_len)
      { }

      bool next(uint32_t &result);

      uint32_t peek();

      inline void skip() {
        uint32_t _cp;
        this->next(_cp);
      }

    private:
      const uint8_t* str;
      const uint8_t* end;
    };
  }
}
