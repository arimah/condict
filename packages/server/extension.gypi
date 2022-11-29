{
  'targets': [
    {
      'target_name': 'condict',
      'type': 'shared_library',
      # This library does not depent on Node
      'win_delay_load_hook': 'false',
      # We set a custom extension so we can easily find the file on any system,
      # with no need to make guesses in the code.
      'product_extension': 'sqlite3-ext',
      'sources': [
        'src-cpp/sqlite3_ext.cpp',
        'src-cpp/uca/cea.cpp',
        'src-cpp/uca/nfd.cpp',
        'src-cpp/uca/uca.cpp',
        'src-cpp/uca/utf8.cpp',
      ],
      'msvs_settings': {
        'VCCLCompilerTool': {
          'RuntimeLibrary': 2,
        },
      },
    },
    {
      'target_name': 'action_after_build',
      'type': 'none',
      'dependencies': ['condict'],
      'copies': [
        {
          'files': ['<(PRODUCT_DIR)/condict.sqlite3-ext'],
          'destination': './bin',
        },
      ],
    },
  ],
}
