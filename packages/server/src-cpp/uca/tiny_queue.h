#pragma once

#include <cstdlib>
#include <cstring>

namespace condict_uca {
  // This class implements a tiny queue as a ring buffer, whose storage lives
  // on the stack by default, but is automatically moved to the heap as items
  // are added to it beyond the initial capacity.
  //
  // The initial capacity of the buffer is the size of the array on the stack,
  // and this cannot be greater than 64.
  //
  // Due to the internal use of a union, the element type *must not* have any
  // kind of non-trivial constructor or destructor.
  //
  // In addition to pushing and popping, the queue support arbitrary index
  // operations in constant time.
  template<typename T, unsigned INIT_CAP>
  class TinyQueue {
  public:
    static_assert(INIT_CAP > 0, "The initial capacity must be greater than 0");
    static_assert(INIT_CAP <= 64, "The initial capacity cannot exceed 64");

    inline TinyQueue() :
      start(0),
      len(0),
      on_heap(false),
      stack_buf{}
    { }

    inline ~TinyQueue() {
      if (this->on_heap) {
        free(this->heap.buf);
      }
    }

    inline T &operator[](uint32_t i) {
      i += this->start;
      if (this->on_heap) {
        return this->heap.buf[i % this->heap.capacity];
      } else {
        return this->stack_buf[i % INIT_CAP];
      }
    }

    inline bool is_empty() const {
      return this->len == 0;
    }

    inline uint32_t size() const {
      return this->len;
    }

    inline uint32_t capacity() const {
      return this->on_heap ? this->heap.capacity : INIT_CAP;
    }

    inline void skip(uint32_t count) {
      this->start = (this->start + count) % this->capacity();
    }

    inline void shift_backwards(uint32_t from, uint32_t to) {
      T* buf;
      uint32_t capacity;
      if (this->on_heap) {
        buf = this->heap.buf;
        capacity = this->heap.capacity;
      } else {
        buf = this->stack_buf;
        capacity = INIT_CAP;
      }

      from += this->start;
      to += this->start;

      T value = buf[from % capacity];
      while (from > to) {
        buf[from % capacity] = buf[(from + capacity - 1) % capacity];
        from--;
      }
      buf[to % capacity] = value;
    }

    T pop_start() {
      uint32_t i = this->start;
      this->len--;
      if (this->on_heap) {
        this->start = (i + 1) % this->heap.capacity;
        return this->heap.buf[i];
      } else {
        this->start = (i + 1) % INIT_CAP;
        return this->stack_buf[i];
      }
    }

    void push_end(T value) {
      if (this->len == this->capacity()) {
        this->grow();
      }

      uint32_t i = this->start + this->len;
      if (this->on_heap) {
        this->heap.buf[i % this->heap.capacity] = value;
      } else {
        this->stack_buf[i % INIT_CAP] = value;
      }
      this->len++;
    }

  private:
    uint32_t start;
    uint32_t len;
    bool on_heap;
    union {
      T stack_buf[INIT_CAP];
      struct {
        uint32_t capacity;
        T* buf;
      } heap;
    };

    inline T* buf() {
      return this->on_heap ? this->heap.buf : this->stack_buf;
    }

    void grow() {
      uint32_t old_capacity = this->capacity();
      uint32_t new_capacity = old_capacity * 2;
      T* new_buf = reinterpret_cast<T*>(calloc(new_capacity, sizeof(T)));
      if (!new_buf) {
        // What else can we do? If we throw an exception, we *will* cause
        // problems in non-C++ frames.
        std::abort();
      }

      T* old_buf = this->buf();
      // We only grow when len == capacity, so we know for sure we need
      // to copy the entire queue.
      uint32_t start = this->start;
      if (start == 0) {
        memcpy(new_buf, old_buf, old_capacity * sizeof(T));
      } else {
        uint32_t count = old_capacity - start;
        memcpy(new_buf, old_buf + start, count * sizeof(T));
        memcpy(new_buf + count, old_buf, start * sizeof(T));
      }

      // Now we've allocated a new buffer, copied the data across, *and*
      // reoriented the data to start at index 0. If we were already on
      // the heap, we can now free the previous buffer.
      if (this->on_heap) {
        free(this->heap.buf);
      }
      this->start = 0;
      this->on_heap = true;
      this->heap.capacity = new_capacity;
      this->heap.buf = new_buf;
    }
  };
}
