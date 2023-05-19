const {
  assertOperationResult,
  capture,
  expectData,
  inputError,
  withServer,
  addLanguage,
  addPartOfSpeech,
} = require('../helpers');

const FieldFragment = `fragment FieldFragment on Field {
  id
  name
  nameAbbr
  valueType
  listValues {
    id
    value
    valueAbbr
  }
  partsOfSpeech {
    id
  }
}`;

const FieldsQuery = `query($id: FieldId!, $lang: LanguageId!) {
  field(id: $id) { ...FieldFragment }
  language(id: $lang) {
    fields { ...FieldFragment }
  }
} ${FieldFragment}`;

const assertNoFields = (server, lang) =>
  assertOperationResult(
    server,
    `query($lang: LanguageId!) {
      language(id: $lang) {
        fields { id }
      }
    }`,
    {lang},
    expectData({
      language: {
        fields: [],
      },
    })
  );

describe('Field: addField', () => {
  it('adds a boolean field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    const expected = {
      name: 'Field',
      nameAbbr: 'f',
      valueType: 'FIELD_BOOLEAN',
      listValues: null,
      partsOfSpeech: null
    };
    const {id} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { ...FieldFragment }
      } ${FieldFragment}`,
      {lang},
      expectData({
        addField: {
          id: capture('id'),
          ...expected,
        },
      })
    );
    await assertOperationResult(
      server,
      FieldsQuery,
      {id, lang},
      expectData({
        field: {id, ...expected},
        language: {
          fields: [{id, ...expected}],
        },
      })
    );
  }));

  it('rejects a boolean field with list values', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: []
          partOfSpeechIds: []
        }) { id }
      }`,
      {lang},
      {
        data: {
          addField: null,
        },
        errors: [inputError(
          'A non-list field cannot have `listValues`',
          'addField',
          'listValues'
        )],
      }
    );
    await assertNoFields(server, lang);
  }));

  it('adds a plain text field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    const expected = {
      name: 'Field',
      nameAbbr: 'f',
      valueType: 'FIELD_PLAIN_TEXT',
      listValues: null,
      partsOfSpeech: null,
    };
    const {id} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_PLAIN_TEXT
          listValues: null
          partOfSpeechIds: []
        }) { ...FieldFragment }
      } ${FieldFragment}`,
      {lang},
      expectData({
        addField: {
          id: capture('id'),
          ...expected,
        },
      })
    );
    await assertOperationResult(
      server,
      FieldsQuery,
      {id, lang},
      expectData({
        field: {id, ...expected},
        language: {
          fields: [{id, ...expected}],
        },
      })
    );
  }));

  it('rejects a plain text field with list values', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_PLAIN_TEXT
          listValues: []
          partOfSpeechIds: []
        }) { id }
      }`,
      {lang},
      {
        data: {
          addField: null,
        },
        errors: [inputError(
          'A non-list field cannot have `listValues`',
          'addField',
          'listValues'
        )],
      }
    );
    await assertNoFields(server, lang);
  }));

  // The list-one and list-many tests are identical but for the value type,
  // so to simplify and reduce repetition:
  const listTypes = [
    ['FIELD_LIST_ONE', 'list-one'],
    ['FIELD_LIST_MANY', 'list-many'],
  ];
  for (const [valueType, testName] of listTypes) {
    it(`adds a ${testName} field with no values`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');

      const expected = {
        name: 'Field',
        nameAbbr: 'f',
        valueType,
        listValues: [],
        partsOfSpeech: null,
      };
      const {id} = await assertOperationResult(
        server,
        `mutation($lang: LanguageId!, $valueType: FieldValueType!) {
          addField(data: {
            languageId: $lang
            name: "Field"
            nameAbbr: "f"
            valueType: $valueType
            listValues: []
            partOfSpeechIds: []
          }) { ...FieldFragment }
        } ${FieldFragment}`,
        {lang, valueType},
        expectData({
          addField: {
            id: capture('id'),
            ...expected,
          },
        })
      );
      await assertOperationResult(
        server,
        FieldsQuery,
        {id, lang},
        expectData({
          field: {id, ...expected},
          language: {
            fields: [{id, ...expected}],
          },
        })
      );
    }));

    it(`adds a ${testName} field with one value`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');

      const expected = {
        name: 'Field',
        nameAbbr: 'f',
        valueType,
        partsOfSpeech: null,
      };
      const {id, val} = await assertOperationResult(
        server,
        `mutation($lang: LanguageId!, $valueType: FieldValueType!) {
          addField(data: {
            languageId: $lang
            name: "Field"
            nameAbbr: "f"
            valueType: $valueType
            listValues: [
              {value: "Value", valueAbbr: "v"}
            ]
            partOfSpeechIds: []
          }) { ...FieldFragment }
        } ${FieldFragment}`,
        {lang, valueType},
        expectData({
          addField: {
            id: capture('id'),
            listValues: [{
              id: capture('val'),
              value: 'Value',
              valueAbbr: 'v',
            }],
            ...expected,
          },
        })
      );
      const expectedValues = [
        {id: val, value: 'Value', valueAbbr: 'v'},
      ];
      await assertOperationResult(
        server,
        FieldsQuery,
        {id, lang},
        expectData({
          field: {
            id,
            listValues: expectedValues,
            ...expected,
          },
          language: {
            fields: [{
              id,
              listValues: expectedValues,
              ...expected,
            }],
          },
        })
      );
    }));

    it(`adds a ${testName} field with many values`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');

      const expected = {
        name: 'Field',
        nameAbbr: 'f',
        valueType,
        partsOfSpeech: null,
      };
      const {id, val1, val2, val3} = await assertOperationResult(
        server,
        `mutation($lang: LanguageId!, $valueType: FieldValueType!) {
          addField(data: {
            languageId: $lang
            name: "Field"
            nameAbbr: "f"
            valueType: $valueType
            listValues: [
              {value: "A value", valueAbbr: "a"},
              {value: "B value", valueAbbr: "b"},
              {value: "C value", valueAbbr: "c"},
            ]
            partOfSpeechIds: []
          }) { ...FieldFragment }
        } ${FieldFragment}`,
        {lang, valueType},
        expectData({
          addField: {
            id: capture('id'),
            listValues: [
              {id: capture('val1'), value: 'A value', valueAbbr: 'a'},
              {id: capture('val2'), value: 'B value', valueAbbr: 'b'},
              {id: capture('val3'), value: 'C value', valueAbbr: 'c'},
            ],
            ...expected,
          },
        })
      );
      const expectedValues = [
        {id: val1, value: 'A value', valueAbbr: 'a'},
        {id: val2, value: 'B value', valueAbbr: 'b'},
        {id: val3, value: 'C value', valueAbbr: 'c'},
      ];
      await assertOperationResult(
        server,
        FieldsQuery,
        {id, lang},
        expectData({
          field: {
            id,
            listValues: expectedValues,
            ...expected,
          },
          language: {
            fields: [{
              id,
              listValues: expectedValues,
              ...expected,
            }],
          },
        })
      );
    }));

    it(`rejects a ${testName} field with null list values`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');

      await assertOperationResult(
        server,
        `mutation($lang: LanguageId!, $valueType: FieldValueType!) {
          addField(data: {
            languageId: $lang
            name: "Field"
            nameAbbr: "f"
            valueType: $valueType
            listValues: null
            partOfSpeechIds: []
          }) { id }
        }`,
        {lang, valueType},
        {
          data: {addField: null},
          errors: [inputError(
            'A list-type field must have `listValues`',
            'addField',
            'listValues'
          )],
        }
      );
      await assertNoFields(server, lang);
    }));

    it(`rejects a ${testName} field with duplicate list values`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      await assertOperationResult(
        server,
        `mutation($lang: LanguageId!, $valueType: FieldValueType!) {
          addField(data: {
            languageId: $lang
            name: "Field"
            nameAbbr: "f"
            valueType: $valueType
            listValues: [
              {value: "Value", valueAbbr: "v"}
              {value: "Value", valueAbbr: "v"}
            ]
            partOfSpeechIds: []
          }) { id }
        }`,
        {lang, valueType},
        {
          data: {addField: null},
          errors: [inputError(
            'Field value occurs more than once: Value',
            'addField',
            undefined,
            {
              duplicates: [
                {normalizedValue: 'Value', indices: [0, 1]}
              ],
            }
          )],
        },
      );
      await assertNoFields(server, lang);
    }));
  }

  // The following test cases are for features that are independent of field
  // value type. Hence, we do not test for every combination of types; instead,
  // it's all booleans.

  it('adds several fields to the same language', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    const {id1, id2} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        field1: addField(data: {
          languageId: $lang
          name: "Foo"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
        field2: addField(data: {
          languageId: $lang
          name: "Bar"
          nameAbbr: "b"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
      }`,
      {lang},
      expectData({
        field1: {id: capture('id1'), name: 'Foo'},
        field2: {id: capture('id2'), name: 'Bar'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: FieldId!
        $id2: FieldId!
        $lang: LanguageId!
      ) {
        field1: field(id: $id1) { id, name }
        field2: field(id: $id2) { id, name }
        language(id: $lang) {
          fields { id, name }
        }
      }`,
      {id1, id2, lang},
      expectData({
        field1: {id: id1, name: 'Foo'},
        field2: {id: id2, name: 'Bar'},
        language: {
          // Fields are ordered alphabetically, not by ID.
          fields: [
            {id: id2, name: 'Bar'},
            {id: id1, name: 'Foo'},
          ],
        },
      })
    );
  }));

  it('allows identically named fields in different languages', withServer(async server => {
    const lang1 = await addLanguage(server, 'ALang');
    const lang2 = await addLanguage(server, 'BLang');

    const {id1, id2} = await assertOperationResult(
      server,
      `mutation($lang1: LanguageId!, $lang2: LanguageId!) {
        field1: addField(data: {
          languageId: $lang1
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
        field2: addField(data: {
          languageId: $lang2
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
      }`,
      {lang1, lang2},
      expectData({
        field1: {id: capture('id1'), name: 'Field'},
        field2: {id: capture('id2'), name: 'Field'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: FieldId!
        $id2: FieldId!
        $lang1: LanguageId!
        $lang2: LanguageId!
      ) {
        field1: field(id: $id1) { id, name }
        field2: field(id: $id2) { id, name }
        lang1: language(id: $lang1) {
          fields { id, name }
        }
        lang2: language(id: $lang2) {
          fields { id, name }
        }
      }`,
      {id1, id2, lang1, lang2},
      expectData({
        field1: {id: id1, name: 'Field'},
        field2: {id: id2, name: 'Field'},
        lang1: {
          fields: [{id: id1, name: 'Field'}],
        },
        lang2: {
          fields: [{id: id2, name: 'Field'}],
        },
      })
    );
  }));

  it('trims the name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    const {id1, id2, id3} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        field1: addField(data: {
          languageId: $lang
          name: "   Trim start"
          nameAbbr: "ts"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
        field2: addField(data: {
          languageId: $lang
          name: "Trim end   "
          nameAbbr: "te"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
        field3: addField(data: {
          languageId: $lang
          name: "  Trim both "
          nameAbbr: "te"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id, name }
      }`,
      {lang},
      expectData({
        field1: {id: capture('id1'), name: 'Trim start'},
        field2: {id: capture('id2'), name: 'Trim end'},
        field3: {id: capture('id3'), name: 'Trim both'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: FieldId!
        $id2: FieldId!
        $id3: FieldId!
        $lang: LanguageId!
      ) {
        field1: field(id: $id1) { id, name }
        field2: field(id: $id2) { id, name }
        field3: field(id: $id3) { id, name }
        language(id: $lang) {
          fields { id, name }
        }
      }`,
      {id1, id2, id3, lang},
      expectData({
        field1: {id: id1, name: 'Trim start'},
        field2: {id: id2, name: 'Trim end'},
        field3: {id: id3, name: 'Trim both'},
        language: {
          // Fields are sorted alphabetically, not by ID.
          fields: [
            {id: id3, name: 'Trim both'},
            {id: id2, name: 'Trim end'},
            {id: id1, name: 'Trim start'},
          ],
        },
      })
    );
  }));

  it('rejects the empty name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: ""
          nameAbbr: ""
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id }
      }`,
      {lang},
      {
        data: {addField: null},
        errors: [inputError(
          'Field name cannot be empty',
          'addField',
          'name'
        )],
      }
    );
    await assertNoFields(server, lang);
  }));

  it('rejects a white space-only name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');

    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "    "
          nameAbbr: ""
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id }
      }`,
      {lang},
      {
        data: {addField: null},
        errors: [inputError(
          'Field name cannot be empty',
          'addField',
          'name',
        )],
      }
    );
    await assertNoFields(server, lang);
  }));

  it('rejects duplicate names', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const mut =
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id }
      }`;
    const {id} = await assertOperationResult(
      server,
      mut,
      {lang},
      expectData({
        addField: {id: capture('id')},
      })
    );
    await assertOperationResult(
      server,
      mut,
      {lang},
      {
        data: {addField: null},
        errors: [inputError(
          "The language already has a field named 'Field'",
          'addField',
          'name',
          {existingId: id}
        )],
      },
    );
    await assertOperationResult(
      server,
      `query($lang: LanguageId!) {
        language(id: $lang) {
          fields { id }
        }
      }`,
      {lang},
      expectData({
        language: {
          fields: [{id}],
        },
      })
    );
  }));

  it('reject an invalid language ID', withServer(async server => {
    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: []
        }) { id }
      }`,
      {lang: 123},
      {
        data: {addField: null},
        errors: [inputError(
          'Language not found: 123',
          'addField',
          'languageId'
        )]
      }
    );
  }));

  it('assigns parts of speech to the field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const pos = await addPartOfSpeech(server, lang, 'Noun');
    const {id} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!, $pos: PartOfSpeechId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: [$pos]
        }) {
          id
          partsOfSpeech { id }
        }
      }`,
      {lang, pos},
      expectData({
        addField: {
          id: capture('id'),
          partsOfSpeech: [{id: pos}],
        },
      })
    );
    await assertOperationResult(
      server,
      `query($id: FieldId!, $lang: LanguageId!) {
        field(id: $id) {
          id
          partsOfSpeech { id }
        }
        language(id: $lang) {
          fields {
            id
            partsOfSpeech { id }
          }
        }
      }`,
      {id, lang},
      expectData({
        field: {
          id,
          partsOfSpeech: [{id: pos}],
        },
        language: {
          fields: [{
            id,
            partsOfSpeech: [{id: pos}],
          }],
        }
      })
    );
  }));

  it('accepts duplicate part of speech IDs', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const pos = await addPartOfSpeech(server, lang, 'Noun');
    const {id} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!, $pos: PartOfSpeechId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: [$pos, $pos]
        }) {
          id
          partsOfSpeech { id }
        }
      }`,
      {lang, pos},
      expectData({
        addField: {
          id: capture('id'),
          partsOfSpeech: [{id: pos}],
        },
      })
    );
    await assertOperationResult(
      server,
      `query($id: FieldId!, $lang: LanguageId!) {
        field(id: $id) {
          id
          partsOfSpeech { id }
        }
        language(id: $lang) {
          fields {
            id
            partsOfSpeech { id }
          }
        }
      }`,
      {id, lang},
      expectData({
        field: {
          id,
          partsOfSpeech: [{id: pos}],
        },
        language: {
          fields: [{
            id,
            partsOfSpeech: [{id: pos}],
          }],
        },
      })
    );
  }));

  it('rejects an invalid part of speech ID', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!, $pos: PartOfSpeechId!) {
        addField(data: {
          languageId: $lang
          name: "Field"
          nameAbbr: "f"
          valueType: FIELD_BOOLEAN
          listValues: null
          partOfSpeechIds: [$pos]
        }) { id }
      }`,
      {lang, pos: 123},
      {
        data: {addField: null},
        errors: [inputError(
          'Part of speech not found: 123',
          'addField',
          'partOfSpeechIds.0'
        )],
      }
    );
    await assertNoFields(server, lang);
  }));
});
