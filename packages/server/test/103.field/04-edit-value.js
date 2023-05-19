const {
  assertOperationResult,
  expectData,
  inputError,
  withServer,
  addLanguage,
  addField
} = require('../helpers');

const EditFieldValueMut = `mutation(
  $id: FieldValueId!
  $data: EditFieldValueInput!
) {
  editFieldValue(id: $id, data: $data) {
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

describe('FieldValue: editFieldValue', () => {
  it('renames a value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: fieldId, value1: id} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'Before', valueAbbr: 'bfr'},
      ],
    });
    await assertOperationResult(
      server,
      EditFieldValueMut,
      {id, data: {value: 'After'}},
      expectData({
        editFieldValue: {id, value: 'After', valueAbbr: 'bfr'},
      })
    );
    await assertOperationResult(
      server,
      FieldValueQuery,
      {id, fieldId},
      expectData({
        fieldValue: {id, value: 'After', valueAbbr: 'bfr'},
        field: {
          listValues: [{id, value: 'After', valueAbbr: 'bfr'}],
        },
      })
    );
  }));

  it("changes a value's abbreviation", withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: fieldId, value1: id} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'Before', valueAbbr: 'bfr'},
      ],
    });
    await assertOperationResult(
      server,
      EditFieldValueMut,
      {id, data: {valueAbbr: 'aft'}},
      expectData({
        editFieldValue: {id, value: 'Before', valueAbbr: 'aft'},
      })
    );
    await assertOperationResult(
      server,
      FieldValueQuery,
      {id, fieldId},
      expectData({
        fieldValue: {id, value: 'Before', valueAbbr: 'aft'},
        field: {
          listValues: [{id, value: 'Before', valueAbbr: 'aft'}],
        },
      })
    );
  }));

  it('trims the value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {
      id: fieldId,
      value1: id1,
      value2: id2,
      value3: id3,
    } = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: ''},
        {value: 'B', valueAbbr: ''},
        {value: 'C', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      `mutation(
        $id1: FieldValueId!
        $id2: FieldValueId!
        $id3: FieldValueId!
      ) {
        val1: editFieldValue(id: $id1, data: {
          value: "   Trim start"
        }) { id, value }
        val2: editFieldValue(id: $id2, data: {
          value: "Trim end   "
        }) { id, value }
        val3: editFieldValue(id: $id3, data: {
          value: "  Trim both "
        }) { id, value }
      }`,
      {id1, id2, id3},
      expectData({
        val1: {id: id1, value: 'Trim start'},
        val2: {id: id2, value: 'Trim end'},
        val3: {id: id3, value: 'Trim both'},
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
        val1: fieldValue(id: $id1) { id, value }
        val2: fieldValue(id: $id2) { id, value }
        val3: fieldValue(id: $id3) { id, value }
        field(id: $fieldId) {
          listValues { id, value }
        }
      }`,
      {id1, id2, id3, fieldId},
      expectData({
        val1: {id: id1, value: 'Trim start'},
        val2: {id: id2, value: 'Trim end'},
        val3: {id: id3, value: 'Trim both'},
        field: {
          listValues: [
            // Values are ordered alphabetically, not by ID.
            {id: id3, value: 'Trim both'},
            {id: id2, value: 'Trim end'},
            {id: id1, value: 'Trim start'},
          ],
        },
      })
    );
  }));

  it('rejects the empty value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: fieldId, value1: id} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      EditFieldValueMut,
      {id, data: {value: ''}},
      {
        data: {editFieldValue: null},
        errors: [inputError(
          'Field value cannot be empty',
          'editFieldValue',
          'value'
        )],
      }
    );
    await assertOperationResult(
      server,
      FieldValueQuery,
      {id, fieldId},
      expectData({
        fieldValue: {id, value: 'A', valueAbbr: ''},
        field: {
          listValues: [{id, value: 'A', valueAbbr: ''}],
        },
      })
    );
  }));

  it('rejects a white space-only value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: fieldId, value1: id} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'A', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      EditFieldValueMut,
      {id, data: {value: '    '}},
      {
        data: {editFieldValue: null},
        errors: [inputError(
          'Field value cannot be empty',
          'editFieldValue',
          'value'
        )],
      }
    );
    await assertOperationResult(
      server,
      FieldValueQuery,
      {id, fieldId},
      expectData({
        fieldValue: {id, value: 'A', valueAbbr: ''},
        field: {
          listValues: [{id, value: 'A', valueAbbr: ''}],
        },
      })
    );
  }));

  it('rejects a duplicate value', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id: fieldId, value1: id1, value2: id2} = await addField(server, {
      languageId: lang,
      valueType: 'FIELD_LIST_ONE',
      listValues: [
        {value: 'Bar', valueAbbr: ''},
        {value: 'Foo', valueAbbr: ''},
      ],
    });
    await assertOperationResult(
      server,
      EditFieldValueMut,
      {id: id2, data: {value: 'Bar'}},
      {
        data: {editFieldValue: null},
        errors: [inputError(
          "The field already has a value 'Bar'",
          'editFieldValue',
          'value',
          {existingId: id1}
        )],
      }
    );
    await assertOperationResult(
      server,
      `query($id1: FieldValueId!, $id2: FieldValueId!, $fieldId: FieldId!) {
        val1: fieldValue(id: $id1) { id, value }
        val2: fieldValue(id: $id2) { id, value }
        field(id: $fieldId) {
          listValues { id, value }
        }
      }`,
      {id1, id2, fieldId},
      expectData({
        val1: {id: id1, value: 'Bar'},
        val2: {id: id2, value: 'Foo'},
        field: {
          listValues: [
            {id: id1, value: 'Bar'},
            {id: id2, value: 'Foo'},
          ],
        },
      })
    );
  }));
});
