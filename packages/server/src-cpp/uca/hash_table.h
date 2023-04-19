#pragma once

#include <cstdint>

namespace condict_uca {
  template<typename T>
  struct HashTableBucket {
    // The code point that this bucket is for, or 0xFFFFFFFF if the bucket is
    // empty. The use of a sentinel value simplifies logic while ensuring no
    // codepoint could ever match the bucket.
    uint32_t key;
    // Offset to the next bucket in this entry, or 0 if this is the last bucket
    // or the entry is empty. The offset is added to this bucket's index.
    int16_t next_offset;
    // The size (number of buckets) of the continuation table. If this field is
    // 0, there is no continuation table.
    uint16_t cont_count;
    // The index of the continuation table's first bucket.
    uint32_t cont_idx;
    // The value in this bucket. If the bucket has no value of its own, this
    // field contains an appropriate sentinel value.
    T value;
  };

  template<typename T>
  inline const HashTableBucket<T>* hash_find(
    uint32_t cp,
    uint16_t bucket_count,
    const HashTableBucket<T>* buckets
  ) {
    // TODO: See if we can find a better, perhaps even perfect hash function.
    uint32_t index = cp % bucket_count;
    while (true) {
      const HashTableBucket<T>* bucket = &buckets[index];
      if (bucket->key == cp) {
        return bucket;
      }
      if (bucket->next_offset == 0) {
        break;
      }
      // Continue at the next bucket in this entry.
      index = (uint32_t)((int32_t)index + bucket->next_offset);
    }
    return nullptr;
  }
}
