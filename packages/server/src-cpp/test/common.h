#pragma once

#include <cstdint>
#include <string>
#include <vector>

#ifndef BENCHMARK
#define BENCHMARK 0
#endif

#if BENCHMARK
#include <chrono>
#endif

namespace condict_test {
#if BENCHMARK
  using namespace std::chrono;
#endif

  class TestRunner {
  public:
    inline TestRunner(const std::string &suite_name) :
      TestRunner(suite_name.c_str())
    { }

    inline TestRunner(const char* suite_name) :
      in_test(false),
      current_failed(false),
      test_count(0),
      failed(0),
#if BENCHMARK
      start_time(),
      total_duration(0),
#endif
      suite_name(suite_name),
      test_name()
    { }

    void start_test(const std::string &name);

    void start_test(const char* name);

    void end_test();

    bool fail();

    bool result();

  private:
    bool in_test;
    bool current_failed;
    size_t test_count;
    size_t failed;
#if BENCHMARK
    time_point<steady_clock> start_time;
    uint64_t total_duration;
#endif
    std::string suite_name;
    std::string test_name;
  };

  std::string parse_utf8_value(const std::string &input);

  std::vector<uint32_t> parse_code_points(const std::string &input);

  std::string utf8_encode(const std::vector<uint32_t> &code_points);
}
