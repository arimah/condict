#include "utf8.h"

#include <cstdio>
#include <cstring>
#include <fstream>

#include "common.h"
#include "../uca/utf8.h"

namespace condict_test {
  using CodePointIter = condict_uca::utf8::CodePointIter;

  std::vector<Utf8Test> read_utf8_tests(const char* path) {
    std::vector<Utf8Test> result;

    std::string name;

    std::ifstream f(path);
    std::string line;
    while (std::getline(f, line)) {
      if (line.empty()) {
        continue;
      }

      // A line that starts with '#' sets the name of the test
      if (line.size() >= 1 && line[0] == '#') {
        size_t i = 1;
        while (i < line.size() && line[i] == ' ') {
          i++;
        }
        name = line.substr(i);
      } else {
        size_t comment = line.find('#');
        if (comment != std::string::npos) {
          line = line.substr(0, comment);
        }

        size_t sep1 = line.find(';');
        if (sep1 == std::string::npos) {
          continue;
        }
        size_t sep2 = line.find(';', sep1 + 1);
        if (sep2 == std::string::npos) {
          continue;
        }

        auto utf8 = parse_utf8_value(line.substr(0, sep1));
        auto decoded = parse_code_points(line.substr(sep1 + 1, sep2 - sep1));
        Utf8Test test = { name, std::move(utf8), std::move(decoded) };
        result.push_back(std::move(test));
      }
    }

    return result;
  }

  bool test_decode(
    TestRunner &runner,
    const std::string &source,
    const std::vector<uint32_t> &expected
  ) {
    size_t i = 0;
    CodePointIter iter((int) source.size(), source.c_str());
    while (true) {
      uint32_t actual;
      if (!iter.next(actual)) {
        if (i < expected.size()) {
          printf("index %zu: expected '%04X', got eof\n", i, expected[i]);
          return runner.fail();
        }
        break;
      }
      if (i == expected.size()) {
        printf("index %zu: expected eof, got '%04X'\n", i, actual);
        return runner.fail();
      }
      if (actual != expected[i]) {
        printf("index %zu: expected '%04X', got '%04X'\n", i, expected[i], actual);
        return runner.fail();
      }
      i++;
    }
    return true;
  }

  bool test_decode_empty(TestRunner &runner) {
    std::string source;
    std::vector<uint32_t> expected;
    return test_decode(runner, source, expected);
  }

  bool test_utf8_decoder(
    const std::vector<Utf8Test> &valid,
    const std::vector<Utf8Test> &invalid
  ) {
    TestRunner runner("UTF-8 decoder");

    runner.start_test("empty");
    test_decode_empty(runner);
    runner.end_test();

    for (auto &t : valid) {
      runner.start_test(t.name);
      test_decode(runner, t.utf8, t.decoded);
      runner.end_test();
    }

    for (auto &t : invalid) {
      runner.start_test(t.name);
      test_decode(runner, t.utf8, t.decoded);
      runner.end_test();
    }

    return runner.result();
  }
}
