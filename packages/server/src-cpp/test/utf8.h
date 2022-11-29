#pragma once

#include <string>
#include <vector>

namespace condict_test {
  struct Utf8Test {
    std::string name;
    std::string utf8;
    std::vector<uint32_t> decoded;
  };

  std::vector<Utf8Test> read_utf8_tests(const char* path);

  bool test_utf8_decoder(
    const std::vector<Utf8Test> &valid,
    const std::vector<Utf8Test> &invalid
  );
}
