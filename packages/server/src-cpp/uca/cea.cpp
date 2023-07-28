#include "cea.h"
#include "hash_table.h"

namespace condict_uca {
  namespace cea {
    #include "cea_data.inc"

    constexpr uint32_t IMPLICIT = 0;

    inline bool is_variable(uint16_t level_1) {
      // The UCA specification says that all collation elements with primary
      // weights "from 1 to [the maximum variable primary weight]" are variable
      // and the rest are not. However, the CLDR tailorings contain this value:
      //
      //   FFFE  ; [.0001.0020.0002] # <noncharacter-FFFE>
      //
      // which seems to be the sole exception to this otherwise infallible rule.
      // Since we implement the CLDR tailorings, there's a weird 2 here instead
      // of what would more naturally be 1.
      return 2 <= level_1 && level_1 <= HIGHEST_VAR;
    }

    inline Element element(
      uint16_t level_1,
      uint16_t level_2,
      uint16_t level_3,
      uint16_t level_4
    ) {
      Element e = { level_1, level_2, level_3, level_4 };
      return e;
    }

    const Element IGNORED = { 0, 0, 0, 0 };

    uint32_t lookup_simple_mapping(uint32_t cp) {
      if (cp > LAST_ASSIGNED) {
        return IMPLICIT;
      }

      uint16_t index2 = cp >> STAGE2_SHIFT;
      uint16_t index1 = stage2[index2] | ((cp >> STAGE1_SHIFT) & STAGE1_MASK);
      uint16_t index0 = stage1[index1] | (cp & CEA_MASK);
      return cea_indices[index0];
    }

    uint32_t resolve_contraction(NfdIter &str, uint32_t cp) {
      using Bucket = const HashTableBucket<uint32_t>;

      // Root buckets are special: they always have a continuation (there are no
      // contractions that match 1 code point, by definition), thus never have a
      // value of their own. If we don't find a root bucket, we can bail early.
      Bucket* b_cur = hash_find(
        cp,
        CONTRACTIONS_ROOT_SIZE,
        contractions
      );
      if (!b_cur) {
        return IMPLICIT;
      }

      // In the Unicode data, there may be a contraction AB and an ABCD, but no
      // ABC. In our data, there will be an ABC with the value set to IMPLICIT,
      // to indicate that it has no value of its own. Here we record the value
      // and length of the longest *valid* match.
      //
      // Note: candidate_len is the length of the match *excluding* the first
      // character, which has already been consumed from str. It's the number
      // of *additional* characters we have to consume once we're done.
      uint32_t candidate = 0;
      uint32_t candidate_len = 0;

      // Let's start by finding a contiguous match. Just keep matching forward
      // until we can't find anything more.
      uint32_t idx = 0;
      while (b_cur->cont_count > 0) {
        uint32_t next_cp = str.peek(idx);
        Bucket* b = hash_find(
          next_cp,
          b_cur->cont_count,
          &contractions[b_cur->cont_idx]
        );
        if (!b) {
          break;
        }
        idx++;
        b_cur = b;
        if (b->value != IMPLICIT) {
          candidate = b->value;
          candidate_len = idx;
        }
        // Try to match the next thing after b
      }

      // Now we try to find discontiguous matches, if there are any non-starters
      // following the longest match.
      if (b_cur->cont_count > 0) {
        // The exclusive end index of the current match, that is, the sequence
        // of code points consumed by the contraction, including any non-starters
        // that have been shifted back.
        uint32_t match_end_idx = idx;
        // The next index at which we'll try to find a discontiguous match.
        // We start at idx + 1 since we know the current code point didn't match
        // a continuation.
        uint32_t discontig_idx = idx + 1;

        // A non-starter C is *blocked* with respect to a string S if there is
        // any character B between S and C such that ccc(B) = 0 or ccc(B) >= ccc(C).
        // In our case, S is the (possibly denormalized) discontiguous match so far.
        //
        // Suppose there is a contraction <a ˛ ´>, and the input string is <a ˛ ^ ´>.
        // When we get to ´, we will be in this state:
        //
        //      a    ˛    ^    ´
        //      ------    |    |
        //      |         |    C = currently working on
        //      |         |
        //      |         B = blocking context
        //      |
        //      S = matched so far (normalized)
        //
        // Here, ^ blocks ´ because ccc(^) = ccc(´), meaning we will never match
        // <a ˛ ´>. On the other hand, suppose there is the contraction <a ^ ´>
        // and no <a ˛ ´> nor <a ˛>, then we will be in a different state at ´:
        //
        //      a    ^    ˛    ´
        //      ------    |    |
        //      |         |    C = currently working on
        //      |         |
        //      |         intervening character, *not* blocking
        //      |
        //      S = matched so far (denormalized!)
        //
        // ccc(˛) < ccc(´), hence C is not blocked with respect to S. Since the
        // string after S is normalized, we need only look at the code point
        // immediately preceding C.
        //
        // Note that if there are *no* intervening characters, then C is *not*
        // blocked! If the string is <a ^ ´>, when we get to ´ we must *not*
        // consider ´ blocked by ^ even though they have the same CCC, because
        // ^ is part of the matched string. Only intervening characters block.
        // We do not actually have to test for that here: we are guaranteed to
        // have at least one intervening character, as this part of the code
        // explicitly tests for *dis*contiguous matches.

        // prev_ccc will contain the CCC of the character immediately before C,
        // i.e. the character we're processing at.
        uint8_t prev_ccc = nfd::get_ccc(str.peek(idx));
        // If prev_ccc == 0, then we've found a starter and must stop.
        while (prev_ccc != 0 && b_cur->cont_count > 0) {
          uint32_t next_cp = str.peek(discontig_idx);
          uint8_t next_ccc = nfd::get_ccc(next_cp);

          // In practice, prev_ccc can bever be greater than next_cc due to
          // normalization, but UCA says >=.
          bool is_blocked = prev_ccc >= next_ccc;
          // Advance prev_ccc immediately. If we find a discontiguous match,
          // we will overwrite it.
          prev_ccc = next_ccc;

          if (!is_blocked) {
            Bucket* b = hash_find(
              next_cp,
              b_cur->cont_count,
              &contractions[b_cur->cont_idx]
            );
            if (b) {
              // We found a discontiguous match!
              // To make sure this character is *not* matched later, we must
              // shift it back to match_end_idx. This will denormalize the string.
              str.shift_backwards(discontig_idx, match_end_idx);
              // And now we grow the match.
              match_end_idx++;

              // The CCC immediately preceding the next character is now *not*
              // the same as next_ccc, since that character has been shifted.
              // We must therefore find the actual previous CCC again.
              prev_ccc = nfd::get_ccc(str.peek(discontig_idx));

              // All discontiguous matches have values of their own
              candidate = b->value;
              candidate_len = match_end_idx;
              // Keep searching for another discontiguous match
              b_cur = b;
            }
          }
          discontig_idx++;
        }
      }

      if (candidate != IMPLICIT) {
        str.skip(candidate_len);
      }
      return candidate;
    }

