const {
  assertOperationResult,
  capture,
  optional,
  inputError,
  startServer,
} = require('../helpers');

describe('Language: editLanguage', () => {
  const addLanguage = (server, name = 'Before') => assertOperationResult(
    server,
    `mutation($name: String!) {
      addLanguage(data: {name: $name}) { id, name }
    }`,
    {name},
    {
      data: {
        addLanguage: {id: capture('id'), name},
      },
      errors: optional(),
    }
  );

  it('does nothing with empty input', async () => {
    const server = await startServer();
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {}) { name }
      }`,
      {id},
      {
        data: {
          editLanguage: {name: 'Before'},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      {
        data: {
          language: {name: 'Before'},
        },
        errors: optional(),
      }
    );
  });

  it('updates the language name', async () => {
    const server = await startServer();
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "After"}) { name }
      }`,
      {id},
      {
        data: {
          editLanguage: {name: 'After'},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `query($id: LanguageId!) {
        language(id: $id) { name }
      }`,
      {id},
      {
        data: {
          language: {name: 'After'},
        },
        errors: optional(),
      }
    );
  });

  it('trims the language name', async () => {
    const server = await startServer();
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
      {
        data: {
          lang1: {name: 'Start After'},
          lang2: {name: 'End After'},
          lang3: {name: 'Both After'},
        },
        errors: optional(),
      }
    );
    await assertOperationResult(
      server,
      `query($id1: LanguageId!, $id2: LanguageId!, $id3: LanguageId!) {
        lang1: language(id: $id1) { name }
        lang2: language(id: $id2) { name }
        lang3: language(id: $id3) { name }
      }`,
      {id1, id2, id3},
      {
        data: {
          lang1: {name: 'Start After'},
          lang2: {name: 'End After'},
          lang3: {name: 'Both After'},
        },
        errors: optional(),
      }
    );
  });

  it('rejects the empty language name', async () => {
    const server = await startServer();
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: ""}) { name }
      }`,
      {id},
      {
        data: {
          editLanguage: null,
        },
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
      {
        data: {language: {name: 'Before'}},
        errors: optional(),
      }
    );
  });

  it('rejects a white space-only language name', async () => {
    const server = await startServer();
    const {id} = await addLanguage(server);
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "    "}) { name }
      }`,
      {id},
      {
        data: {
          editLanguage: null,
        },
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
      {
        data: {language: {name: 'Before'}},
        errors: optional(),
      }
    );
  });

  it('rejects duplicate language names', async () => {
    const server = await startServer();
    const {id: id1} = await addLanguage(server, 'Hello');
    const {id: id2} = await addLanguage(server, 'World');
    await assertOperationResult(
      server,
      `mutation($id: LanguageId!) {
        editLanguage(id: $id, data: {name: "Hello"}) { name }
      }`,
      {id: id2},
      {
        data: {
          editLanguage: null,
        },
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
      {
        data: {
          hello: {name: 'Hello'},
          world: {name: 'World'},
        },
        errors: optional(),
      }
    );
  });
});
