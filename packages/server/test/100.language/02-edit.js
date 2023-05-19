const {
  assertOperationResult,
  capture,
  expectData,
  inputError,
  withServer,
} = require('../helpers');

describe('Language: editLanguage', () => {
  // We don't use addLanguage() from ../helpers here because we want to assert
  // that the language adding actually works. Other tests assume that adding
  // languages works correctly.
  const addLanguage = (server, name = 'Before') => assertOperationResult(
    server,
    `mutation($name: String!) {
      addLanguage(data: {name: $name}) { id, name }
    }`,
    {name},
    expectData({
      addLanguage: {id: capture('id'), name},
    })
  );

  it('does nothing with empty input', withServer(async server => {
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {}) { name }
      }`,
      {id},
      expectData({
        editLanguage: {name: 'Before'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      expectData({
        language: {name: 'Before'},
      })
    );
  }));

  it('updates the name', withServer(async server => {
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "After"}) { name }
      }`,
      {id},
      expectData({
        editLanguage: {name: 'After'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      expectData({
        language: {name: 'After'},
      })
    );
  }));

  it('trims the name', withServer(async server => {
    const {id: id1} = await addLanguage(server, 'Start Before');
    const {id: id2} = await addLanguage(server, 'End Before');
    const {id: id3} = await addLanguage(server, 'Both Before');
    await assertOperationResult(
      server,
      `mutation($id1: LanguageId!, $id2: LanguageId!, $id3: LanguageId!) {
        lang1: editLanguage(id: $id1, data: {name: "   Start After"}) { name }
        lang2: editLanguage(id: $id2, data: {name: "End After     "}) { name }
        lang3: editLanguage(id: $id3, data: {name: "  Both After  "}) { name }
      }`,
      {id1, id2, id3},
      expectData({
        lang1: {name: 'Start After'},
        lang2: {name: 'End After'},
        lang3: {name: 'Both After'},
      })
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!, $id3: LanguageId!) {
        lang1: language(id: $id1) { name }
        lang2: language(id: $id2) { name }
        lang3: language(id: $id3) { name }
      }`,
      {id1, id2, id3},
      expectData({
        lang1: {name: 'Start After'},
        lang2: {name: 'End After'},
        lang3: {name: 'Both After'},
      })
    );
  }));

  it('rejects the empty name', withServer(async server => {
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: ""}) { name }
      }`,
      {id},
      {
        data: {editLanguage: null},
        errors: [inputError(
          'Language name cannot be empty',
          'editLanguage',
          'name'
        )],
      }
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      expectData({language: {name: 'Before'}})
    );
  }));

  it('rejects a white space-only name', withServer(async server => {
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "    "}) { name }
      }`,
      {id},
      {
        data: {editLanguage: null},
        errors: [inputError(
          'Language name cannot be empty',
          'editLanguage',
          'name'
        )],
      },
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      expectData({language: {name: 'Before'}})
    );
  }));

  it('rejects duplicate names', withServer(async server => {
    const {id: id1} = await addLanguage(server, 'Hello');
    const {id: id2} = await addLanguage(server, 'World');
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "Hello"}) { name }
      }`,
      {id: id2},
      {
        data: {editLanguage: null},
        errors: [inputError(
          "There is already a language with the name 'Hello'",
          'editLanguage',
          'name',
          {existingId: id1}
        )],
      }
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!) {
        hello: language(id: $id1) { name }
        world: language(id: $id2) { name }
      }`,
      {id1, id2},
      expectData({
        hello: {name: 'Hello'},
        world: {name: 'World'},
      })
    );
  }));
});
