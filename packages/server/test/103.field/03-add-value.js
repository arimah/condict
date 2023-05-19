const {
  assertOperationResult,
  capture,
  expectData,
  inputError,
  withServer,
  addLanguage,
  addField
} = require('../helpers');

const AddFieldValueMut = `mutation($data: NewFieldValueInput!) {
  addFieldValue(data: $data) {
    id
    value
    valueAbbr
  }
}`;

const FieldValueQuery = `query($id: FieldValueId!, $fieldId: FieldId!) {
  fieldValue(id: $id) {
    id
    value
    valueAbbr
  }
  field(id: $fieldId) {
    listValues {
      id
      value
      valueAbbr
    }
  }
}`;

const AllFieldValuesQuery = `query($fieldId: FieldId!) {
  field(id: $fieldId) {
    listValues {
      id
      value
      valueAbbr
    }
  }
}`

describe('FieldValue: addFieldValue', () => {
  const listTypes = [
    ['FIELD_LIST_ONE', 'list-one'],
    ['FIELD_LIST_MANY', 'list-many'],
  ];
  for (const [valueType, valueTypeName] of listTypes) {
    it(`adds a value to a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId, value1} = await addField(server, {
        languageId: lang,
        valueType,
        listValues: [{value: 'A', valueAbbr: 'a'}],
      });
      const {id} = await assertOperationResult(
        server,
        AddFieldValueMut,
        {data: {fieldId, value: 'B', valueAbbr: 'b'}},
        expectData({
          addFieldValue: {
            id: capture('id'),
            value: 'B',
            valueAbbr: 'b',
          },
        })
      );
      await assertOperationResult(
        server,
        FieldValueQuery,
        {id, fieldId},
        expectData({
          fieldValue: {id, value: 'B', valueAbbr: 'b'},
          field: {
            listValues: [
              {id: value1, value: 'A', valueAbbr: 'a'},
              {id, value: 'B', valueAbbr: 'b'},
            ],
          },
        })
      );
    }));

    it(`trims the name in a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId} = await addField(server, {
        languageId: lang,
        valueType,
        listValues: [],
      });
      const {id1, id2, id3} = await assertOperationResult(
        server,
        `mutation($fieldId: FieldId!) {
          val1: addFieldValue(data: {
            fieldId: $fieldId
            value: "   Trim start"
            valueAbbr: ""
          }) { id, value, valueAbbr }
          val2: addFieldValue(data: {
            fieldId: $fieldId
            value: "Trim end   "
            valueAbbr: ""
          }) { id, value, valueAbbr }
          val3: addFieldValue(data: {
            fieldId: $fieldId
            value: "  Trim both "
            valueAbbr: ""
          }) { id, value, valueAbbr }
        }`,
        {fieldId},
        expectData({
          val1: {
            id: capture('id1'),
            value: 'Trim start',
            valueAbbr: '',
          },
          val2: {
            id: capture('id2'),
            value: 'Trim end',
            valueAbbr: '',
          },
          val3: {
            id: capture('id3'),
            value: 'Trim both',
            valueAbbr: '',
          },
        })
      );
      await assertOperationResult(
        server,
        `query(
          $id1: FieldValueId!
          $id2: FieldValueId!
          $id3: FieldValueId!
          $fieldId: FieldId!
        ) {
          val1: fieldValue(id: $id1) { id, value, valueAbbr }
          val2: fieldValue(id: $id2) { id, value, valueAbbr }
          val3: fieldValue(id: $id3) { id, value, valueAbbr }
          field(id: $fieldId) {
            listValues { id, value, valueAbbr }
          }
        }`,
        {id1, id2, id3, fieldId},
        expectData({
          val1: {id: id1, value: 'Trim start', valueAbbr: ''},
          val2: {id: id2, value: 'Trim end', valueAbbr: ''},
          val3: {id: id3, value: 'Trim both', valueAbbr: ''},
          field: {
            listValues: [
              // Values are ordered alphabetically, not by ID.
              {id: id3, value: 'Trim both', valueAbbr: ''},
              {id: id2, value: 'Trim end', valueAbbr: ''},
              {id: id1, value: 'Trim start', valueAbbr: ''},
            ],
          },
        })
      );
    }));

    it(`rejects a duplicate value in a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId, value1} = await addField(server, {
        languageId: lang,
        valueType,
        listValues: [{value: 'A', valueAbbr: 'a'}],
      });
      await assertOperationResult(
        server,
        AddFieldValueMut,
        {data: {fieldId, value: 'A', valueAbbr: 'a'}},
        {
          data: {addFieldValue: null},
          errors: [inputError(
            "The field already has a value 'A'",
            'addFieldValue',
            'value',
            {existingId: fieldId}
          )],
        }
      );
      await assertOperationResult(
        server,
        AllFieldValuesQuery,
        {fieldId},
        expectData({
          field: {
            listValues: [{id: value1, value: 'A', valueAbbr: 'a'}],
          },
        })
      );
    }));

    it(`rejects the empty value in a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId} = await addField(server, {
        languageId: lang,
        valueType,
        listValues: [],
      });
      await assertOperationResult(
        server,
        AddFieldValueMut,
        {data: {fieldId, value: '', valueAbbr: ''}},
        {
          data: {addFieldValue: null},
          errors: [inputError(
            'Field value cannot be empty',
            'addFieldValue',
            'value'
          )],
        }
      );
    }));

    it(`rejects a white space-only value in a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId} = await addField(server, {
        languageId: lang,
        valueType,
        listValues: [],
      });
      await assertOperationResult(
        server,
        AddFieldValueMut,
        {data: {fieldId, value: '     ', valueAbbr: ''}},
        {
          data: {addFieldValue: null},
          errors: [inputError(
            'Field value cannot be empty',
            'addFieldValue',
            'value'
          )],
        }
      );
    }));
  }

  const scalarTypes = [
    ['FIELD_BOOLEAN', 'boolean'],
    ['FIELD_PLAIN_TEXT', 'plain-text'],
  ];
  for (const [valueType, valueTypeName] of scalarTypes) {
    it(`rejects a value in a ${valueTypeName} field`, withServer(async server => {
      const lang = await addLanguage(server, 'Language');
      const {id: fieldId} = await addField(server, {
        languageId: lang,
        valueType,
      });
      await assertOperationResult(
        server,
        AddFieldValueMut,
        {data: {fieldId, value: 'A', valueAbbr: 'a'}},
        {
          data: {addFieldValue: null},
          errors: [inputError(
            `Field ${fieldId} is not a list-type field`,
            'addFieldValue',
            'fieldId'
          )]
        }
      );
    }));
  }

  it('rejects an invalid field ID', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    await assertOperationResult(
      server,
      AddFieldValueMut,
      {data: {fieldId: 123, value: 'A', valueAbbr: 'a'}},
      {
        data: {addFieldValue: null},
        errors: [inputError(
          'Field not found: 123',
          'addFieldValue',
          'fieldId'
        )],
      }
    );
  }));
});
