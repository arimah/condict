const {
  assertOperationResult,
  capture,
  expectData,
  inputError,
  withServer,
} = require('../helpers');

describe('Language: addLanguage', () => {
  it('adds a language', withServer(async server => {
    const {id} = await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Newspeak"}) { id, name }
      }`,
      {},
      expectData({
        addLanguage: {id: capture('id'), name: 'Newspeak'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        languages { id, name }
        language(id: $id) { name }
      }`,
      {id},
      expectData({
        languages: [
          {id, name: 'Newspeak'},
        ],
        language: {name: 'Newspeak'},
      })
    );
  }));

  it('adds several languages', withServer(async server => {
    const {id1, id2} = await assertOperationResult(
      server,
      `mutation {
        lang1: addLanguage(data: {name: "Blang"}) { id, name }
        lang2: addLanguage(data: {name: "Alang"}) { id, name }
      }`,
      {},
      expectData({
        lang1: {id: capture('id1'), name: 'Blang'},
        lang2: {id: capture('id2'), name: 'Alang'},
      })
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!) {
        lang1: language(id: $id1) { id, name }
        lang2: language(id: $id2) { id, name }
        languages { id, name }
      }`,
      {id1, id2},
      expectData({
        lang1: {id: id1, name: 'Blang'},
        lang2: {id: id2, name: 'Alang'},
        // Languages are ordered alphabetically, not by ID.
        languages: [
          {id: id2, name: 'Alang'},
          {id: id1, name: 'Blang'},
        ],
      })
    );
  }));

  it('trims the name', withServer(async server => {
    const {id1, id2, id3} = await assertOperationResult(
      server,
      `mutation {
        lang1: addLanguage(data: {name: "   Trim start"}) { id, name }
        lang2: addLanguage(data: {name: "Trim end         "}) { id, name }
        lang3: addLanguage(data: {name: "  Trim both "}) { id, name }
      }`,
      {},
      expectData({
        lang1: {id: capture('id1'), name: 'Trim start'},
        lang2: {id: capture('id2'), name: 'Trim end'},
        lang3: {id: capture('id3'), name: 'Trim both'},
      })
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!, $id3: LanguageId!) {
        lang1: language(id: $id1) { id, name }
        lang2: language(id: $id2) { id, name }
        lang3: language(id: $id3) { id, name }
        languages { id, name }
      }`,
      {id1, id2, id3},
      expectData({
        lang1: {id: id1, name: 'Trim start'},
        lang2: {id: id2, name: 'Trim end'},
        lang3: {id: id3, name: 'Trim both'},
        // Languages are ordered alphabetically, not by ID.
        languages: [
          {id: id3, name: 'Trim both'},
          {id: id2, name: 'Trim end'},
          {id: id1, name: 'Trim start'},
        ],
      })
    );
  }));

  it('rejects the empty name', withServer(async server => {
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: ""}) { id }
      }`,
      {},
      {
        data: {addLanguage: null},
        errors: [inputError(
          'Language name cannot be empty',
          'addLanguage',
          'name'
        )],
      }
    );
    await assertOperationResult(
      server,
      `query {
        languages { id }
      }`,
      {},
      expectData({languages: []})
    );
  }));

  it('rejects a white space-only name', withServer(async server => {
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "     "}) { id }
      }`,
      {},
      {
        data: {addLanguage: null},
        errors: [inputError(
          'Language name cannot be empty',
          'addLanguage',
          'name'
        )],
      }
    );
    await assertOperationResult(
      server,
      `query {
        languages { id }
      }`,
      {},
      expectData({languages: []})
    );
  }));

  it('rejects duplicate names', withServer(async server => {
    const {id} = await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Hello"}) { id }
      }`,
      {},
      expectData({
        addLanguage: {id: capture('id')},
      })
    );
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Hello"}) { id }
      }`,
      {},
      {
        data: {addLanguage: null},
        errors: [inputError(
          "There is already a language with the name 'Hello'",
          'addLanguage',
          'name',
          {existingId: id}
        )],
      }
    );
    await assertOperationResult(
      server,
      `query {
        languages { id, name }
      }`,
      {},
      expectData({
        languages: [{id, name: 'Hello'}],
      })
    );
  }));
});
