#pragma once

#include <string>
#include <vector>

namespace condict_test {
  struct CollationTest {
    bool ignore_cea;
    std::string name;
    std::string source;
    std::vector<uint16_t> expected_1;
    std::vector<uint16_t> expected_2;
    std::vector<uint16_t> expected_3;
    std::vector<uint16_t> expected_4;
  };

  std::vector<CollationTest> read_collation_tests(const char* path);

  bool test_collator(const std::vector<CollationTest> &tests);
}
