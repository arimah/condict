const {
  assertOperationResult,
  capture,
  optional,
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
          addLanguage: {
            id: capture('id'),
            name: 'Newspeak',
          },
        },
        errors: optional([]),
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
          language: {
            name: 'Newspeak',
          },
        },
        errors: optional([]),
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
          lang1: {
            id: capture('id1'),
            name: 'Blang',
          },
          lang2: {
            id: capture('id2'),
            name: 'Alang',
          },
        },
        errors: optional([]),
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
        errors: optional([]),
      }
    );
  });
});
