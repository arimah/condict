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

const ListValuesQuery = `
  query($id: FieldId!) {
    field(id: $id) {
      listValues { id, value, valueAbbr }
    }
  }
`;

const ListValueMut = `
  mutation($id: FieldId!, $data: EditFieldInput!) {
    editField(id: $id, data: $data) {
      listValues { id, value, valueAbbr }
    }
  }
`;

describe('Field: editField', () => {
  const addField = (server, data) => {
    const {
      languageId,
      name = 'Before',
      nameAbbr = 'bf',
      valueType = 'FIELD_BOOLEAN',
      listValues = null,
      partOfSpeechIds = [],
    } = data;
    return assertOperationResult(
      server,
      `mutation($data: NewFieldInput!) {
        addField(data: $data) {
          ...FieldFragment
        }
      } ${FieldFragment}`,
      {
        data: {
          languageId,
          name,
          nameAbbr,
          valueType,
          listValues,
          partOfSpeechIds,
        }
      },
      expectData({
        addField: {
          id: capture('id'),
          name,
          nameAbbr,
          valueType,
          listValues: listValues?.map((v, index) => ({
            id: capture(`value${index + 1}`),
            value: v.value,
            valueAbbr: v.valueAbbr,
          })) ?? null,
          partsOfSpeech: partOfSpeechIds.length > 0
            ? partOfSpeechIds.map(id => ({id}))
            : null,
        },
      })
    );
  };

  it('renames a field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id} = await addField(server, {
      languageId: lang,
      name: 'Before',
    });
    await assertOperationResult(
      server,
      `mutation($id: FieldId!, $data: EditFieldInput!) {
        editField(id: $id, data: $data) { name }
      }`,
      {id, data: {name: 'After'}},
      expectData({
        editField: {name: 'After'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: FieldId!) {
        field(id: $id) { name }
      }`,
      {id},
      expectData({
        field: {name: 'After'},
      })
    );
  }));

  it('rejects duplicate names', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: id1} = await addField(server, {
      languageId: lang,
      name: 'Hello',
      nameAbbr: 'h',
    });
    const {id: id2} = await addField(server, {
      languageId: lang,
      name: 'World',
      nameAbbr: 'w',
    });
    await assertOperationResult(
      server,
      `mutation($id: FieldId!, $data: EditFieldInput!) {
        editField(id: $id, data: $data) { id }
      }`,
      {id: id2, data: {name: 'Hello'}},
      {
        data: {editField: null},
        errors: [inputError(
          "The language already has a field named 'Hello'",
          'editField',
          'name',
          {existingId: id1}
        )],
      }
    );
  }));

  it("changes a field's abbreviated name", withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id} = await addField(server, {
      languageId: lang,
      nameAbbr: 'before',
    });
    await assertOperationResult(
      server,
      `mutation($id: FieldId!, $data: EditFieldInput!) {
        editField(id: $id, data: $data) {
          nameAbbr
        }
      }`,
      {id, data: {nameAbbr: 'after'}},
      expectData({
        editField: {nameAbbr: 'after'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: FieldId!) {
        field(id: $id) { nameAbbr }
      }`,
      {id},
      expectData({
        field: {nameAbbr: 'after'},
      })
    );
  }));

  it("changes a field's parts of speech", withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const pos1 = await addPartOfSpeech(server, lang, 'Noun');
    const pos2 = await addPartOfSpeech(server, lang, 'Verb');
    const {id} = await addField(server, {
      languageId: lang,
      partOfSpeechIds: [pos1],
    });
    const mut = `mutation($id: FieldId!, $data: EditFieldInput!) {
      editField(id: $id, data: $data) {
        partsOfSpeech { id, name }
      }
    }`;
    const query = `query($id: FieldId!) {
      field(id: $id) {
        partsOfSpeech { id }
      }
    }`
    await assertOperationResult(
      server,
      mut,
      {id, data: {partOfSpeechIds: [pos2, pos1]}},
      expectData({
        editField: {
          // Parts of speech should be returned sorted by name
          partsOfSpeech: [
            {id: pos1, name: 'Noun'},
            {id: pos2, name: 'Verb'},
          ],
        },
      })
    );
    await assertOperationResult(server, query, {id}, expectData({
      field: {
        partsOfSpeech: [
          {id: pos1},
          {id: pos2},
        ],
      },
    }));
    await assertOperationResult(
      server,
      mut,
      {id, data: {partOfSpeechIds: []}},
      expectData({
        editField: {partsOfSpeech: null},
      })
    );
    await assertOperationResult(server, query, {id}, expectData({
      field: {partsOfSpeech: null},
    }));
    await assertOperationResult(
      server,
      mut,
      {id, data: {partOfSpeechIds: [pos2]}},
      expectData({
        editField: {
          partsOfSpeech: [{id: pos2, name: 'Verb'}],
        },
      })
    );
    await assertOperationResult(server, query, {id}, expectData({
      field: {
        partsOfSpeech: [{id: pos2}],
      },
    }));
  }));

  it('rejects an invalid part of speech ID', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id} = await addField(server, {languageId: lang});
    await assertOperationResult(
      server,
      `mutation($id: FieldId!, $data: EditFieldInput!) {
        editField(id: $id, data: $data) {
          id
        }
      }`,
      {
        id,
        data: {
          partOfSpeechIds: [123],
        },
      },
      {
        data: {editField: null},
        errors: [inputError(
          'Part of speech not found: 123',
          'editField',
          'partOfSpeechIds.0',
        )],
      }
    );
  }));

  it('renames a field value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value1} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'Before', valueAbbr: 'before'},
      ],
    });
    await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [{id: value1, value: 'After', valueAbbr: 'after'}],
        },
      },
      expectData({
        editField: {
          listValues: [{id: value1, value: 'After', valueAbbr: 'after'}],
        },
      })
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [{id: value1, value: 'After', valueAbbr: 'after'}],
      },
    }));
  }));

  it('adds values to a list field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value1} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: 'a'},
      ],
    });
    const {value2, value3} = await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [
            {id: value1, value: 'A', valueAbbr: 'a'},
            {value: 'B', valueAbbr: 'b'},
            {value: 'C', valueAbbr: 'c'},
          ],
        },
      },
      expectData({
        editField: {
          listValues: [
            {id: value1, value: 'A', valueAbbr: 'a'},
            {id: capture('value2'), value: 'B', valueAbbr: 'b'},
            {id: capture('value3'), value: 'C', valueAbbr: 'c'},
          ],
        },
      })
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [
          {id: value1, value: 'A', valueAbbr: 'a'},
          {id: value2, value: 'B', valueAbbr: 'b'},
          {id: value3, value: 'C', valueAbbr: 'c'},
        ],
      },
    }));
  }));

  it('removes values from a list field', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value2} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: 'a'},
        {value: 'B', valueAbbr: 'b'}, // value2
        {value: 'C', valueAbbr: 'c'},
      ],
    });
    await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          // Should delete A and C
          listValues: [{id: value2, value: 'B', valueAbbr: 'b'}],
        },
      },
      expectData({
        editField: {
          listValues: [{id: value2, value: 'B', valueAbbr: 'b'}],
        },
      })
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [{id: value2, value: 'B', valueAbbr: 'b'}],
      },
    }));
  }));

  it('swaps the `value` of two list values', withServer(async server => {
    // Swapping two `value`s is a somewhat complex operation due to the
    // present of a UNIQUE constraint.
    const lang = await addLanguage(server, 'Language');
    const {id, value1, value2} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'Bar', valueAbbr: ''},
        {value: 'Foo', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [
            {id: value1, value: 'Foo', valueAbbr: ''},
            {id: value2, value: 'Bar', valueAbbr: ''},
          ],
        },
      },
      expectData({
        editField: {
          listValues: [
            // Values are ordered alphabetically, not by ID.
            {id: value2, value: 'Bar', valueAbbr: ''},
            {id: value1, value: 'Foo', valueAbbr: ''},
          ],
        },
      })
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [
          {id: value2, value: 'Bar', valueAbbr: ''},
          {id: value1, value: 'Foo', valueAbbr: ''},
        ],
      },
    }));
  }));

  it('performs a complex list value edit', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value3, value4, value5} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: ''},
        {value: 'B', valueAbbr: ''},
        {value: 'C', valueAbbr: ''},
        {value: 'D', valueAbbr: ''},
        {value: 'E', valueAbbr: ''},
      ],
    });
    const {value6, value7} = await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [
            // values A and B are deleted

            // rename an existing value (C) to a deleted value (A)
            {id: value3, value: 'A', valueAbbr: ''},
            // insert a new value with the same name as a deleted value (B)
            {id: null, value: 'B', valueAbbr: ''},
            // rename an existing value (D) to the same name as a previous
            // existing value (C, renamed above to A)
            {id: value4, value: 'C', valueAbbr: ''},
            // leave E unchanged
            {id: value5, value: 'E', valueAbbr: ''},
            // insert a brand new value (F)
            {id: null, value: 'F', valueAbbr: ''},
          ],
        },
      },
      expectData({
        editField: {
          listValues: [
            {id: value3, value: 'A', valueAbbr: ''},
            {id: capture('value6'), value: 'B', valueAbbr: ''},
            {id: value4, value: 'C', valueAbbr: ''},
            {id: value5, value: 'E', valueAbbr: ''},
            {id: capture('value7'), value: 'F', valueAbbr: ''},
          ],
        },
      })
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [
          {id: value3, value: 'A', valueAbbr: ''},
          {id: value6, value: 'B', valueAbbr: ''},
          {id: value4, value: 'C', valueAbbr: ''},
          {id: value5, value: 'E', valueAbbr: ''},
          {id: value7, value: 'F', valueAbbr: ''},
        ],
      },
    }));
  }));

  it('rejects a new, duplicate list value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value1} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [{value: 'A', valueAbbr: ''}],
    });
    await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [
            {id: value1, value: 'A', valueAbbr: ''},
            {id: null, value: 'A', valueAbbr: ''},
          ],
        },
      },
      {
        data: {editField: null},
        errors: [inputError(
          'Field value occurs more than once: A',
          'editField',
          undefined,
          {
            duplicates: [
              {normalizedValue: 'A', indices: [0, 1]}
            ],
          }
        )],
      },
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [{id: value1, value: 'A', valueAbbr: ''}],
      },
    }));
  }));

  it('rejects a duplicate renamed list value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id, value1, value2} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: ''},
        {value: 'B', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      ListValueMut,
      {
        id,
        data: {
          listValues: [
            {id: value1, value: 'A', valueAbbr: ''},
            {id: value2, value: 'A', valueAbbr: ''},
          ],
        },
      },
      {
        data: {editField: null},
        errors: [inputError(
          'Field value occurs more than once: A',
          'editField',
          undefined,
          {
            duplicates: [
              {normalizedValue: 'A', indices: [0, 1]},
            ],
          }
        )],
      }
    );
    await assertOperationResult(server, ListValuesQuery, {id}, expectData({
      field: {
        listValues: [
          {id: value1, value: 'A', valueAbbr: ''},
          {id: value2, value: 'B', valueAbbr: ''},
        ],
      },
    }));
  }));

  const scalarTypes = [
    ['FIELD_BOOLEAN', 'boolean'],
    ['FIELD_PLAIN_TEXT', 'plain-text'],
  ];
  const listTypes = [
    ['FIELD_LIST_ONE', 'list-one'],
    ['FIELD_LIST_MANY', 'list-many'],
  ];

  const ValueTypeMut = `mutation($id: FieldId!, $data: EditFieldInput!) {
    editField(id: $id, data: $data) {
      valueType
      listValues { id, value, valueAbbr }
    }
  }`;
  const ValueTypeQuery = `query($id: FieldId!) {
    field(id: $id) {
      valueType
      listValues { id, value, valueAbbr }
    }
  }`;
  for (const [fromType, fromTypeName] of scalarTypes) {
    // Scalar-to-scalar type changes
    for (const [toType, toTypeName] of scalarTypes) {
      let testName = fromType === toType
        ? `allows no-op type change: ${fromTypeName} -> ${toTypeName}`
        : `changes the type: ${fromTypeName} -> ${toTypeName}`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType},
          },
          expectData({
            editField: {valueType: toType, listValues: null},
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: toType, listValues: null},
        }));
      }));

      testName =
        `rejects type change ${
          fromTypeName
        } -> ${
          toTypeName
        } with listValues`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType, listValues: []}
          },
          {
            data: {editField: null},
            errors: [inputError(
              'A non-list field cannot have `listValues`',
              'editField',
              'listValues'
            )],
          }
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: fromType, listValues: null},
        }));
      }));
    }

    // Scalar-to-list type changes
    for (const [toType, toTypeName] of listTypes) {
      let testName =
        `changes the type: ${
          fromTypeName
        } -> ${
          toTypeName
        } with empty listValues`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType, listValues: []},
          },
          expectData({
            editField: {valueType: toType, listValues: []},
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: toType, listValues: []},
        }));
      }));

      testName =
        `changes the type: ${
          fromTypeName
        } -> ${
          toTypeName
        } with listValues`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
        });
        const {value1, value2} = await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {
              valueType: toType,
              listValues: [
                {value: 'A', valueAbbr: 'a'},
                {value: 'B', valueAbbr: 'b'},
              ],
            },
          },
          expectData({
            editField: {
              valueType: toType,
              listValues: [
                {id: capture('value1'), value: 'A', valueAbbr: 'a'},
                {id: capture('value2'), value: 'B', valueAbbr: 'b'},
              ],
            },
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {
            valueType: toType,
            listValues: [
              {id: value1, value: 'A', valueAbbr: 'a'},
              {id: value2, value: 'B', valueAbbr: 'b'},
            ],
          },
        }));
      }));

      testName =
        `rejects type change ${
          fromTypeName
        } -> ${
          toTypeName
        } with null listValues`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType, listValues: null},
          },
          {
            data: {editField: null},
            errors: [inputError(
              'A field that is changing to a list type must have `listValues`',
              'editField',
              'listValues'
            )],
          }
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: fromType, listValues: null},
        }));
      }));
    }
  }

  const initialListValues = [
    {value: 'A', valueAbbr: 'a'},
    {value: 'B', valueAbbr: 'b'},
  ];
  for (const [fromType, fromTypeName] of listTypes) {
    // List-to-scalar type changes
    for (const [toType, toTypeName] of scalarTypes) {
      let testName = `changes the type: ${fromTypeName} -> ${toTypeName}`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
          listValues: initialListValues,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType},
          },
          expectData({
            editField: {valueType: toType, listValues: null},
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: toType, listValues: null},
        }));
      }));

      testName =
        `rejects type change ${
          fromTypeName
        } -> ${
          toTypeName
        } with listValues`;
      it(testName, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id, value1, value2} = await addField(server, {
          languageId: lang,
          valueType: fromType,
          listValues: initialListValues,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType, listValues: []}
          },
          {
            data: {editField: null},
            errors: [inputError(
              'A non-list field cannot have `listValues`',
              'editField',
              'listValues'
            )],
          }
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {
            valueType: fromType,
            listValues: [
              {id: value1, value: 'A', valueAbbr: 'a'},
              {id: value2, value: 'B', valueAbbr: 'b'},
            ],
          },
        }));
      }));
    }

    // List-to-list type changes
    for (const [toType, toTypeName] of listTypes) {
      let testName = fromType === toType
        ? `allows no-op type change: ${fromTypeName} -> ${toTypeName}`
        : `changes the type: ${fromTypeName} -> ${toTypeName}`;
      it(`${testName} with empty listValues`, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
          listValues: initialListValues,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {
              valueType: toType,
              listValues: [],
            },
          },
          expectData({
            editField: {valueType: toType, listValues: []},
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {valueType: toType, listValues: []},
        }));
      }));

      it(`${testName} with new listValues`, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id} = await addField(server, {
          languageId: lang,
          valueType: fromType,
          listValues: initialListValues,
        });
        const {value1, value2} = await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {
              valueType: toType,
              listValues: [
                {value: 'C', valueAbbr: 'c'},
                {value: 'D', valueAbbr: 'd'},
              ],
            },
          },
          expectData({
            editField: {
              valueType: toType,
              listValues: [
                {id: capture('value1'), value: 'C', valueAbbr: 'c'},
                {id: capture('value2'), value: 'D', valueAbbr: 'd'},
              ],
            },
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {
            valueType: toType,
            listValues: [
              {id: value1, value: 'C', valueAbbr: 'c'},
              {id: value2, value: 'D', valueAbbr: 'd'},
            ],
          },
        }));
      }));

      // list -> list with null listValues means to keep the old values
      it(`${testName} with null listValues`, withServer(async server => {
        const lang = await addLanguage(server, 'Language');
        const {id, value1, value2} = await addField(server, {
          languageId: lang,
          valueType: fromType,
          listValues: initialListValues,
        });
        await assertOperationResult(
          server,
          ValueTypeMut,
          {
            id,
            data: {valueType: toType, listValues: null},
          },
          expectData({
            editField: {
              valueType: toType,
              listValues: [
                {id: value1, value: 'A', valueAbbr: 'a'},
                {id: value2, value: 'B', valueAbbr: 'b'},
              ],
            },
          })
        );
        await assertOperationResult(server, ValueTypeQuery, {id}, expectData({
          field: {
            valueType: toType,
            listValues: [
              {id: value1, value: 'A', valueAbbr: 'a'},
              {id: value2, value: 'B', valueAbbr: 'b'},
            ],
          },
        }));
      }));
    }
  }
});
