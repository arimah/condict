#include "common.h"

#include <cstdio>
#include <sstream>

namespace condict_test {
  void TestRunner::start_test(const std::string &name) {
    this->start_test(name.c_str());
  }

  void TestRunner::start_test(const char* name) {
    if (!this->in_test) {
      this->in_test = true;
      this->current_failed = false;
      this->test_name = std::string(name);
      this->test_count++;
#if BENCHMARK
      this->start_time = steady_clock::now();
#endif
    }
  }

  void TestRunner::end_test() {
    if (this->in_test) {
#if BENCHMARK
      auto end_time = steady_clock::now().time_since_epoch();
      auto start_time = this->start_time.time_since_epoch();
      auto test_time = end_time - start_time;
      this->total_duration += (uint64_t) test_time.count();
#endif

      if (this->current_failed) {
        printf("FAIL: %s\n", this->test_name.c_str());
      }
      this->in_test = false;
      this->current_failed = false;
      this->test_name.clear();
    }
  }

  bool TestRunner::fail() {
    if (this->in_test && !this->current_failed) {
      this->current_failed = true;
      this->failed++;
    }
    return false;
  }

  bool TestRunner::result() {
    if (this->failed > 0) {
      printf(
        "%s: ABORT: %zu/%zu failed\n",
        this->suite_name.c_str(),
        this->failed,
        this->test_count
      );
      return false;
    } else {
      printf("%s: %zu ok\n", this->suite_name.c_str(), this->test_count);
#if BENCHMARK
      printf(
        "%s: finished in %llu us\n",
        this->suite_name.c_str(),
        this->total_duration / 1000
      );
#endif
      return true;
    }
  }

  std::string parse_utf8_value(const std::string &input) {
    std::string result;
    std::stringstream ss(input);

    uint32_t b;
    while (ss >> std::hex >> b) {
      result.push_back((char) b);
    }

    return result;
  }

  std::vector<uint32_t> parse_code_points(const std::string &input) {
    std::vector<uint32_t> result;
    std::stringstream ss(input);

    uint32_t cp;
    while (ss >> std::hex >> cp) {
      result.push_back(cp);
    }

    return result;
  }

  std::string utf8_encode(const std::vector<uint32_t> &code_points) {
    std::string result;
    for (uint32_t cp : code_points) {
      // I know the alignment here is a bit weird, but it really helps me see
      // visually that the encoder uses the correct constants where needed.
      if (cp < 0x80) {
        result.push_back((char) cp);
      } else if (cp < 0x800) {
        result.push_back((char) (0xC0 | (cp >> 6)        ));
        result.push_back((char) (0x80 |  cp        & 0x3F));
      } else if (cp < 0x10000) {
        result.push_back((char) (0xE0 | (cp >> 12)       ));
        result.push_back((char) (0x80 | (cp >> 6 ) & 0x3F));
        result.push_back((char) (0x80 |  cp        & 0x3F));
      } else {
        result.push_back((char) (0xF0 | (cp >> 18)       ));
        result.push_back((char) (0x80 | (cp >> 12) & 0x3F));
        result.push_back((char) (0x80 | (cp >> 6 ) & 0x3F));
        result.push_back((char) (0x80 |  cp        & 0x3F));
      }
    }
    return result;
  }
}
