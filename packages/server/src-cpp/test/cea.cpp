#include "cea.h"

#include <cstdio>

#include "common.h"
#include "../uca/cea.h"

namespace condict_test {
  using CeaIter = condict_uca::cea::ElementIter;

  bool test_cea(TestRunner &runner, const CollationTest &t) {
    size_t i1 = 0;
    size_t i2 = 0;
    size_t i3 = 0;
    size_t i4 = 0;
    CeaIter iter((int) t.source.size(), t.source.c_str());
    while (true) {
      condict_uca::cea::Element actual;
      if (!iter.next(actual)) {
        if (i1 < t.expected_1.size()) {
          printf("L1/%zu: expected '%04X', got eof\n", i1, t.expected_1[i1]);
          return runner.fail();
        }
        if (i2 < t.expected_2.size()) {
          printf("L2/%zu: expected '%04X', got eof\n", i2, t.expected_2[i2]);
          return runner.fail();
        }
        if (i3 < t.expected_3.size()) {
          printf("L3/%zu: expected '%04X', got eof\n", i3, t.expected_3[i3]);
          return runner.fail();
        }
        if (i4 < t.expected_4.size()) {
          printf("L4/%zu: expected '%04X', got eof\n", i4, t.expected_4[i4]);
          return runner.fail();
        }
        break;
      }

      if (actual.level_1 != 0) {
        if (i1 == t.expected_1.size()) {
          printf("L1/%zu: expected eof, got '%04X'\n", i1, actual.level_1);
          return runner.fail();
        }
        if (actual.level_1 != t.expected_1[i1]) {
          printf("L1/%zu: expected '%04X', got '%04X'\n", i1, t.expected_1[i1], actual.level_1);
          return runner.fail();
        }
        i1++;
      }
      if (actual.level_2 != 0) {
        if (i2 == t.expected_2.size()) {
          printf("L2/%zu: expected eof, got '%04X'\n", i2, actual.level_2);
          return runner.fail();
        }
        if (actual.level_2 != t.expected_2[i2]) {
          printf("L2/%zu: expected '%04X', got '%04X'\n", i2, t.expected_2[i2], actual.level_2);
          return runner.fail();
        }
        i2++;
      }
      if (actual.level_3 != 0) {
        if (i3 == t.expected_3.size()) {
          printf("L3/%zu: expected eof, got '%04X'\n", i3, actual.level_3);
          return runner.fail();
        }
        if (actual.level_3 != t.expected_3[i3]) {
          printf("L3/%zu: expected '%04X', got '%04X'\n", i3, t.expected_3[i3], actual.level_3);
          return runner.fail();
        }
        i3++;
      }
      if (actual.level_4 != 0) {
        if (i4 == t.expected_4.size()) {
          printf("L4/%zu: expected eof, got '%04X'\n", i4, actual.level_4);
          return runner.fail();
        }
        if (actual.level_4 != t.expected_4[i4]) {
          printf("L4/%zu: expected '%04X', got '%04X'\n", i4, t.expected_4[i4], actual.level_4);
          return runner.fail();
        }
        i4++;
      }
    }
    return true;
  }

  bool test_cea_generation(const std::vector<CollationTest> &tests) {
    TestRunner runner("CEA generation");

    for (auto &t : tests) {
      if (t.ignore_cea) {
        continue;
      }

      runner.start_test(t.name);
      test_cea(runner, t);
      runner.end_test();
    }

    return runner.result();
  }
}
