const {
  assertOperationResult,
  capture,
  optional,
  inputError,
  startServer,
} = require('../helpers');

describe('Language: addLanguage', () => {
  it('adds a language', async () => {
    const server = await startServer();
    const {id} = await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Newspeak"}) { id, name }
      }`,
      {},
      {
        data: {
          addLanguage: {id: capture('id'), name: 'Newspeak'},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        languages { id, name }
        language(id: $id) { name }
      }`,
      {id},
      {
        data: {
          languages: [
            {id, name: 'Newspeak'},
          ],
          language: {name: 'Newspeak'},
        },
        errors: optional(),
      }
    );
  });

  it('adds several languages', async () => {
    const server = await startServer();
    const {id1, id2} = await assertOperationResult(
      server,
      `mutation {
        lang1: addLanguage(data: {name: "Blang"}) { id, name }
        lang2: addLanguage(data: {name: "Alang"}) { id, name }
      }`,
      {},
      {
        data: {
          lang1: {id: capture('id1'), name: 'Blang'},
          lang2: {id: capture('id2'), name: 'Alang'},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!) {
        lang1: language(id: $id1) { id, name }
        lang2: language(id: $id2) { id, name }
        languages { id, name }
      }`,
      {id1, id2},
      {
        data: {
          lang1: {id: id1, name: 'Blang'},
          lang2: {id: id2, name: 'Alang'},
          // Languages are ordered alphabetically, not by ID.
          languages: [
            {id: id2, name: 'Alang'},
            {id: id1, name: 'Blang'},
          ],
        },
        errors: optional(),
      }
    );
  });

  it('trims the language name', async () => {
    const server = await startServer();
    const {id1, id2, id3} = await assertOperationResult(
      server,
      `mutation {
        lang1: addLanguage(data: {name: "   Trim start"}) { id, name }
        lang2: addLanguage(data: {name: "Trim end         "}) { id, name }
        lang3: addLanguage(data: {name: "  Trim both "}) { id, name }
      }`,
      {},
      {
        data: {
          lang1: {id: capture('id1'), name: 'Trim start'},
          lang2: {id: capture('id2'), name: 'Trim end'},
          lang3: {id: capture('id3'), name: 'Trim both'},
        },
        errors: optional(),
      }
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
      {
        data: {
          lang1: {id: id1, name: 'Trim start'},
          lang2: {id: id2, name: 'Trim end'},
          lang3: {id: id3, name: 'Trim both'},
          // Languages are ordered alphabetically, not by ID.
          languages: [
            {id: id3, name: 'Trim both'},
            {id: id2, name: 'Trim end'},
            {id: id1, name: 'Trim start'},
          ],
        },
        errors: optional(),
      }
    );
  });

  it('rejects the empty language name', async () => {
    const server = await startServer();
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: ""}) { id }
      }`,
      {},
      {
        data: null,
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
      {
        data: {languages: []},
        errors: optional(),
      }
    );
  });

  it('rejects a white space-only language name', async () => {
    const server = await startServer();
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "     "}) { id }
      }`,
      {},
      {
        data: null,
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
      {
        data: {languages: []},
        errors: optional(),
      }
    );
  });

  it('rejects duplicate language names', async () => {
    const server = await startServer();
    const {id} = await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Hello"}) { id }
      }`,
      {},
      {
        data: {
          addLanguage: {id: capture('id')},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `mutation {
        addLanguage(data: {name: "Hello"}) { id }
      }`,
      {},
      {
        data: null,
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
      {
        data: {
          languages: [{id, name: 'Hello'}],
        },
        errors: optional(),
      }
    );
  });
});
