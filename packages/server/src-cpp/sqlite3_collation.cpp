#include <v8.h>
#include <node.h>
#include <memory>

#ifdef _WIN32
# define CONDICT_EXPORT __declspec(dllexport)
#else
# define CONDICT_EXPORT __attribute__((visibility("default")))
#endif

#include "../deps/sqlite3ext.h"
SQLITE_EXTENSION_INIT1

namespace condict {
  class Collator {
  public:
    inline Collator(
      v8::Isolate* isolate_,
      const char *const name_,
      v8::Local<v8::Function> fn_
    ) :
      isolate(isolate_),
      name(name_),
      fn(isolate_, fn_)
    {}

    inline const char* Name() const {
      return this->name.c_str();
    }

    static int xCompare(
      void* context,
      int aLen,
      const void* a,
      int bLen,
      const void* b
    );

    static void xDestroy(void* self);

  private:
    const std::string name;
    v8::Isolate *const isolate;
    const v8::Persistent<v8::Function, v8::CopyablePersistentTraits<v8::Function>> fn;
  };

  int Collator::xCompare(
    void* context,
    int aLen,
    const void* a,
    int bLen,
    const void* b
  ) {
    Collator* self = static_cast<Collator*>(context);
    v8::Isolate* isolate = self->isolate;

    v8::HandleScope scope(isolate);

    v8::Local<v8::Value> args[2];
    args[0] = v8::String::NewFromUtf8(
      isolate,
      static_cast<const char*>(a),
      v8::NewStringType::kNormal,
      aLen
    ).ToLocalChecked();
    args[1] = v8::String::NewFromUtf8(
      isolate,
      static_cast<const char*>(b),
      v8::NewStringType::kNormal,
      bLen
    ).ToLocalChecked();

    // SQLite collations must be infallible. If an exception occurs, the best
    // we can do is either terminate the process entirely, or return a possibly
    // incorrect fallback value. Neither is a particularly good solution. The
    // latter would almost certainly result in  corrupt database, whereas the
    // former can result in data loss if a transaction is aborted.
    //
    // This is why you can't define custom collation functions in better-sqlite3:
    // there is just no good way to recover from even the smallest error. But
    // Intl.Collator.compare isn't *supposed* to be able to fail, so it feels
    // relatively safe to rely on it.
    //
    // A single lost transaction seems like a less bad fate than a corrupted
    // database.

    v8::Local<v8::Function> fn = v8::Local<v8::Function>::New(isolate, self->fn);
    v8::MaybeLocal<v8::Value> maybeResult = fn->Call(
      isolate->GetCurrentContext(),
      v8::Undefined(isolate),
      2,
      args
    );
    // ToLocalChecked() allows V8 to crash the process if an error occurred.
    int ordering = maybeResult.ToLocalChecked()
      ->ToInt32(isolate->GetCurrentContext()).ToLocalChecked()
      ->Value();
    return ordering;
  }

  void Collator::xDestroy(void* self) {
    delete static_cast<Collator*>(self);
  }

  std::unique_ptr<Collator> registeredCollator;

  void ThrowTypeError(v8::Isolate* isolate, const char* msg) {
    v8::Local<v8::String> msgString = v8::String::NewFromUtf8(
      isolate,
      msg,
      v8::NewStringType::kNormal,
      -1 // Calculate length from message
    ).ToLocalChecked();
    isolate->ThrowException(v8::Exception::TypeError(msgString));
  }

  void RegisterCollator(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();

    if (!args[0]->IsString()) {
      return ThrowTypeError(isolate, "Expected name to be a string");
    }
    v8::Local<v8::String> nameString = args[0].As<v8::String>();
    if (!args[1]->IsFunction()) {
      return ThrowTypeError(isolate, "Expected collator to be a function");
    }
    v8::Local<v8::Function> fn = args[1].As<v8::Function>();

    v8::String::Utf8Value name(isolate, nameString);
    registeredCollator = std::make_unique<Collator>(isolate, *name, fn);
  }

  void ClearPendingCollator(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    // Returns true if there was a pending collator, otherwise false.
    args.GetReturnValue().Set(v8::Boolean::New(isolate, registeredCollator != nullptr));
    registeredCollator.reset(nullptr);
  }

  NODE_MODULE_INIT(/* exports, module, context */) {
    NODE_SET_METHOD(exports, "registerCollator", RegisterCollator);
    NODE_SET_METHOD(exports, "clearPendingCollator", ClearPendingCollator);
  }
}

extern "C" CONDICT_EXPORT int sqlite3_extension_init(
  sqlite3* db,
  char** pzErrMsg,
  const sqlite3_api_routines* pApi
) {
  using condict::Collator;

  SQLITE_EXTENSION_INIT2(pApi);

  int result = SQLITE_OK;

  Collator* collator = condict::registeredCollator.release();
  if (collator) {
    result = sqlite3_create_collation_v2(
      db,
      collator->Name(),
      SQLITE_UTF8,
      collator,
      Collator::xCompare,
      Collator::xDestroy
    );
    if (result != SQLITE_OK) {
      // sqlite3_create_collation_v2() does NOT invoke the xDestroy callback
      // on failure, unlike every other SQLite interface.
      delete collator;
    }
  }

  return result;
}
