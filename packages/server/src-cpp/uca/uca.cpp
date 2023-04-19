#include "uca.h"

#include <cstdlib>
#include <cstring>

#include "cea.h"
#include "nfd.h"

namespace condict_uca {
  struct WeightPair {
    uint16_t left;
    uint16_t right;
  };

  class WeightBuf {
  public:
    inline WeightBuf() :
      start(0),
      left_len(0),
      right_len(0),
      result(0),
      on_heap(false),
      stack_buf{}
    { }

    ~WeightBuf() {
      if (this->on_heap) {
        free(this->heap.buf);
      }
    }

    inline uint32_t capacity() const {
      return this->on_heap ? this->heap.capacity : STACK_CAP;
    }

    int push(uint16_t left, uint16_t right) {
      if (this->result == 0) {
        if (left) {
          this->push_left(left);
        }
        if (right) {
          this->push_right(right);
        }

        if (this->left_len > 0 && this->right_len > 0) {
          WeightPair* next = &this->buf()[this->start];
          // We never push zero-weights, so we don't need to check whether
          // one of the weights is zero.
          if (next->left < next->right) {
            this->result = -1;
          } else if (next->left > next->right) {
            this->result = 1;
          } else {
            // left == right, still not settled. Move on to the next pair!
            next->left = 0;
            next->right = 0;
            this->start = (this->start + 1) % this->capacity();
            this->left_len--;
            this->right_len--;
          }
        }
      }
      return this->result;
    }

    int final_result() {
      if (this->result == 0) {
        // Weights are reset to 0 when pairs are removed, so we can safely
        // compare whatever is in the next pair. Similarly, pairs that are
        // equal are also removed from the buffer when added, so we don't
        // need to look past the very next pair.
        WeightPair next = this->buf()[this->start];
        if (next.left < next.right) {
          this->result = -1;
        } else if (next.left > next.right) {
          this->result = 1;
        }
        // otherwise, fall through for 0
      }
      return this->result;
    }

  private:
    static const uint32_t STACK_CAP = 8;

    uint32_t start;
    uint32_t left_len;
    uint32_t right_len;
    int8_t result;
    bool on_heap;
    union {
      WeightPair stack_buf[STACK_CAP];
      struct {
        uint32_t capacity;
        WeightPair* buf;
      } heap;
    };

    void push_left(uint16_t value) {
      this->get_pair(this->left_len)->left = value;
      this->left_len++;
    }

    void push_right(uint16_t value) {
      this->get_pair(this->right_len)->right = value;
      this->right_len++;
    }

    WeightPair* get_pair(uint32_t index) {
      if (index == this->capacity()) {
        this->grow();
      }

      if (this->on_heap) {
        return &this->heap.buf[(index + this->start) % this->heap.capacity];
      } else {
        return &this->stack_buf[(index + this->start) % STACK_CAP];
      }
    }

    inline WeightPair* buf() {
      return this->on_heap ? this->heap.buf : this->stack_buf;
    }

    void grow() {
      uint32_t old_capacity;
      WeightPair* old_buf;
      if (this->on_heap) {
        old_capacity = this->heap.capacity;
        old_buf = this->heap.buf;
      } else {
        old_capacity = STACK_CAP;
        old_buf = this->stack_buf;
      }

      uint32_t new_capacity = old_capacity * 2;
      WeightPair* new_buf = reinterpret_cast<WeightPair*>(calloc(
        new_capacity,
        sizeof(WeightPair)
      ));
      if (!new_buf) {
        // What else can we do? If we throw an exception, we *will* cause
        // problems in non-C++ frames.
        std::abort();
      }

      // We only grow when len == capacity, so we know for sure we need
      // to copy the entire queue.
      uint32_t start = this->start;
      uint32_t count = old_capacity - start;
      memcpy(new_buf, old_buf + start, count * sizeof(WeightPair));
      memcpy(new_buf + count, old_buf, start * sizeof(WeightPair));

      // Now we've allocated a new buffer, copied the data across, *and*
      // reoriented the data to start at index 0. If we were already on
      // the heap, we can now free the previous buffer.
      if (this->on_heap) {
        free(old_buf);
      }
      this->start = 0;
      this->on_heap = true;
      this->heap.capacity = new_capacity;
      this->heap.buf = new_buf;
    }
  };

  int compare(int a_len, const char* a, int b_len, const char* b) {
    WeightBuf level_1;
    WeightBuf level_2;
    WeightBuf level_3;
    WeightBuf level_4;

    cea::ElementIter left(a_len, a);
    cea::ElementIter right(b_len, b);

    int r;
    while (true) {
      cea::Element e_left;
      cea::Element e_right;

      bool next_left = left.next(e_left);
      bool next_right = right.next(e_right);
      if (!next_left && !next_right) {
        break;
      }

      if ((r = level_1.push(e_left.level_1, e_right.level_1))) {
        return r;
      }
      level_2.push(e_left.level_2, e_right.level_2);
      level_3.push(e_left.level_3, e_right.level_3);
      level_4.push(e_left.level_4, e_right.level_4);
    }

    if ((r = level_1.final_result())) {
      return r;
    }
    if ((r = level_2.final_result())) {
      return r;
    }
    if ((r = level_3.final_result())) {
      return r;
    }
    return level_4.final_result();
  }

  int compare_tb(int a_len, const char* a, int b_len, const char *b) {
    int r = compare(a_len, a, b_len, b);
    if (r != 0) {
      return r;
    }

    nfd::NfdIter left(a_len, a);
    nfd::NfdIter right(b_len, b);
    while (r == 0) {
      uint32_t cp_left;
      uint32_t cp_right;

      bool next_left = left.next(cp_left);
      bool next_right = right.next(cp_right);
      if (!next_left || !next_right) {
        // We've reached the end of at least one string without any
        // differences. The shorter string is sorted before the longer.
        // If they are the same length, then they are equivalent.
        r = (int)next_left - (int)next_right;
        break;
      }

      if (cp_left < cp_right) {
        r = -1;
      } else if (cp_left > cp_right) {
        r = 1;
      }
    }
    return r;
  }
}
