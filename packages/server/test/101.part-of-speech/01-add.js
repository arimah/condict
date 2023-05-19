const {
  assertOperationResult,
  capture,
  expectData,
  inputError,
  withServer,
  addLanguage,
} = require('../helpers');

const assertNoPartsOfSpeech = (server, lang) =>
  assertOperationResult(
    server,
    `query($lang: LanguageId!) {
      language(id: $lang) {
        partsOfSpeech { id }
      }
    }`,
    {lang},
    expectData({
      language: {
        partsOfSpeech: [],
      },
    })
  );

describe('PartOfSpeech: addPartOfSpeech', () => {
  it('adds a part of speech', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addPartOfSpeech(data: {
          languageId: $lang
          name: "Noun"
        }) { id, name }
      }`,
      {lang},
      expectData({
        addPartOfSpeech: {id: capture('id'), name: 'Noun'},
      })
    );
    await assertOperationResult(
      server,
      `query($id: PartOfSpeechId!, $lang: LanguageId!) {
        partOfSpeech(id: $id) { name }
        language(id: $lang) {
          partsOfSpeech { id, name }
        }
      }`,
      {id, lang},
      expectData({
        partOfSpeech: {name: 'Noun'},
        language: {
          partsOfSpeech: [{id, name: 'Noun'}],
        },
      })
    );
  }));

  it('adds several parts of speech to the same language', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id1, id2} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        pos1: addPartOfSpeech(data: {
          languageId: $lang
          name: "A"
        }) { id, name }
        pos2: addPartOfSpeech(data: {
          languageId: $lang
          name: "B"
        }) { id, name }
      }`,
      {lang},
      expectData({
        pos1: {id: capture('id1'), name: 'A'},
        pos2: {id: capture('id2'), name: 'B'},
      })
    );
    await assertOperationResult(
      server,
      `query($id1: PartOfSpeechId!, $id2: PartOfSpeechId!, $lang: LanguageId!) {
        pos1: partOfSpeech(id: $id1) { id, name }
        pos2: partOfSpeech(id: $id2) { id, name }
        language(id: $lang) {
          partsOfSpeech { id, name }
        }
      }`,
      {id1, id2, lang},
      expectData({
        pos1: {id: id1, name: 'A'},
        pos2: {id: id2, name: 'B'},
        language: {
          partsOfSpeech: [
            {id: id1, name: 'A'},
            {id: id2, name: 'B'},
          ],
        },
      })
    );
  }));

  it('adds several parts of speech to different languages', withServer(async server => {
    const lang1 = await addLanguage(server, 'ALang');
    const lang2 = await addLanguage(server, 'BLang');
    // The parts of speech have different names so we can make sure the data
    // ends up under the correct language. We test for identical names in
    // different languages in the next test.
    const {id1, id2} = await assertOperationResult(
      server,
      `mutation($lang1: LanguageId!, $lang2: LanguageId!) {
        pos1: addPartOfSpeech(data: {
          languageId: $lang1
          name: "A"
        }) { id, name }
        pos2: addPartOfSpeech(data: {
          languageId: $lang2
          name: "B"
        }) { id, name }
      }`,
      {lang1, lang2},
      expectData({
        pos1: {id: capture('id1'), name: 'A'},
        pos2: {id: capture('id2'), name: 'B'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: PartOfSpeechId!
        $id2: PartOfSpeechId!
        $lang1: LanguageId!
        $lang2: LanguageId!
      ) {
        pos1: partOfSpeech(id: $id1) { id, name }
        pos2: partOfSpeech(id: $id2) { id, name }
        lang1: language(id: $lang1) {
          partsOfSpeech { id, name }
        }
        lang2: language(id: $lang2) {
          partsOfSpeech { id, name }
        }
      }`,
      {id1, id2, lang1, lang2},
      expectData({
        pos1: {id: id1, name: 'A'},
        pos2: {id: id2, name: 'B'},
        lang1: {
          partsOfSpeech: [{id: id1, name: 'A'}],
        },
        lang2: {
          partsOfSpeech: [{id: id2, name: 'B'}],
        },
      })
    );
  }));

  it('allows identically named parts of speech in different languages', withServer(async server => {
    const lang1 = await addLanguage(server, 'ALang');
    const lang2 = await addLanguage(server, 'BLang');
    const {id1, id2} = await assertOperationResult(
      server,
      `mutation($lang1: LanguageId!, $lang2: LanguageId!) {
        pos1: addPartOfSpeech(data: {
          languageId: $lang1
          name: "Noun"
        }) { id, name }
        pos2: addPartOfSpeech(data: {
          languageId: $lang2
          name: "Noun"
        }) { id, name }
      }`,
      {lang1, lang2},
      expectData({
        pos1: {id: capture('id1'), name: 'Noun'},
        pos2: {id: capture('id2'), name: 'Noun'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: PartOfSpeechId!
        $id2: PartOfSpeechId!
        $lang1: LanguageId!
        $lang2: LanguageId!
      ) {
        pos1: partOfSpeech(id: $id1) { id, name }
        pos2: partOfSpeech(id: $id2) { id, name }
        lang1: language(id: $lang1) {
          partsOfSpeech { id, name }
        }
        lang2: language(id: $lang2) {
          partsOfSpeech { id, name }
        }
      }`,
      {id1, id2, lang1, lang2},
      expectData({
        pos1: {id: id1, name: 'Noun'},
        pos2: {id: id2, name: 'Noun'},
        lang1: {
          partsOfSpeech: [{id: id1, name: 'Noun'}],
        },
        lang2: {
          partsOfSpeech: [{id: id2, name: 'Noun'}],
        },
      })
    );
  }));

  it('trims the name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const {id1, id2, id3} = await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        pos1: addPartOfSpeech(data: {
          languageId: $lang
          name: "   Trim start"
        }) { id, name }
        pos2: addPartOfSpeech(data: {
          languageId: $lang
          name: "Trim end   "
        }) { id, name }
        pos3: addPartOfSpeech(data: {
          languageId: $lang
          name: "  Trim both "
        }) { id, name }
      }`,
      {lang},
      expectData({
        pos1: {id: capture('id1'), name: 'Trim start'},
        pos2: {id: capture('id2'), name: 'Trim end'},
        pos3: {id: capture('id3'), name: 'Trim both'},
      })
    );
    await assertOperationResult(
      server,
      `query(
        $id1: PartOfSpeechId!
        $id2: PartOfSpeechId!
        $id3: PartOfSpeechId!
        $lang: LanguageId!
      ) {
        pos1: partOfSpeech(id: $id1) { id, name }
        pos2: partOfSpeech(id: $id2) { id, name }
        pos3: partOfSpeech(id: $id3) { id, name }
        language(id: $lang) {
          partsOfSpeech { id, name }
        }
      }`,
      {id1, id2, id3, lang},
      expectData({
        pos1: {id: id1, name: 'Trim start'},
        pos2: {id: id2, name: 'Trim end'},
        pos3: {id: id3, name: 'Trim both'},
        language: {
          // Parts of speech are ordered alphabetically, not by ID.
          partsOfSpeech: [
            {id: id3, name: 'Trim both'},
            {id: id2, name: 'Trim end'},
            {id: id1, name: 'Trim start'},
          ],
        }
      })
    );
  }));

  it('rejects the empty name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addPartOfSpeech(data: {
          languageId: $lang
          name: ""
        }) { id }
      }`,
      {lang},
      {
        data: {addPartOfSpeech: null},
        errors: [inputError(
          'Part of speech name cannot be empty',
          'addPartOfSpeech',
          'name',
        )],
      }
    );
    await assertNoPartsOfSpeech(server, lang);
  }));

  it('rejects a white space-only name', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addPartOfSpeech(data: {
          languageId: $lang
          name: "     "
        }) { id }
      }`,
      {lang},
      {
        data: {addPartOfSpeech: null},
        errors: [inputError(
          'Part of speech name cannot be empty',
          'addPartOfSpeech',
          'name',
        )],
      }
    );
    await assertNoPartsOfSpeech(server, lang);
  }));

  it('rejects duplicate names', withServer(async server => {
    const lang = await addLanguage(server, 'Language');
    const mut =
      `mutation($lang: LanguageId!) {
        addPartOfSpeech(data: {
          languageId: $lang
          name: "Verb"
        }) { id }
      }`;
    const {id} = await assertOperationResult(
      server,
      mut,
      {lang},
      expectData({
        addPartOfSpeech: {id: capture('id')},
      })
    );
    await assertOperationResult(
      server,
      mut,
      {lang},
      {
        data: {addPartOfSpeech: null},
        errors: [inputError(
          "The language already has a part of speech named 'Verb'",
          'addPartOfSpeech',
          'name',
          {existingId: id}
        )],
      }
    );
    await assertOperationResult(
      server,
      `query($lang: LanguageId!) {
        language(id: $lang) {
          partsOfSpeech { id }
        }
      }`,
      {lang},
      expectData({
        language: {
          partsOfSpeech: [{id}],
        },
      })
    );
  }));

  it('rejects an invalid language ID', withServer(async server => {
    await assertOperationResult(
      server,
      `mutation($lang: LanguageId!) {
        addPartOfSpeech(data: {
          languageId: $lang
          name: "Verb"
        }) { id }
      }`,
      {lang: 123},
      {
        data: {addPartOfSpeech: null},
        errors: [inputError(
          'Language not found: 123',
          'addPartOfSpeech',
          'languageId'
        )],
      }
    );
  }));
});
