#ifdef _WIN32
# define CONDICT_EXPORT __declspec(dllexport)
#else
# define CONDICT_EXPORT __attribute__((visibility("default")))
#endif

#include "../deps/sqlite3ext.h"
SQLITE_EXTENSION_INIT1

#include "uca/uca.h"

int sqlite3_compare(
  void* _context,
  int a_len,
  const void* a,
  int b_len,
  const void* b
) {
  return condict_uca::compare(
    a_len,
    reinterpret_cast<const char*>(a),
    b_len,
    reinterpret_cast<const char*>(b)
  );
}

extern "C" CONDICT_EXPORT int sqlite3_extension_init(
  sqlite3* db,
  char** pzErrMsg,
  const sqlite3_api_routines* pApi
) {
  SQLITE_EXTENSION_INIT2(pApi);

  int result = sqlite3_create_collation_v2(
    db,
    "unicode",
    SQLITE_UTF8,
    nullptr,
    sqlite3_compare,
    nullptr
  );

  return result;
}