    Index resolve_cea_index(NfdIter &str, uint32_t cp) {
      uint32_t result = resolve_contraction(str, cp);
      if (result == IMPLICIT) {
        result = lookup_simple_mapping(cp);
      }
      return Index(result);
    }

    bool ElementIter::next(Element &result) {
      if (this->buf.is_empty() && !this->scan_next()) {
        result = IGNORED;
        return false;
      }

      // At this point, we have some elements in the buffer. There is no
      // code point that maps to zero collation elements.
      result = this->buf.pop_start();
      return true;
    }

    bool ElementIter::scan_next() {
      uint32_t cp;
      if (!this->str.next(cp)) {
        return false;
      }

      Index cea_index = resolve_cea_index(this->str, cp);
      if (cea_index.is_implicit()) {
        this->push_implicit(cp);
      } else {
        const uint16_t* data = &cea_data[cea_index.idx()];
        uint32_t len = cea_index.len();
        if (cea_index.is_simple_l1()) {
          for (uint32_t i = 0; i < len; i++) {
            this->push_element(data[i], 0x0020, 0x0002);
          }
        } else {
          len *= 3;
          for (uint32_t i = 0; i < len; i += 3) {
            this->push_element(data[i], data[i + 1], data[i + 2]);
          }
        }
      }
      return true;
    }

    void ElementIter::push_element(
      uint16_t level_1,
      uint16_t level_2,
      uint16_t level_3
    ) {
      Element elem = IGNORED;
      if (is_variable(level_1)) {
        elem = element(0, 0, 0, level_1);
        this->last_variable = true;
      } else {
        if (this->last_variable && level_1 == 0 && level_3 != 0) {
          // An ignorable following a variable is reset to zero
          elem = IGNORED;
        } else {
          // Non-ignorable, or ignorable after variable
          elem = element(
            level_1,
            level_2,
            level_3,
            // Completely ignorable collation elements have 0000 in L4
            level_3 == 0 ? 0x0000 : 0xFFFF
          );
        }
        this->last_variable = false;
      }
      this->buf.push_end(elem);
    }

