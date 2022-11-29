#include "nfd.h"

#include <cstdio>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>

#include "common.h"
#include "../uca/nfd.h"

namespace condict_test {
  using NfdIter = condict_uca::nfd::NfdIter;

  std::vector<NfdTest> read_nfd_tests(const char* path) {
    std::vector<NfdTest> result;

    std::ifstream f(path);
    std::string line;
    std::string section;
    size_t index = 0;
    while (std::getline(f, line)) {
      // A line that starts with '#' is a comment; ignore those
      if (line.empty() || line.size() > 1 && line[0] == '#') {
        continue;
      }

      // A line that starts with '@' gives us the name of the test section
      if (line.size() > 1 && line[0] == '@') {
        index = 0; // reset for next test
        section = line.substr(1);
        continue;
      }

      size_t sep1 = line.find(';');
      if (sep1 == std::string::npos) {
        continue;
      }
      size_t sep2 = line.find(';', sep1 + 1);
      if (sep2 == std::string::npos) {
        continue;
      }
      size_t sep3 = line.find(';', sep2 + 1);
      if (sep3 == std::string::npos) {
        continue;
      }
      size_t sep4 = line.find(';', sep3 + 1);
      if (sep4 == std::string::npos) {
        continue;
      }
      size_t sep5 = line.find(';', sep4 + 1);
      if (sep5 == std::string::npos) {
        continue;
      }

      auto source_raw = parse_code_points(line.substr(0, sep1));
      auto nfc_raw = parse_code_points(line.substr(sep1 + 1, sep2 - sep1));
      auto nfd_raw = parse_code_points(line.substr(sep2 + 1, sep3 - sep2));
      auto nfkc_raw = parse_code_points(line.substr(sep3 + 1, sep4 - sep3));
      auto nfkd_raw = parse_code_points(line.substr(sep4 + 1, sep5 - sep4));

      auto source = utf8_encode(source_raw);
      auto nfc = utf8_encode(nfc_raw);
      auto nfd = utf8_encode(nfd_raw);
      auto nfkc = utf8_encode(nfkc_raw);
      auto nfkd = utf8_encode(nfkd_raw);

      std::stringstream name;
      name << section << '/' << index << ": " << line.substr(0, sep5);

      NfdTest test = {
        std::move(name.str()),
        std::move(source),
        std::move(nfc),
        std::move(nfd),
        std::move(nfkc),
        std::move(nfkd),
        std::move(nfd_raw),
        std::move(nfkd_raw),
      };
      result.push_back(std::move(test));
      index++;
    }

    return result;
  }

  bool test_decomposed_forms(
    TestRunner &runner,
    const char* label,
    const std::string &source,
    const std::vector<uint32_t> &expected
  ) {
    size_t i = 0;
    NfdIter iter((int) source.size(), source.c_str());
    while (true) {
      uint32_t actual;
      if (!iter.next(actual)) {
        if (i < expected.size()) {
          printf("%s: index %zu: expected '%04X', got eof\n", label, i, expected[i]);
          return runner.fail();
        }
        break;
      }
      if (i == expected.size()) {
        printf("%s: index %zu: expected eof, got '%04X'\n", label, i, actual);
        return runner.fail();
      }
      if (actual != expected[i]) {
        printf("%s: index %zu: expected '%04X', got '%04X'\n", label, i, expected[i], actual);
        return runner.fail();
      }
      i++;
    }
    return true;
  }

  bool test_decomposition(const std::vector<NfdTest> &tests) {
    TestRunner runner("Decomposition");

    for (auto &t : tests) {
      runner.start_test(t.name);
      // For every conformant implementation of NFD, the following must hold:
      //
      //   t.expected == NFD(t.source) == NFD(t.nfc) == NFD(t.nfd)
      //   t.expected_compat == NFD(t.nfkc) == NFD(t.nfkd)
      test_decomposed_forms(runner, "src", t.source, t.expected);
      test_decomposed_forms(runner, "nfc", t.nfc, t.expected);
      test_decomposed_forms(runner, "nfd", t.nfd, t.expected);
      test_decomposed_forms(runner, "nfkc", t.nfkc, t.expected_compat);
      test_decomposed_forms(runner, "nfkd", t.nfkd, t.expected_compat);
      runner.end_test();
    }

    return runner.result();
  }
}
