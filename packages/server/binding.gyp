{
  'variables': {
    'group%': ''
  },
  'conditions': [
    ["group == 'test'", {
      'includes': ['tests.gypi'],
    }, {
      'includes': ['extension.gypi'],
    }],
  ],
}
