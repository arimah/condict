{
  'targets': [
    {
      'target_name': 'fetch_test_data',
      'type': 'none',
      'hard_dependency': 1,
      'actions': [
        {
          'action_name': 'fetch_test_data',
          'inputs': [],
          'outputs': [
            'test-data/nfd.txt',
            'test-data/collation.txt',
          ],
          'action': ['node', 'scripts/fetch-test-data.mjs'],
        },
      ],
    },
    {
      'target_name': 'collation_test',
      'type': 'executable',
      'dependencies': ['fetch_test_data'],
      # This executable does not depend on Node
      'win_delay_load_hook': 'false',
      'sources': [
        'src-cpp/test.cpp',
        'src-cpp/uca/cea.cpp',
        'src-cpp/uca/nfd.cpp',
        'src-cpp/uca/uca.cpp',
        'src-cpp/uca/utf8.cpp',
        'src-cpp/test/cea.cpp',
        'src-cpp/test/common.cpp',
        'src-cpp/test/nfd.cpp',
        'src-cpp/test/utf8.cpp',
        'src-cpp/test/collate.cpp',
      ],
    },
  ],
}
