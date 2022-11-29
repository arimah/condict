#include "collate.h"

#include <cstdio>
#include <fstream>
#include <sstream>

#include "common.h"
#include "../uca/uca.h"

namespace condict_test {
  std::vector<uint16_t> parse_ce_level(const std::string &input) {
    std::vector<uint16_t> result;
    std::stringstream ss(input);

    uint16_t weight;
    while (ss >> std::hex >> weight) {
      result.push_back(weight);
    }

    return result;
  }

  bool contains_disallowed_chars(const std::vector<uint32_t> &str) {
    for (uint32_t cp : str) {
      // Surrogate characters are transformed into U+FFFD by the UTF-8 decoder,
      // as they are not valid UTF-8. The tests will fail for those.
      if ((cp & 0xfffff800) == 0xD800) {
        return true;
      }
    }
    return false;
  }

  bool should_ignore_cea(const std::vector<uint32_t> &str) {
    for (uint32_t cp : str) {
      // For some reason the CLDR data assigns FFFE a *non*-variable primary
      // weight of .0001, then also expects L4 to be .0001, whereas going by
      // the text of the standard, it should be .FFFF. Since its primary weight
      // is unique, we'll ignore CEA tests for that character.
      if (cp == 0xFFFE) {
        return true;
      }
    }
    return false;
  }

  std::vector<CollationTest> read_collation_tests(const char* path) {
    std::vector<CollationTest> result;

    std::ifstream f(path);
    std::string line;
    while (std::getline(f, line)) {
      // A line that starts with '#' is a comment; ignore those
      if (line.empty() || line.size() > 1 && line[0] == '#') {
        continue;
      }

      size_t sep = line.find(';');
      if (sep == std::string::npos) {
        continue;
      }
      size_t levels_start = line.rfind('[');
      if (levels_start == std::string::npos) {
        continue;
      }
      size_t level_sep1 = line.find('|', levels_start + 1);
      if (level_sep1 == std::string::npos) {
        continue;
      }
      size_t level_sep2 = line.find('|', level_sep1 + 1);
      if (level_sep2 == std::string::npos) {
        continue;
      }
      size_t level_sep3 = line.find('|', level_sep2 + 1);
      if (level_sep3 == std::string::npos) {
        continue;
      }
      size_t level_sep4 = line.find('|', level_sep3 + 1);
      if (level_sep4 == std::string::npos) {
        continue;
      }

      auto source_raw = parse_code_points(line.substr(0, sep));
      if (contains_disallowed_chars(source_raw)) {
        continue;
      }
      auto level_1 = parse_ce_level(line.substr(levels_start + 1, level_sep1));
      auto level_2 = parse_ce_level(line.substr(level_sep1 + 1, level_sep2));
      auto level_3 = parse_ce_level(line.substr(level_sep2 + 1, level_sep3));
      auto level_4 = parse_ce_level(line.substr(level_sep3 + 1, level_sep4));

      bool ignore_cea = should_ignore_cea(source_raw);
      auto source = utf8_encode(source_raw);

      CollationTest test = {
        ignore_cea,
        std::move(line.substr(0, sep)),
        std::move(source),
        std::move(level_1),
        std::move(level_2),
        std::move(level_3),
        std::move(level_4),
      };
      result.push_back(std::move(test));
    }

    return result;
  }

  bool test_collate_pair(
    TestRunner &runner,
    const CollationTest &a,
    const CollationTest &b,
    int expected
  ) {
    static const char* ordering_symbol[] = { "<", "==", ">" };

    int actual = condict_uca::compare_tb(
      (int) a.source.size(),
      a.source.c_str(),
      (int) b.source.size(),
      b.source.c_str()
    );
    // Normalize return value to {-1, 0, 1}
    if (actual < 0) {
      actual = -1;
    } else if (actual > 0) {
      actual = 1;
    }

    // Test values in the collation file are allowed to compare as equal, since
    // some of them contain characters that decompose to the same sequence.
    if (!(actual == expected || actual == 0)) {
      printf(
        "expected '%s' %s '%s', got %s\n",
        a.name.c_str(),
        ordering_symbol[expected + 1],
        b.name.c_str(),
        ordering_symbol[actual + 1]
      );
      return runner.fail();
    }
    return true;
  }

  bool test_collator(const std::vector<CollationTest> &tests) {
    TestRunner runner("Collate");

    for (size_t i = 1, len = tests.size(); i < len; i++) {
      const CollationTest &t = tests[i];
      runner.start_test(t.name);

      if (i > 2) {
        auto &pp = tests[i - 2];
        // The current string should be >= the string before previous
        test_collate_pair(runner, t, pp, 1);
      }
      if (i > 1) {
        auto &p = tests[i - 1];
        // The current string should be >= the previous string
        test_collate_pair(runner, t, p, 1);
      }
      // The string should be equal to itself
      test_collate_pair(runner, t, t, 0);
      if (i < len - 1) {
        auto &n = tests[i + 1];
        // The current string should be <= the next string
        test_collate_pair(runner, t, n, -1);
      }
      if (i < len - 2) {
        auto &nn = tests[i + 2];
        // The current string should be <= the string after next
        test_collate_pair(runner, t, nn, -1);
      }

      runner.end_test();
    }

    return runner.result();
  }
}
