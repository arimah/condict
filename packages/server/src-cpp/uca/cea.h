#pragma once

#include <stdint.h>
#include "tiny_queue.h"
#include "nfd.h"

// CEA: Collation Element Array
//
// This file contains functionality related to turning an NFD-normalized code
// point iterator into an iterator of collation element arrays.
//
// In this implementation, a collation element has four weights, as we use the
// Shifting strategy for variable-weight elements.

namespace condict_uca {
  namespace cea {
    using NfdIter = nfd::NfdIter;

    class Index {
    public:
      inline explicit Index(uint32_t raw) : raw(raw) { }

      inline uint32_t idx() const {
        return this->raw & 0xFFFFFF;
      }

      inline uint32_t len() const {
        return (this->raw >> 24) & 0x7F;
      }

      inline bool is_simple_l1() const {
        return (this->raw >> 31) == 1;
      }

      inline bool is_implicit() const {
        return this->raw == 0;
      }

    private:
      uint32_t raw;
    };

    struct Element {
      uint16_t level_1;
      uint16_t level_2;
      uint16_t level_3;
      uint16_t level_4;
    };

    class ElementIter {
    public:
      inline explicit ElementIter(NfdIter &&str) :
        str(str),
        last_variable(false),
        buf()
      { }

      inline ElementIter(int str_len, const char* str) :
        str(str_len, str),
        last_variable(false),
        buf()
      { }

      bool next(Element &result);

    private:
      NfdIter str;
      bool last_variable;
      TinyQueue<Element, 4> buf;

      bool scan_next();

      void push_element(uint16_t level_1, uint16_t level_2, uint16_t level_3);

      void push_implicit(uint32_t cp);
    };
  }
}
