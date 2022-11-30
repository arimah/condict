#include <cstdio>

#include "test/utf8.h"
#include "test/nfd.h"
#include "test/cea.h"
#include "test/collate.h"

int main() {
  printf("Reading test data...\n");
  auto utf8_valid = condict_test::read_utf8_tests("test-data/utf8_valid.txt");
  auto utf8_invalid = condict_test::read_utf8_tests("test-data/utf8_invalid.txt");

  auto nfd_tests = condict_test::read_nfd_tests("test-data/nfd.txt");

  auto collation_tests = condict_test::read_collation_tests("test-data/collation.txt");
  printf("Test data loaded\n");

  if (!condict_test::test_utf8_decoder(utf8_valid, utf8_invalid)) {
    printf("Stopping\n");
    return 1;
  }

  if (!condict_test::test_decomposition(nfd_tests)) {
    printf("Stopping\n");
    return 2;
  }

  if (!condict_test::test_cea_generation(collation_tests)) {
    printf("Stopping\n");
    return 3;
  }

  if (!condict_test::test_collator(collation_tests)) {
    printf("Stopping\n");
    return 4;
  }

  printf("All tests succeeded!\n");
  return 0;
}