    void ElementIter::push_implicit(uint32_t cp) {
      uint16_t a;
      uint16_t b;

      if (
        0x17000 <= cp && cp <= 0x18AFF ||
        0x18D00 <= cp && cp <= 0x18D8F
      ) {
        // Tangut, Tangut Components and Tangut Supplement
        a = 0xFB00;
        b = cp - 0x17000;
      } else if (0x1B170 <= cp && cp <= 0x1B2FF) {
        // Nushu
        a = 0xFB01;
        b = cp - 0x1B170;
      } else if (0x18B00 <= cp && cp <= 0x18CFF) {
        // Khitan Small Script
        a = 0xFB02;
        b = cp - 0x18B00;
      } else {
        // Compute the default, unassigned values first and overwrite later
        // if we find a CJK ideograph. CJK ideographs use the same BBBB value
        // as unassigned characters.
        a = 0xFBC0 + (cp >> 15);
        b = cp & 0x7FFF;

        // Taken from Blocks.txt, Unicode version 15.0.0:
        //   4E00..9FFF; CJK Unified Ideographs
        //   F900..FAFF; CJK Compatibility Ideographs
        //
        // And from PropList.txt, Unicode version 15.0.0:
        //   3400..4DBF    ; Unified_Ideograph
        //   4E00..9FFF    ; Unified_Ideograph  --- CJK Unified Ideographs
        //   FA0E..FA0F    ; Unified_Ideograph  ‾|
        //   FA11          ; Unified_Ideograph   |
        //   FA13..FA14    ; Unified_Ideograph   |
        //   FA1F          ; Unified_Ideograph    > CJK Compatibility Ideographs
        //   FA21          ; Unified_Ideograph   |
        //   FA23..FA24    ; Unified_Ideograph   |
        //   FA27..FA29    ; Unified_Ideograph  _|
        //   20000..2A6DF  ; Unified_Ideograph
        //   2A700..2B739  ; Unified_Ideograph
        //   2B740..2B81D  ; Unified_Ideograph
        //   2B820..2CEA1  ; Unified_Ideograph
        //   2CEB0..2EBE0  ; Unified_Ideograph
        //   30000..3134A  ; Unified_Ideograph
        //   31350..323AF  ; Unified_Ideograph
        //
        // Lookup table for code points FA0E to FA29. This is within the block
        // CJK_Compatibility_Ideographs, where only a subset of code points have
        // Unified_Ideograph=True. The full block spans from F900 to FAFF.
        static const bool is_cjk_compat_unified_ideograph[] = {
          true,  true,  false, true,  false, true,  true,  false,
          false, false, false, false, false, false, false, false,
          false, true,  false, true,  false, true,  true,  false,
          false, true,  true,  true,
        };

        bool is_unified_cjk_or_compat =
          0x4E00 <= cp && cp <= 0x9FFF ||
          0xFA0E <= cp && cp <= 0xFA29 &&
            is_cjk_compat_unified_ideograph[cp - 0xFA0E];
        if (is_unified_cjk_or_compat) {
          a = 0xFB40 + (cp >> 15);
        } else {
          bool is_other_unified_ideograph =
            0x3400 <= cp && cp <= 0x4DBF ||
            0x20000 <= cp && cp <= 0x2A6DF ||
            0x2A700 <= cp && cp <= 0x2B739 ||
            0x2B740 <= cp && cp <= 0x2B81D ||
            0x2B820 <= cp && cp <= 0x2CEA1 ||
            0x2CEB0 <= cp && cp <= 0x2EBE0 ||
            0x30000 <= cp && cp <= 0x3134A ||
            0x31350 <= cp && cp <= 0x323AF;
          if (is_other_unified_ideograph) {
            a = 0xFB80 + (cp >> 15);
          }
        }
      }

      // The BBBB value is always ORed with this constant
      b |= 0x8000;

      this->buf.push_end(element(a, 0x0020, 0x0002, 0xFFFF));
      // Implicit BBBB has a level 4 weight of 0
      this->buf.push_end(element(b, 0x0000, 0x0000, 0x0000));
      this->last_variable = false;
    }
  }
}
