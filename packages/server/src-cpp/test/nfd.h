#pragma once

#include <string>
#include <vector>

#include "../uca/nfd.h"

namespace condict_test {
  struct NfdTest {
    std::string name;
    std::string source;
    std::string nfc;
    std::string nfd;
    std::string nfkc;
    std::string nfkd;
    std::vector<uint32_t> expected;
    std::vector<uint32_t> expected_compat;
  };

  std::vector<NfdTest> read_nfd_tests(const char* path);

  bool test_decomposition(const std::vector<NfdTest> &tests);
}
