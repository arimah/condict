#include "nfd.h"

namespace condict_uca {
  namespace nfd {
    #include "comp_data.inc"

    const CompData DEFAULT_COMP_DATA = { 0, 0, 0 };

    CompData lookup_comp_data(uint32_t cp) {
      if (cp > LAST_ASSIGNED) {
        return DEFAULT_COMP_DATA;
      }

      uint16_t index3 = cp >> STAGE3_SHIFT;
      uint16_t index2 = stage3[index3] | ((cp >> STAGE2_SHIFT) & STAGE2_MASK);
      uint16_t index1 = stage2[index2] | ((cp >> STAGE1_SHIFT) & STAGE1_MASK);
      uint16_t index0 = stage1[index1] | (cp & COMP_MASK);
      return comp_data[index0];
    }

    uint8_t get_ccc(uint32_t cp) {
      return lookup_comp_data(cp).ccc;
    }

    bool NfdIter::next(uint32_t &result) {
      if (this->buf.is_empty() && !this->scan_next()) {
        result = 0;
        return false;
      }

      // At this point, the buffer will contain at least one code point.
      result = this->buf.pop_start();
      return true;
    }

    uint32_t NfdIter::peek(uint32_t n) {
      while (this->buf.size() <= n) {
        if (!this->scan_next()) {
          return 0;
        }
      }
      return this->buf[n];
    }

    bool NfdIter::scan_next() {
      uint32_t next_cp;
      if (!this->str.next(next_cp)) {
        return false;
      }

      // At this point, we have at least one more code point. Let's see if we
      // can decompose it.
      bool has_nonstarters = false;
      CompData comp_data = lookup_comp_data(next_cp);

      if (comp_data.decomp_len == 0) {
        if (this->decompose_hangul(next_cp)) {
          // Hangul syllables decompose into starters. We do not need to do any
          // more work, as we can't possibly be inside a non-starter sequence.
          return true;
        }

        this->push(next_cp, comp_data.ccc, has_nonstarters);
      } else {
        // The decompositions in our data are already fully expanded, i.e. we
        // will not need to decompose them any further.
        const uint32_t* decomp = &decomp_data[comp_data.decomp_idx];
        for (uint32_t i = 0; i < comp_data.decomp_len; i++) {
          uint32_t cp = decomp[i];
          this->push(cp, get_ccc(cp), has_nonstarters);
        }
      }

      if (has_nonstarters) {
        // If we're inside a non-starter sequence, then we must keep consuming
        // non-starters until we reach the end of the string or a starter. Non-
        // starters will be pushed onto the buffer in sorted order.
        while (true) {
          // At the end of the string, peek() returns 0, which is a starter.
          // Hence, the end of the string will correctly exit this loop.
          uint32_t cp = this->str.peek();
          comp_data = lookup_comp_data(cp);
          // A vanishingly small number of non-starters decompose into further
          // non-starters. An even smaller number of *starters* decompose into
          // a sequence of non-starters (e.g., Tibetan vowel signs).
          if (comp_data.decomp_len == 0) {
            if (comp_data.ccc == 0) {
              // We've reached a starter or the end of the string. We're done!
              break;
            }
            this->push_nonstarter(cp, comp_data.ccc);
          } else {
            const uint32_t* decomp = &decomp_data[comp_data.decomp_idx];

            if (get_ccc(decomp[0]) == 0) {
              // Decomposes into something that starts with a starter - we're
              // all done here.
              break;
            }

            for (uint32_t i = 0; i < comp_data.decomp_len; i++) {
              // Here we make an assumption: no code point will ever decompose
              // into one or more non-starters followed by a starter.
              cp = decomp[i];
              this->push_nonstarter(cp, get_ccc(cp));
            }
          }

          this->str.skip();
        }
      }
      return true;
    }

    bool NfdIter::decompose_hangul(uint32_t cp) {
      // These constants are taken from The Unicode Standard, section 3.12,
      // Conjoining Jamo Behavior.
      //   L = Leading consonant
      //   V = Vowel
      //   T = Trailing consonant (may be absent)
      constexpr uint32_t S_BASE = 0xAC00; // The first Hangul syllable
      constexpr uint32_t L_BASE = 0x1100; // Code point of the first L
      constexpr uint32_t V_BASE = 0x1161; // Code point of the first V
      constexpr uint32_t T_BASE = 0x11A7; // Code point of the first T
      constexpr uint32_t V_COUNT = 21; // Total number of Vs
      constexpr uint32_t T_COUNT = 28; // Total number of Ts
      constexpr uint32_t N_COUNT = V_COUNT * T_COUNT;

      constexpr uint32_t S_LAST = 0xD7AF; // The last Hangul syllable

      if (S_BASE <= cp && cp <= S_LAST) {
        uint32_t s_index = cp - S_BASE;
        uint32_t l_index = s_index / N_COUNT;
        uint32_t v_index = (s_index % N_COUNT) / T_COUNT;
        uint32_t t_index = s_index % T_COUNT;

        this->buf.push_end(L_BASE + l_index);
        this->buf.push_end(V_BASE + v_index);
        if (t_index > 0) {
          this->buf.push_end(T_BASE + t_index);
        }

        return true;
      }
      return false;
    }

    void NfdIter::push(uint32_t cp, uint8_t ccc, bool &has_nonstarters) {
      if (ccc == 0) {
        this->buf.push_end(cp);
        has_nonstarters = false;
      } else if (has_nonstarters) {
        this->push_nonstarter(cp, ccc);
      } else {
        this->buf.push_end(cp);
        has_nonstarters = true;
      }
    }

    void NfdIter::push_nonstarter(uint32_t cp, uint8_t ccc) {
      uint32_t idx = this->buf.size();
      this->buf.push_end(cp);

      // Now we sort the code point to the correct location based on its CCC.
      // We *don't* have to remember the index of the starter, as all starters
      // by definition have a CCC of 0, which is lower than any non-starter.
      // We just keep shifting the code point back until we find one with a
      // lower or equal CCC.
      //
      // We do need the `idx > 0` condition, as the buffer is *not* guaranteed
      // to start with a starter, and obviously this->buf[-1] is out-of-bounds.
      uint32_t prev;
      while (idx > 0 && ccc < get_ccc(prev = this->buf[idx - 1])) {
        this->buf[idx] = prev;
        idx--;
        this->buf[idx] = cp;
      }
    }
  }
}
