#pragma once

#include <cstdint>

#include "tiny_queue.h"
#include "utf8.h"

// NFD: Normalization Form D
//
// This file contains functionality related to turning a code point iterator
// into the canonical decomposition normalization form (NFD), as required by
// the UCA.

namespace condict_uca {
  namespace nfd {
    using CodePointIter = utf8::CodePointIter;

    struct CompData {
      // The Canonical Composition Class (CCC) of the code point.
      //
      // The value 0 means the code point is a *starter*. Every other value is a
      // *non-starter*. Non-starters are typically accents and other modifying
      // marks, whereas starters are base characters. When two code points have
      // the *same* CCC, it basically means they're the "same kind" of accent.
      // For example, U+0300 (Combining Grave Accent) and U+0301 (Combining Acute
      // Accent) both have a CCC of 230, indicating that they go above the letter
      // they modify.
      //
      // The exact meaning of each possible value is detailed in the Unicode
      // specification, but should be treated as opaque values here.
      uint8_t ccc;
      // The length of the decomposed sequence associated with the code point,
      // or 0 if the canonical decomposition is the code point itself.
      uint8_t decomp_len;
      // The index at which the decomposition data can be found.
      uint16_t decomp_idx;
    };

    // Gets the Canonical Composition Class (CCC) of the specified code point.
    uint8_t get_ccc(uint32_t cp);

    // An iterator that produces code points in Normalization Form D, based on
    // an inner iterator that produces raw code points from a string.
    class NfdIter {
    public:
      // Creates an NfdIter with the specified inner iterator.
      inline explicit NfdIter(CodePointIter &&str) :
        str(str),
        buf()
      { }

      // Creates an NfdIter from the specified string data.
      inline NfdIter(int str_len, const char* str) :
        str(str_len, str),
        buf()
      { }

      // Fetches the next code point in the iterator.
      //
      // Returns:
      //
      //   - true: A code point was read and has been written to `result`.
      //   - false: The end of the string has been reached. `result` contains 0.
      bool next(uint32_t &result);

      // Peeks ahead by a certain amount.
      //
      // `n` is the number of code points to advance by. 0 means the next code
      // point, 1 is the code point after that, and so on.
      uint32_t peek(uint32_t n);

      // Skips ahead past *already buffered* characters. This function is only
      // safe to call if `peek` has been called with a value `n` such that
      // `n >= count - 1`. In other words, if `peek(2)` has been called, then
      // `skip(3)` and lower are safe to call.
      inline void skip(uint32_t count) {
        // This implementation is UNSAFE as it assumes the buffer contains
        // at least n entries.
        this->buf.skip(count);
      }

      inline void shift_backwards(uint32_t from, uint32_t to) {
        this->buf.shift_backwards(from, to);
      }

    private:
      CodePointIter str;
      TinyQueue<uint32_t, 8> buf;

      // Fills the internal buffer with the next set of code points.
      bool fill_buffer();

      // Scans ahead until the next deterministic state.
      //
      // "Next" does *not* mean the function will only read a single code point.
      // NFD occasionally reorders code points: all sequences of non-starters are
      // sorted by their CCC value. In order to produce a correct comparison, any
      // time a non-starter is encountered, we must keep scanning ahead until we
      // find a starter or the end of the string. Only then do we know which of
      // the non-starters comes first.
      bool scan_next();

      // Attempts to decompose a precomposed Hangul syllable.
      //
      // See The Unicode Standard, 3.12, Combining Jamo Behavior for details.
      //
      // Returns true if a Hangul syllable was decomposed and pushed to the
      // buffer, or false if `cp` is not a precomposed Hangul syllable.
      bool decompose_hangul(uint32_t cp);

      // Pushes a code point to the buffer.
      //
      // `ccc` is the code point's Canonical Combining Class.
      //
      // `has_nonstarters` is assigned the value `true` if the code point is
      // a non-starter, and `false` otherwise. If the code point is a non-starter
      // and `has_nonstarters` is already true, then the non-starter is sorted as
      // it is inserted, and will be in the correct place in the NFD string.
      void push(uint32_t cp, uint8_t ccc, bool &has_nonstarters);

      // Pushes a non-starter to the buffer.
      //
      // `ccc` is the code point's Canonical Combining Class.
      //
      // The code point is sorted to the correct position based on the CCC.
      void push_nonstarter(uint32_t cp, uint8_t ccc);
    };
  }
}
